"use server";

import { revalidatePath } from "next/cache";
import { PageStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import { logActivity, requireWriter } from "@/lib/guard";
import { isSystemSlug, systemPageDef } from "@/lib/default-pages";
import { sanitizeNav } from "@/lib/nav";
import { checkSlug, cleanImagePath, sanitizeBlocks, slugify } from "@/lib/page-blocks";
import { done, fail, revalidateAdmin, revalidatePublic, str } from "@/lib/actions/util";

function refreshSite(slug?: string) {
  revalidatePath("/", "layout"); // the menu and footer appear on every page
  revalidatePublic();
  if (slug) revalidatePath(`/${slug}`);
}

/* ───────────── Built pages ───────────── */

export async function savePage(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await requireWriter();
    const system = str(formData, "system");
    if (system) return await saveSystemPage(user.name, system, formData);
    const id = str(formData, "id");
    const title = str(formData, "title");
    if (!title) throw new Error("Give the page a title.");
    const slug = str(formData, "slug") || slugify(title);
    const slugProblem = checkSlug(slug);
    if (slugProblem) throw new Error(slugProblem);

    const taken = await prisma.customPage.findUnique({ where: { slug }, select: { id: true } });
    if (taken && taken.id !== id) throw new Error(`The address /${slug} is already used by another page.`);

    let parsed: unknown = [];
    try {
      parsed = JSON.parse(str(formData, "blocks") || "[]");
    } catch {
      throw new Error("The page content could not be read. Reload the page and try again.");
    }
    const blocks = sanitizeBlocks(parsed);
    const clamp = (raw: string, fallback: number) => {
      const n = Math.round(Number(raw));
      return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
    };
    const status: PageStatus = str(formData, "status") === "LIVE" ? "LIVE" : "DRAFT";
    const data = {
      slug,
      title: title.slice(0, 120),
      description: str(formData, "description").slice(0, 300),
      bannerUrl: cleanImagePath(str(formData, "bannerUrl")) || null,
      bannerX: clamp(str(formData, "bannerX"), 50),
      bannerY: clamp(str(formData, "bannerY"), 30),
      blocks: blocks as unknown as Prisma.InputJsonValue,
      status,
      updatedBy: user.name,
    };

    const before = id ? await prisma.customPage.findUnique({ where: { id }, select: { slug: true } }) : null;
    const page = id ? await prisma.customPage.update({ where: { id }, data }) : await prisma.customPage.create({ data });
    await logActivity(user, `Page ${id ? "saved" : "created"} — ${data.title} (${status === "LIVE" ? "published" : "draft"})`, "Page", page.id);
    // If the address changed, the old address must stop working right away.
    if (before && before.slug !== slug) revalidatePath(`/${before.slug}`);
    revalidateAdmin();
    refreshSite(slug);
    if (!id) return { ok: true, message: "Page created", redirectTo: `/admin/pages/${page.id}` };
    return done(status === "LIVE" ? "Saved and published. It is live within a minute." : "Saved as a draft. Visitors can't see it yet.");
  } catch (error) {
    return fail(error);
  }
}

/** Saves one of the club's own pages (home, meetings, ...). Its address and visibility stay fixed. */
async function saveSystemPage(actorName: string, slug: string, formData: FormData): Promise<FormState> {
  if (!isSystemSlug(slug)) throw new Error("Unknown page");
  const def = systemPageDef(slug)!;
  let parsed: unknown = [];
  try {
    parsed = JSON.parse(str(formData, "blocks") || "[]");
  } catch {
    throw new Error("The page content could not be read. Reload the page and try again.");
  }
  const blocks = sanitizeBlocks(parsed);
  if (blocks.length === 0) throw new Error("A page needs at least one section. Use “Reset to the original” to start over.");
  const data = {
    title: str(formData, "title").slice(0, 120) || def.title,
    description: str(formData, "description").slice(0, 300) || def.description,
    blocks: blocks as unknown as Prisma.InputJsonValue,
    status: "LIVE" as PageStatus,
    updatedBy: actorName,
  };
  await prisma.customPage.upsert({
    where: { slug },
    create: { slug, bannerUrl: null, ...data },
    update: data,
  });
  await logActivity(actorName, `Page saved — ${def.title}`, "Page", slug);
  revalidateAdmin();
  refreshSite(slug === "home" ? undefined : slug);
  revalidatePath(def.path);
  return done("Saved. It is live within a minute.");
}

