import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { PhotoField } from "@/components/admin/PhotoField";
import { Topbar } from "@/components/admin/Topbar";
import { deleteMember, saveMember } from "@/lib/actions/admin";
import { classYearList } from "@/lib/class-years";
import { prisma } from "@/lib/db";
import { getClubSettings } from "@/lib/queries";

export default async function MemberEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [member, settings] = await Promise.all([isNew ? null : prisma.member.findUnique({ where: { id } }), getClubSettings()]);
  if (!isNew && !member) notFound();

  return (
    <>
      <Topbar crumbs={["Admin", "Members", member ? `${member.firstName} ${member.lastName}` : "New member"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              {member ? `${member.firstName} ${member.lastName}` : "Add a"} <span className="serif">{member ? "" : "member."}</span>
            </h1>
            <p className="sub">Active members with a photo are shown on the public Team page, with name and class year only. Email is never shown.</p>
          </div>
          <div className="r">
            <Link href="/admin/members" className="btn">
              ← All members
            </Link>
          </div>
        </div>

        <AdminForm action={saveMember} submitLabel={member ? "Save member" : "Add member"}>
          {member ? <input type="hidden" name="id" value={member.id} /> : null}
          <div className="admin-two">
            <div className="card" style={{ padding: 22 }}>
              <div className="field-row">
                <div className="field">
                  <label>First name</label>
                  <input name="firstName" defaultValue={member?.firstName} required />
                </div>
                <div className="field">
                  <label>Last name</label>
                  <input name="lastName" defaultValue={member?.lastName} required />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input name="email" type="email" defaultValue={member?.email.endsWith(".invalid") ? "" : member?.email} required placeholder="student@school.org" />
                {member?.email.endsWith(".invalid") ? <div className="field-help">This member was added without an email. Add the real one.</div> : null}
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Class of</label>
                  <input name="gradYear" list="class-years" defaultValue={member?.gradYear} placeholder="2027" />
                  <datalist id="class-years">
                    {classYearList(settings.classYearFrom, settings.classYearTo).map((year) => (
                      <option key={year} value={year} />
                    ))}
                  </datalist>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select name="status" defaultValue={member?.status ?? "ACTIVE"}>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="ALUM">Alum</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Note (optional)</label>
                <input name="role" defaultValue={member?.role ?? ""} placeholder="e.g. Regular member" />
              </div>
            </div>
            <div className="admin-stack">
              <div className="card" style={{ padding: 22 }}>
                <PhotoField defaultValue={member?.photoUrl} />
              </div>
              {member ? (
                <div className="card" style={{ padding: 22 }}>
                  <h3 style={{ marginBottom: 6 }}>Remove member</h3>
                  <p className="admin-note" style={{ marginBottom: 12 }}>Deletes this person from the roster. To keep them as a graduate, set the status to Alum instead.</p>
                  <ConfirmAction action={deleteMember.bind(null, member.id)} confirm={`Delete ${member.firstName} ${member.lastName}?`} className="btn danger">
                    Delete member
                  </ConfirmAction>
                </div>
              ) : null}
            </div>
          </div>
        </AdminForm>
      </div>
    </>
  );
}
