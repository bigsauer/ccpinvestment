import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";
import { relativeWhen } from "@/lib/utils";

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type = "" } = await searchParams;
  const types = (await prisma.activityLog.findMany({ distinct: ["targetType"], select: { targetType: true }, orderBy: { targetType: "asc" } })).map((t) => t.targetType);
  const rows = await prisma.activityLog.findMany({
    where: type ? { targetType: type } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <Topbar crumbs={["Admin", "Activity log"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Everything <span className="serif">that changed.</span>
            </h1>
            <p className="sub">Who did what, newest first. The last 200 entries.</p>
          </div>
        </div>
        <form className="admin-toolbar" method="get">
          <select name="type" defaultValue={type} className="admin-search" style={{ minWidth: 0 }}>
            <option value="">All activity</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button className="btn" type="submit">
            Filter
          </button>
        </form>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>What</th>
                <th>Who</th>
                <th>Area</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="row">
                  <td title={row.createdAt.toLocaleString("en-US", { timeZone: "America/Chicago" })}>{relativeWhen(row.createdAt)}</td>
                  <td className="strong">{row.action}</td>
                  <td>{row.actor}</td>
                  <td>
                    <span className="pill gray">{row.targetType}</span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-note" style={{ padding: 24 }}>
                    Nothing logged yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
