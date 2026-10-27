import Link from "next/link";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Topbar } from "@/components/admin/Topbar";
import { duplicatePage } from "@/lib/actions/pages";
import { SYSTEM_PAGES, SYSTEM_SLUGS } from "@/lib/default-pages";
import { prisma } from "@/lib/db";
import { relativeWhen } from "@/lib/utils";

export default async function PagesAdmin() {
  const all = await prisma.customPage.findMany({ orderBy: { updatedAt: "desc" } });
  const pages = all.filter((p) => !SYSTEM_SLUGS.includes(p.slug as never));
  const systemRows = new Map(all.filter((p) => SYSTEM_SLUGS.includes(p.slug as never)).map((p) => [p.slug, p]));

  return (
    <>
      <Topbar crumbs={["Admin", "Pages"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Build new pages, <span className="serif">no code.</span>
            </h1>
            <p className="sub">
              Make a page for a new program, an event, an FAQ, a sponsor thank-you, anything. Stack sections like text, photos, cards and buttons, preview it, then publish. Add it to the menu from Navigation.
            </p>
          </div>
          <div className="r">
            <Link href="/admin/pages/new" className="btn red">
              + New page
            </Link>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-head">
            <h3>The club&apos;s own pages</h3>
            <div className="desc">built with the same sections</div>
          </div>
          <table className="table">
            <tbody>
              {SYSTEM_PAGES.map((def) => {
                const row = systemRows.get(def.slug);
                return (
                  <tr key={def.slug} className="row">
                    <td>
                      <Link className="tbl-link" href={`/admin/pages/${def.slug}`}>
                        {def.slug === "home" ? "Home" : def.slug === "get-involved" ? "Get involved" : def.slug[0]!.toUpperCase() + def.slug.slice(1)}
                      </Link>
                    </td>
                    <td className="row-sub">{def.path}</td>
                    <td>
                      <span className="pill green">Built-in</span> {row && row.updatedBy !== "Original design" ? <span className="pill amber">Edited</span> : <span className="pill gray">Original</span>}
                    </td>
                    <td>{row && row.updatedBy !== "Original design" ? relativeWhen(row.updatedAt) : "—"}</td>
                    <td className="cell-actions">
                      <Link className="btn" href={`/admin/pages/${def.slug}`}>
                        Edit
                      </Link>{" "}
                      <Link className="btn" href={def.path} target="_blank">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h3 style={{ margin: "8px 0 12px" }}>Pages you&apos;ve built</h3>
        {pages.length === 0 ? (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ marginBottom: 6 }}>No pages yet</h3>
            <p className="admin-note" style={{ marginBottom: 14 }}>
              Make one for a program, an event, an FAQ or a thank-you. It can use any of the sections above, including the ones the club&apos;s own pages are made from.
            </p>
            <Link href="/admin/pages/new" className="btn red">
              Create the first page
            </Link>
          </div>
        ) : (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} className="row">
                    <td>
                      <Link className="tbl-link" href={`/admin/pages/${page.id}`}>
                        {page.title}
                      </Link>
                    </td>
                    <td className="row-sub">/{page.slug}</td>
                    <td>{page.status === "LIVE" ? <span className="pill green">Published</span> : <span className="pill gray">Draft</span>}</td>
                    <td>
                      {relativeWhen(page.updatedAt)}
                      {page.updatedBy ? <div className="row-sub">{page.updatedBy}</div> : null}
                    </td>
                    <td className="cell-actions">
                      <Link className="btn" href={`/admin/pages/${page.id}`}>
                        Edit
                      </Link>{" "}
                      {page.status === "LIVE" ? (
                        <Link className="btn" href={`/${page.slug}`} target="_blank">
                          View
                        </Link>
                      ) : null}{" "}
                      <ConfirmAction action={duplicatePage.bind(null, page.id)}>Duplicate</ConfirmAction>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
