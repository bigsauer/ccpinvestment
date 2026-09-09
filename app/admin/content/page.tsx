import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";

export default async function AdminContentPage() {
  const pages = await prisma.pageContent.findMany({ orderBy: { path: "asc" } });

  return (
    <>
      <Topbar crumbs={["Admin", "Site content"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Pages, <span className="serif">block by block.</span>
            </h1>
            <p className="sub">Simple JSON fields per route. Publish to mark a page live.</p>
          </div>
        </div>
        <div className="content-pages">
          {pages.map((page) => {
            const blocks = page.blocks as Record<string, unknown>;
            return (
              <Link key={page.slug} href={`/admin/content/${page.slug}`} className="content-page-card">
                <div className="top">
                  <span className={`pill ${page.status === "LIVE" ? "green" : "amber"}`}>{page.status}</span>
                </div>
                <div className="url">{page.path}</div>
                <div className="ttl">{page.title}</div>
                <div className="blocks">
                  {Object.keys(blocks).map((key) => (
                    <span key={key} className="b">
                      {key}
                    </span>
                  ))}
                </div>
                <div className="foot">
                  <span>Updated {page.updatedAt.toLocaleDateString()}</span>
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
