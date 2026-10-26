import { redirect } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { PhotoField } from "@/components/admin/PhotoField";
import { Topbar } from "@/components/admin/Topbar";
import { changeMyPassword, saveMyProfile } from "@/lib/actions/officers";
import { prisma } from "@/lib/db";
import { getActor } from "@/lib/guard";
import { roleLabel } from "@/lib/utils";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ force?: string }> }) {
  const actor = await getActor();
  if (!actor) redirect("/admin/session-ended");
  const { force } = await searchParams;
  const officer = await prisma.officer.findUnique({ where: { id: actor.id } });
  if (!officer) redirect("/admin/session-ended");

  return (
    <>
      <Topbar crumbs={["Admin", "My account"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              My <span className="serif">account.</span>
            </h1>
            <p className="sub">
              {officer.email} · {roleLabel(officer.role)}
              {officer.isSuperAdmin ? " · super admin" : ""}
            </p>
          </div>
        </div>
        {force || officer.mustChangePassword ? (
          <div className="info-note" style={{ marginBottom: 16 }}>
            <b>Choose your own password to continue.</b> You are using a temporary one that someone else set.
          </div>
        ) : null}
        <div className="admin-two">
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ marginBottom: 12 }}>Profile</h3>
            <AdminForm action={saveMyProfile} submitLabel="Save profile">
              <div className="field-row">
                <div className="field">
                  <label>Name</label>
                  <input name="name" defaultValue={officer.name} required />
                </div>
                <div className="field">
                  <label>Class of</label>
                  <input name="classYear" defaultValue={officer.classYear ?? ""} placeholder="2027" />
                </div>
              </div>
              <div className="field">
                <label>Bio (shown on the Team page)</label>
                <textarea name="bio" defaultValue={officer.bio ?? ""} />
              </div>
              <PhotoField defaultValue={officer.photoUrl} />
            </AdminForm>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ marginBottom: 12 }}>Change password</h3>
            <AdminForm action={changeMyPassword} submitLabel="Change password" resetOnSuccess>
              <div className="field">
                <label>Current password</label>
                <input name="current" type="password" required autoComplete="current-password" />
              </div>
              <div className="field">
                <label>New password</label>
                <input name="next" type="password" minLength={10} required autoComplete="new-password" />
              </div>
              <div className="field">
                <label>Repeat new password</label>
                <input name="confirm" type="password" minLength={10} required autoComplete="new-password" />
              </div>
              <div className="field-help">At least 10 characters.</div>
            </AdminForm>
          </div>
        </div>
      </div>
    </>
  );
}
