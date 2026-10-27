import Link from "next/link";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Topbar } from "@/components/admin/Topbar";
import { duplicatePage } from "@/lib/actions/pages";
import { prisma } from "@/lib/db";
import { relativeWhen } from "@/lib/utils";

export default async function PagesAdmin() {
  const pages = await prisma.customPage.findMany({ orderBy: { updatedAt: "desc" } });

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

        {pages.length === 0 ? (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ marginBottom: 6 }}>No pages yet</h3>
            <p className="admin-note" style={{ marginBottom: 14 }}>
              The built-in pages (Home, Meetings, Speakers, Get involved, Team) are edited from Site content and their own sections. This is for everything else.
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
