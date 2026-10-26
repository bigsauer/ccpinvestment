import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { PhotoField } from "@/components/admin/PhotoField";
import { Topbar } from "@/components/admin/Topbar";
import { deleteOfficer, saveOfficer, setOfficerPassword } from "@/lib/actions/officers";
import { prisma } from "@/lib/db";
import { canManageOfficers, getActor } from "@/lib/guard";
import { roleLabel } from "@/lib/utils";

const ROLE_OPTIONS = ["PRESIDENT", "VP", "PORTFOLIO_MANAGER", "SECRETARY", "TREASURER", "ADVISOR"] as const;

export default async function OfficerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) redirect("/admin/session-ended");
  if (!canManageOfficers(actor)) redirect("/admin/officers");

  const officer = await prisma.officer.findUnique({ where: { id } });
  if (!officer) notFound();
  const isSelf = officer.id === actor.id;
  const locked = Boolean(officer.lockedUntil && officer.lockedUntil > new Date());
  const protectedTarget = officer.isSuperAdmin && !actor.isSuperAdmin;

  return (
    <>
      <Topbar crumbs={["Admin", "Officers", officer.name]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              {officer.name}
              <span className="serif"> · {roleLabel(officer.role)}</span>
            </h1>
            <p className="sub">
              {officer.email} · joined {officer.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {locked ? " · locked after failed sign-ins (clears on its own or by setting a password)" : ""}
            </p>
          </div>
          <div className="r">
            <Link href="/admin/officers" className="btn">
              ← All officers
            </Link>
          </div>
        </div>

        {protectedTarget ? <div className="info-note" style={{ marginBottom: 16 }}>This is a super admin. Only another super admin can change or remove them.</div> : null}

        <div className="admin-two">
          <div className="card" style={{ padding: 22 }}>
            <AdminForm action={saveOfficer} submitLabel="Save officer">
              <input type="hidden" name="id" value={officer.id} />
              <div className="field-row">
                <div className="field">
                  <label>Name</label>
                  <input name="name" defaultValue={officer.name} required />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input name="email" type="email" defaultValue={officer.email} required />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Role</label>
                  <select name="role" defaultValue={officer.role}>
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </select>
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
              <div className="field">
                <label style={{ display: "flex", gap: 8, alignItems: "center", textTransform: "none", letterSpacing: 0 }}>
                  <input type="checkbox" name="active" defaultChecked={officer.active} disabled={isSelf} style={{ width: "auto" }} />
                  Account is active (untick to switch it off without deleting)
                </label>
                {isSelf ? <input type="hidden" name="active" value="on" /> : null}
              </div>
              {actor.isSuperAdmin ? (
                <div className="field">
                  <label style={{ display: "flex", gap: 8, alignItems: "center", textTransform: "none", letterSpacing: 0 }}>
                    <input type="checkbox" name="isSuperAdmin" defaultChecked={officer.isSuperAdmin} style={{ width: "auto" }} />
                    Super admin (can invite, edit and remove other officers)
                  </label>
                </div>
              ) : null}
            </AdminForm>
          </div>

          <div className="admin-stack">
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 6 }}>{isSelf ? "Change my password" : "Set a temporary password"}</h3>
              <p className="admin-note" style={{ marginBottom: 12 }}>
                {isSelf
                  ? "Or use My account to change it with your current password."
                  : "For someone locked out. They will be asked to choose their own at the next sign-in."}
              </p>
              <AdminForm action={setOfficerPassword} submitLabel="Set password" resetOnSuccess>
                <input type="hidden" name="id" value={officer.id} />
                <div className="field">
                  <label>New password</label>
                  <input name="password" type="password" minLength={10} required autoComplete="new-password" />
                </div>
              </AdminForm>
            </div>

            {!isSelf ? (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 6 }}>Remove this officer</h3>
                <p className="admin-note" style={{ marginBottom: 12 }}>
                  Deleting removes the account for good. Notes and activity they left stay, signed with their name. To pause access instead, untick “Account is active” and save.
                </p>
                <ConfirmAction
                  action={deleteOfficer.bind(null, officer.id)}
                  confirm={`Delete ${officer.name}'s account? This cannot be undone.`}
                  className="btn danger"
                  redirectTo="/admin/officers"
                >
                  Delete {officer.name.split(" ")[0]}
                </ConfirmAction>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
