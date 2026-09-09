import { notFound } from "next/navigation";
import { savePageContent } from "@/lib/actions/admin";
import { WriteFieldset } from "@/components/admin/WriteGate";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";

export default async function EditContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.pageContent.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <>
      <Topbar crumbs={["Admin", "Site content", page.title]} />
      <div className="admin-page">
        <form action={savePageContent} className="editor">
          <WriteFieldset>
          <div className="editor-fields">
            <input type="hidden" name="slug" value={page.slug} />
            <div className="field-group">
              <div className="group-h">Page</div>
              <div className="field">
                <label>Title</label>
                <input name="title" defaultValue={page.title} />
              </div>
              <div className="field">
                <label>Path</label>
                <input name="path" defaultValue={page.path} />
              </div>
              <div className="field">
                <label>Blocks (JSON)</label>
                <textarea name="blocks" defaultValue={JSON.stringify(page.blocks, null, 2)} style={{ minHeight: 280 }} />
                <div className="note" style={{ marginTop: 8 }}>
                  Live pages read string keys: <code>crumbs</code>, <code>headline</code>, <code>serif</code>,{" "}
                  <code>lede</code>. Leave headline empty to keep the designed title.
                </div>
              </div>
            </div>
          </div>
          <div className="editor-side">
            <div className="editor-card">
              <div className="h">Publish</div>
              <select name="status" defaultValue={page.status} className="field">
                <option value="LIVE">Live</option>
                <option value="DRAFT">Draft</option>
              </select>
              <div className="publish-row" style={{ marginTop: 12 }}>
                <button className="btn red" type="submit">
                  Save
                </button>
              </div>
            </div>
          </div>
          </WriteFieldset>
        </form>
      </div>
    </>
  );
}
