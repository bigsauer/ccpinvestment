import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { PageBuilder } from "@/components/admin/PageBuilder";
import { PhotoField } from "@/components/admin/PhotoField";
import { Topbar } from "@/components/admin/Topbar";
import { deletePage, resetSystemPage, savePage } from "@/lib/actions/pages";
import { prisma } from "@/lib/db";
import { SYSTEM_SLUGS, isSystemSlug, systemPageDef } from "@/lib/default-pages";
import { BUILT_IN_PAGES } from "@/lib/nav";
import { sanitizeBlocks } from "@/lib/page-blocks";

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const isSystem = isSystemSlug(id);
  const sysDef = isSystem ? systemPageDef(id) : null;
  const [row, others] = await Promise.all([
    isNew ? null : isSystem ? prisma.customPage.findUnique({ where: { slug: id } }) : prisma.customPage.findUnique({ where: { id } }),
    prisma.customPage.findMany({ where: { slug: { notIn: SYSTEM_SLUGS } }, select: { slug: true, title: true } }),
  ]);
  if (!isNew && !isSystem && !row) notFound();
  // A built-in page that has not been edited yet shows its original design.
  const page = row ?? (sysDef ? { id: sysDef.slug, slug: sysDef.slug, title: sysDef.title, description: sysDef.description, bannerUrl: null, bannerX: 50, bannerY: 30, blocks: sysDef.blocks as unknown, status: "LIVE" as const, updatedBy: null, createdAt: new Date(), updatedAt: new Date() } : null);

  const links = [...BUILT_IN_PAGES, ...others.map((p) => ({ href: `/${p.slug}`, label: p.title }))];

  return (
    <>
      <Topbar crumbs={["Admin", "Pages", page ? page.title : "New page"]} />
      <div className="admin-page" style={{ maxWidth: 1500 }}>
        <div className="admin-head">
          <div className="l">
            <h1>
              {page ? "Edit" : "Build a"} <span className="serif">page.</span>
            </h1>
            <p className="sub">
              {isSystem
                ? "This is one of the club's own pages. It is built from the same sections you can add to any page. Changes go live when you save."
                : "Save it as a draft while you work. Choose “Published” when it is ready for visitors."}
            </p>
          </div>
          <div className="r">
            <Link href="/admin/pages" className="btn">
              ← All pages
            </Link>
            {page?.status === "LIVE" ? (
              <Link href={isSystem ? sysDef!.path : `/${page.slug}`} target="_blank" className="btn">
                View live page
              </Link>
            ) : null}
          </div>
        </div>

        <AdminForm action={savePage} submitLabel="Save page" pendingLabel="Saving…">
          {isSystem ? <input type="hidden" name="system" value={id} /> : page ? <input type="hidden" name="id" value={page.id} /> : null}
          {isSystem ? (
            <div className="card" style={{ padding: 22, marginBottom: 20 }}>
              <div className="field-row">
                <div className="field">
                  <label>Title in search results and browser tabs</label>
                  <input name="title" defaultValue={page?.title} required />
                </div>
                <div className="field">
                  <label>Short description for search and sharing</label>
                  <textarea name="description" defaultValue={page?.description} maxLength={300} style={{ minHeight: 70 }} />
                </div>
              </div>
              <div className="field-help">
                Banner and home-page photos are changed under <Link href="/admin/images">Site images</Link>. Numbers on the home page come from <Link href="/admin/settings/site">Settings</Link>.
              </div>
            </div>
          ) : (
          <div className="card" style={{ padding: 22, marginBottom: 20 }}>
            <div className="field-row">
              <div className="field">
                <label>Page title</label>
                <input name="title" defaultValue={page?.title} required placeholder="e.g. Sponsors" />
              </div>
              <div className="field">
                <label>Address</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="admin-note">…/</span>
                  <input name="slug" defaultValue={page?.slug} placeholder="made from the title" pattern="[a-z0-9][a-z0-9-]*" />
                </div>
                <div className="field-help">Lowercase letters, numbers and dashes. Leave empty to build it from the title.</div>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Short description (shown under the title and in search results)</label>
                <textarea name="description" defaultValue={page?.description} maxLength={300} style={{ minHeight: 70 }} />
              </div>
              <div className="field">
                <label>Visibility</label>
                <select name="status" defaultValue={page?.status ?? "DRAFT"}>
                  <option value="DRAFT">Draft (only officers can see it)</option>
                  <option value="LIVE">Published (visible to everyone)</option>
                </select>
                <div style={{ marginTop: 14 }}>
                  <PhotoField name="bannerUrl" label="Banner photo behind the title (optional)" defaultValue={page?.bannerUrl} />
                  <input type="hidden" name="bannerX" value={page?.bannerX ?? 50} />
                  <input type="hidden" name="bannerY" value={page?.bannerY ?? 30} />
                </div>
              </div>
            </div>
          </div>
          )}

          <PageBuilder initial={page ? sanitizeBlocks(page.blocks) : []} links={links} />
        </AdminForm>

        {isSystem && row ? (
          <div className="card" style={{ padding: 20, marginTop: 24, maxWidth: 520 }}>
            <h3 style={{ marginBottom: 6 }}>Go back to the original</h3>
            <p className="admin-note" style={{ marginBottom: 12 }}>Throws away your changes to this page and restores the original design and wording.</p>
            <ConfirmAction action={resetSystemPage.bind(null, id)} confirm="Put this page back exactly as it was originally? Your changes to it will be lost." className="btn danger" redirectTo="/admin/pages">
              Reset to the original
            </ConfirmAction>
          </div>
        ) : null}

        {page && !isSystem ? (
          <div className="card" style={{ padding: 20, marginTop: 24, maxWidth: 520 }}>
            <h3 style={{ marginBottom: 6 }}>Delete this page</h3>
            <p className="admin-note" style={{ marginBottom: 12 }}>The page and its menu link are removed for good. To hide it for now, set it to Draft instead.</p>
            <ConfirmAction action={deletePage.bind(null, page.id)} confirm={`Delete “${page.title}”? This cannot be undone.`} className="btn danger">
              Delete page
            </ConfirmAction>
          </div>
        ) : null}
      </div>
    </>
  );
}
