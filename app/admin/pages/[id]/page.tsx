import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { PageBuilder } from "@/components/admin/PageBuilder";
import { PhotoField } from "@/components/admin/PhotoField";
import { Topbar } from "@/components/admin/Topbar";
import { deletePage, savePage } from "@/lib/actions/pages";
import { prisma } from "@/lib/db";
import { BUILT_IN_PAGES } from "@/lib/nav";
import { sanitizeBlocks } from "@/lib/page-blocks";

export default async function PageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [page, others] = await Promise.all([
    isNew ? null : prisma.customPage.findUnique({ where: { id } }),
    prisma.customPage.findMany({ select: { slug: true, title: true } }),
  ]);
  if (!isNew && !page) notFound();

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
            <p className="sub">Save it as a draft while you work. Choose “Published” when it is ready for visitors.</p>
          </div>
          <div className="r">
            <Link href="/admin/pages" className="btn">
              ← All pages
            </Link>
            {page?.status === "LIVE" ? (
              <Link href={`/${page.slug}`} target="_blank" className="btn">
                View live page
              </Link>
            ) : null}
          </div>
        </div>

        <AdminForm action={savePage} submitLabel="Save page" pendingLabel="Saving…">
          {page ? <input type="hidden" name="id" value={page.id} /> : null}
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

          <PageBuilder initial={page ? sanitizeBlocks(page.blocks) : []} links={links} />
        </AdminForm>

        {page ? (
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
