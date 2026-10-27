import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { NavEditor } from "@/components/admin/NavEditor";
import { Topbar } from "@/components/admin/Topbar";
import { resetNavigation, saveNavigation } from "@/lib/actions/pages";
import { prisma } from "@/lib/db";
import { BUILT_IN_PAGES, DEFAULT_NAV } from "@/lib/nav";

export default async function NavigationPage() {
  const [rows, pages] = await Promise.all([
    prisma.navItem.findMany({ orderBy: { position: "asc" } }),
    prisma.customPage.findMany({ where: { status: "LIVE" }, select: { slug: true, title: true }, orderBy: { title: "asc" } }),
  ]);
  const customised = rows.length > 0;
  const initial = customised ? rows.map((r) => ({ label: r.label, href: r.href, visible: r.visible })) : DEFAULT_NAV.map((l) => ({ ...l, visible: true }));
  const options = [
    ...BUILT_IN_PAGES.map((p) => ({ ...p, group: "Site pages" })),
    ...pages.map((p) => ({ href: `/${p.slug}`, label: p.title, group: "Pages you built" })),
  ];

  return (
    <>
      <Topbar crumbs={["Admin", "Navigation"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              The site menu, <span className="serif">your order.</span>
            </h1>
            <p className="sub">Choose what shows across the top of every page and in the footer. Add the pages you build, rename links, reorder or hide them.</p>
          </div>
        </div>
        <div className="card" style={{ padding: 22, maxWidth: 920 }}>
          <AdminForm action={saveNavigation} submitLabel="Save menu" pendingLabel="Saving…">
            <NavEditor initial={initial} options={options} />
          </AdminForm>
          {customised ? (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <ConfirmAction action={resetNavigation} confirm="Put the original menu back?" className="btn danger">
                Put the original menu back
              </ConfirmAction>
            </div>
          ) : (
            <p className="admin-note" style={{ marginTop: 14 }}>You are using the original menu. Saving makes it yours.</p>
          )}
        </div>
      </div>
    </>
  );
}