/** Puts one of the club's own pages back to its original design and wording. */
export async function resetSystemPage(slug: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const def = isSystemSlug(slug) ? systemPageDef(slug) : null;
    if (!def) throw new Error("Unknown page");
    await prisma.customPage.upsert({
      where: { slug },
      create: { slug, title: def.title, description: def.description, blocks: def.blocks as unknown as Prisma.InputJsonValue, status: "LIVE", updatedBy: "Original design" },
      update: { title: def.title, description: def.description, blocks: def.blocks as unknown as Prisma.InputJsonValue, status: "LIVE", updatedBy: "Original design" },
    });
    await logActivity(user, `Page put back to the original — ${def.title}`, "Page", slug);
    revalidateAdmin();
    refreshSite(slug === "home" ? undefined : slug);
    revalidatePath(def.path);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deletePage(id: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const page = await prisma.customPage.findUnique({ where: { id } });
    if (!page) throw new Error("Page not found");
    if (isSystemSlug(page.slug)) throw new Error("This is one of the club's own pages. It can be edited or reset, not deleted.");
    await prisma.customPage.delete({ where: { id } });
    // A menu link that pointed at it would now lead nowhere, so drop it.
    await prisma.navItem.deleteMany({ where: { href: `/${page.slug}` } });
    await logActivity(user, `Page deleted — ${page.title}`, "Page", id);
    revalidateAdmin();
    refreshSite(page.slug);
    return { ok: true, redirectTo: "/admin/pages" };
  } catch (error) {
    return fail(error);
  }
}

export async function duplicatePage(id: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const source = await prisma.customPage.findUnique({ where: { id } });
    if (!source) throw new Error("Page not found");
    if (isSystemSlug(source.slug)) throw new Error("Built-in pages can't be duplicated. Use “Reset to the original” to undo changes.");
    let slug = `${source.slug}-copy`.slice(0, 60);
    for (let n = 2; await prisma.customPage.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${source.slug}-copy-${n}`.slice(0, 60);
    const copy = await prisma.customPage.create({
      data: {
        slug,
        title: `${source.title} (copy)`.slice(0, 120),
        description: source.description,
        bannerUrl: source.bannerUrl,
        bannerX: source.bannerX,
        bannerY: source.bannerY,
        blocks: source.blocks as Prisma.InputJsonValue,
        status: "DRAFT",
        updatedBy: user.name,
      },
    });
    await logActivity(user, `Page duplicated — ${source.title}`, "Page", copy.id);
    revalidateAdmin();
    return { ok: true, redirectTo: `/admin/pages/${copy.id}` };
  } catch (error) {
    return fail(error);
  }
}

/* ───────────── The site menu ───────────── */

export async function saveNavigation(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await requireWriter();
    let parsed: unknown = [];
    try {
      parsed = JSON.parse(str(formData, "items") || "[]");
    } catch {
      throw new Error("The menu could not be read. Reload the page and try again.");
    }
    const items = sanitizeNav(parsed);
    if (items.length === 0) throw new Error("The menu needs at least one link.");
    if (!items.some((i) => i.visible)) throw new Error("Show at least one link in the menu.");
    await prisma.$transaction([
      prisma.navItem.deleteMany(),
      prisma.navItem.createMany({ data: items.map((item, position) => ({ label: item.label, href: item.href, visible: item.visible, position })) }),
    ]);
    await logActivity(user, "Site menu updated", "NavItem");
    revalidateAdmin();
    refreshSite();
    return done("Menu saved. It updates on every page within a minute.");
  } catch (error) {
    return fail(error);
  }
}

export async function resetNavigation(): Promise<FormState> {
  try {
    const user = await requireWriter();
    await prisma.navItem.deleteMany();
    await logActivity(user, "Site menu put back to the original", "NavItem");
    revalidateAdmin();
    refreshSite();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
