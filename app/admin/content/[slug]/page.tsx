import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Topbar } from "@/components/admin/Topbar";
import { resetPageCopy, savePageCopy } from "@/lib/actions/admin";
import { asStringBlocks } from "@/lib/copy";
import { prisma } from "@/lib/db";
import { EDITABLE_PAGES } from "@/lib/site-pages";

export default async function EditContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = EDITABLE_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();
  const row = await prisma.pageContent.findUnique({ where: { slug } });
  const blocks = asStringBlocks(row?.blocks);

  return (
    <>
      <Topbar crumbs={["Admin", "Site content", page.title]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              {page.title} <span className="serif">page wording.</span>
            </h1>
            <p className="sub">
              The grey text in each box is what the page shows now. Type to replace it; clear a box to go back to it. Changes show within a minute.
            </p>
          </div>
          <div className="r">
            <Link href="/admin/content" className="btn">
              ← All pages
            </Link>
            <Link href={page.path} target="_blank" className="btn">
              View page
            </Link>
          </div>
        </div>

        <div className="card" style={{ padding: 22, maxWidth: 820 }}>
          <AdminForm action={savePageCopy} submitLabel="Save wording">
            <input type="hidden" name="slug" value={page.slug} />
            <input type="hidden" name="status" value="LIVE" />
            {page.hasCrumbs ? (
              <div className="field">
                <label>Small line above the headline</label>
                <input name="crumbs" defaultValue={blocks.crumbs ?? ""} placeholder={page.defaults.crumbs} />
              </div>
            ) : null}
            <div className="field-row">
              <div className="field">
                <label>Headline</label>
                <input name="headline" defaultValue={blocks.headline ?? ""} placeholder={page.defaults.headline} />
              </div>
              <div className="field">
                <label>Italic ending of the headline (optional)</label>
                <input name="serif" defaultValue={blocks.serif ?? ""} placeholder={page.defaults.serif} />
              </div>
            </div>
            <div className="field-help" style={{ marginBottom: 14 }}>
              If you set a headline, it replaces the designed one. Leave the headline empty to keep the designed headline, and its italic ending.
            </div>
            <div className="field">
              <label>Intro paragraph</label>
              <textarea name="lede" defaultValue={blocks.lede ?? ""} placeholder={page.defaults.lede} style={{ minHeight: 120 }} />
            </div>
          </AdminForm>
          {row ? (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <ConfirmAction action={resetPageCopy.bind(null, page.slug)} confirm="Clear all custom wording on this page and go back to the designed wording?" className="btn danger">
                Reset to the designed wording
              </ConfirmAction>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
