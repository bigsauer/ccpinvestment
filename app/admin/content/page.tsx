import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";
import { EDITABLE_PAGES } from "@/lib/site-pages";

export default async function AdminContentPage() {
  const rows = await prisma.pageContent.findMany();
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  return (
    <>
      <Topbar crumbs={["Admin", "Site content"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Page wording, <span className="serif">in plain fields.</span>
            </h1>
            <p className="sub">
              Change the big headline and intro line on each page. Anything you leave empty keeps the designed wording. Speakers, meetings, members and officers are edited from their own pages in the sidebar; club details and the home page numbers are in Settings.
            </p>
          </div>
        </div>
        <div className="content-pages">
          {EDITABLE_PAGES.map((page) => {
            const row = bySlug.get(page.slug);
            const blocks = (row?.blocks ?? {}) as Record<string, unknown>;
            const edited = ["crumbs", "headline", "serif", "lede"].filter((key) => typeof blocks[key] === "string" && blocks[key]);
            return (
              <Link key={page.slug} href={`/admin/content/${page.slug}`} className="content-page-card">
                <div className="top">
                  <span className={`pill ${row?.status === "LIVE" && edited.length > 0 ? "green" : "gray"}`}>
                    {row?.status === "LIVE" && edited.length > 0 ? "Custom wording" : "Designed wording"}
                  </span>
                </div>
                <div className="url">{page.path}</div>
                <div className="ttl">{page.title}</div>
                <div className="blocks">
                  {edited.map((key) => (
                    <span key={key} className="b">
                      {key}
                    </span>
                  ))}
                </div>
                <div className="foot">
                  <span>{row ? `Updated ${row.updatedAt.toLocaleDateString("en-US")}` : "Not edited yet"}</span>
                  <span className="a">Edit →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
