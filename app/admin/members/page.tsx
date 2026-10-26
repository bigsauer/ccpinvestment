import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";

export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<{ q?: string; show?: string }> }) {
  const { q = "", show = "all" } = await searchParams;
  const term = q.trim();
  const [members, counts] = await Promise.all([
    prisma.member.findMany({
      where: {
        ...(show === "active" ? { status: "ACTIVE" as const } : show === "pending" ? { status: "PENDING" as const } : show === "alum" ? { status: "ALUM" as const } : {}),
        ...(term
          ? {
              OR: [
                { firstName: { contains: term, mode: "insensitive" as const } },
                { lastName: { contains: term, mode: "insensitive" as const } },
                { email: { contains: term, mode: "insensitive" as const } },
                { gradYear: { contains: term } },
              ],
            }
          : {}),
      },
      orderBy: [{ gradYear: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.member.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <>
      <Topbar crumbs={["Admin", "Members"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Roster, <span className="serif">kept current.</span>
            </h1>
            <p className="sub">
              {count("ACTIVE")} active · {count("PENDING")} pending · {count("ALUM")} alumni. Approving a student inquiry adds them here. Members with a photo appear on the public Team page.
            </p>
          </div>
          <div className="r">
            {/* A file download, so a plain link is right. */}
            <a href="/admin/export/members" className="btn" download>
              Export CSV
            </a>
            <Link href="/admin/members/new" className="btn red">
              + Add member
            </Link>
          </div>
        </div>

        <form className="admin-toolbar" method="get">
          <input className="admin-search" name="q" defaultValue={term} placeholder="Search name, email, class…" />
          <select name="show" defaultValue={show} className="admin-search" style={{ minWidth: 0 }}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="alum">Alumni</option>
          </select>
          <button className="btn" type="submit">
            Filter
          </button>
          <span className="admin-note grow">{members.length} shown</span>
        </form>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Status</th>
                <th>On Team page</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="row">
                  <td>
                    <Link className="tbl-link" href={`/admin/members/${member.id}`}>
                      {member.firstName} {member.lastName}
                    </Link>
                    {member.role ? <div className="row-sub">{member.role}</div> : null}
                  </td>
                  <td>
                    {member.email.endsWith(".invalid") ? <span className="pill amber">Email needed</span> : member.email}
                  </td>
                  <td>{member.gradYear || "—"}</td>
                  <td>
                    <span className={`pill ${member.status === "ACTIVE" ? "green" : member.status === "ALUM" ? "gray" : "amber"}`}>{member.status}</span>
                  </td>
                  <td>{member.status === "ACTIVE" && member.photoUrl ? "Yes" : member.photoUrl ? "Photo set (not active)" : "No photo"}</td>
                  <td className="cell-actions">
                    <Link className="btn" href={`/admin/members/${member.id}`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-note" style={{ padding: 24 }}>
                    No members match.
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
