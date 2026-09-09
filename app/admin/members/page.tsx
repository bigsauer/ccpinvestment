import { upsertMember } from "@/lib/actions/admin";
import { WriteFieldset } from "@/components/admin/WriteGate";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";

export default async function AdminMembersPage() {
  const members = await prisma.member.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] });

  return (
    <>
      <Topbar crumbs={["Admin", "Members"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Roster, <span className="serif">kept current.</span>
            </h1>
            <p className="sub">Approving a student application adds them here as active.</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20, padding: 20 }}>
          <form action={upsertMember} className="field-row">
            <WriteFieldset>
            <div className="field">
              <label>First</label>
              <input name="firstName" required />
            </div>
            <div className="field">
              <label>Last</label>
              <input name="lastName" required />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" required />
            </div>
            <div className="field">
              <label>Class</label>
              <input name="gradYear" required placeholder="2028" />
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue="ACTIVE">
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="ALUM">Alum</option>
              </select>
            </div>
            <div className="field" style={{ display: "flex", alignItems: "end" }}>
              <button className="btn red" type="submit">
                Add member
              </button>
            </div>
            </WriteFieldset>
          </form>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="row">
                  <td className="strong">
                    {member.firstName} {member.lastName}
                  </td>
                  <td>{member.email}</td>
                  <td>{member.gradYear}</td>
                  <td>
                    <span className={`pill ${member.status === "ACTIVE" ? "green" : member.status === "ALUM" ? "gray" : "amber"}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>{member.role ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
