import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Topbar } from "@/components/admin/Topbar";
import { approveAccessRequest, denyAccessRequest, inviteOfficer, renewInvitation, revokeInvitation } from "@/lib/actions/officers";
import { prisma } from "@/lib/db";
import { canManageOfficers, getActor } from "@/lib/guard";
import { relativeWhen, roleLabel } from "@/lib/utils";

const ROLE_OPTIONS = ["PRESIDENT", "VP", "PORTFOLIO_MANAGER", "SECRETARY", "TREASURER", "ADVISOR"] as const;

function RoleSelect({ name = "role", defaultValue = "SECRETARY" }: { name?: string; defaultValue?: string }) {
  return (
    <select name={name} defaultValue={defaultValue}>
      {ROLE_OPTIONS.map((role) => (
        <option key={role} value={role}>
          {roleLabel(role)}
        </option>
      ))}
    </select>
  );
}

export default async function OfficersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const actor = await getActor();
  if (!actor) redirect("/admin/session-ended");
  const manager = canManageOfficers(actor);
  const { tab: rawTab } = await searchParams;
  const tab = manager && (rawTab === "invites" || rawTab === "requests") ? rawTab : "team";

  const now = new Date();
  const [officers, invites, requests] = await Promise.all([
    prisma.officer.findMany({ orderBy: [{ active: "desc" }, { role: "asc" }, { name: "asc" }] }),
    manager ? prisma.invitation.findMany({ orderBy: { createdAt: "desc" }, take: 40 }) : Promise.resolve([]),
    manager ? prisma.accessRequest.findMany({ orderBy: { createdAt: "desc" }, take: 40 }) : Promise.resolve([]),
  ]);
  const openInvites = invites.filter((i) => !i.acceptedAt && !i.revokedAt && i.expiresAt > now);
  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <>
      <Topbar crumbs={["Admin", "Officers"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              The people <span className="serif">who run this.</span>
            </h1>
            <p className="sub">
              Invite officers, review sign-up requests, switch accounts off, or remove them. Super admins and co-presidents manage this page.
            </p>
          </div>
          {manager ? (
            <div className="r">
              <Link href="/admin/officers?tab=invites" className="btn red">
                + Invite officer
              </Link>
            </div>
          ) : null}
        </div>

        {manager ? (
          <div className="tab-strip">
            <Link href="/admin/officers" className={tab === "team" ? "t on" : "t"}>
              Team <span className="count">{officers.length}</span>
            </Link>
            <Link href="/admin/officers?tab=invites" className={tab === "invites" ? "t on" : "t"}>
              Invitations <span className="count">{openInvites.length}</span>
            </Link>
            <Link href="/admin/officers?tab=requests" className={tab === "requests" ? "t on" : "t"}>
              Access requests <span className="count">{pendingRequests.length}</span>
            </Link>
          </div>
        ) : (
          <div className="info-note" style={{ marginBottom: 16 }}>
            You can see the team here. Only a super admin or a co-president can invite, edit or remove officers.
          </div>
        )}

        {tab === "team" ? (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last sign-in</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr key={officer.id} className="row">
                    <td>
                      <div className="strong">
                        {officer.name}
                        {officer.id === actor.id ? " (you)" : ""}
                      </div>
                      <div className="row-sub">
                        {officer.email}
                        {officer.classYear ? ` · '${officer.classYear}` : ""}
                      </div>
                    </td>
                    <td>
                      {roleLabel(officer.role)}
                      {officer.isSuperAdmin ? <div><span className="pill red">Super admin</span></div> : null}
                    </td>
                    <td>
                      {!officer.active ? (
                        <span className="pill gray">Deactivated</span>
                      ) : officer.lockedUntil && officer.lockedUntil > now ? (
                        <span className="pill amber">Locked</span>
                      ) : officer.mustChangePassword ? (
                        <span className="pill amber">Temp password</span>
                      ) : (
                        <span className="pill green">Active</span>
                      )}
                    </td>
                    <td>{officer.lastLoginAt ? relativeWhen(officer.lastLoginAt) : "Never"}</td>
                    <td className="cell-actions">
                      {manager ? (
                        <Link className="btn" href={`/admin/officers/${officer.id}`}>
                          Manage
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "invites" ? (
          <div className="admin-two">
            <div className="admin-stack">
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 4 }}>Open invitations</h3>
                <p className="admin-note" style={{ marginBottom: 14 }}>Links work once and expire after 7 days. Create a new link if one is lost.</p>
                {openInvites.length === 0 ? <p className="admin-note">No open invitations.</p> : null}
                <div className="admin-stack">
                  {openInvites.map((invite) => (
                    <div key={invite.id} className="card" style={{ padding: 14 }}>
                      <div className="strong">{invite.name || invite.email}</div>
                      <div className="row-sub">
                        {invite.email} · {roleLabel(invite.role)} · expires {invite.expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "flex-start" }}>
                        <AdminForm action={renewInvitation} submitLabel="Get a new link" pendingLabel="Working…" refresh={false}>
                          <input type="hidden" name="id" value={invite.id} />
                        </AdminForm>
                        <ConfirmAction action={revokeInvitation.bind(null, invite.id)} confirm={`Cancel the invitation for ${invite.email}?`} className="btn danger">
                          Cancel invitation
                        </ConfirmAction>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {invites.filter((i) => i.acceptedAt || i.revokedAt || i.expiresAt <= now).length > 0 ? (
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ marginBottom: 10 }}>Past invitations</h3>
                  <table className="table">
                    <tbody>
                      {invites
                        .filter((i) => i.acceptedAt || i.revokedAt || i.expiresAt <= now)
                        .map((invite) => (
                          <tr key={invite.id} className="row">
                            <td>{invite.email}</td>
                            <td>{roleLabel(invite.role)}</td>
                            <td>{invite.acceptedAt ? <span className="pill green">Accepted</span> : invite.revokedAt ? <span className="pill gray">Cancelled</span> : <span className="pill amber">Expired</span>}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 12 }}>Invite someone</h3>
              <AdminForm action={inviteOfficer} submitLabel="Create invitation" pendingLabel="Creating…" resetOnSuccess>
                <div className="field">
                  <label>Email</label>
                  <input name="email" type="email" required placeholder="name@school.org" />
                </div>
                <div className="field">
                  <label>Name (optional)</label>
                  <input name="name" />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Role</label>
                    <RoleSelect />
                  </div>
                  <div className="field">
                    <label>Class of</label>
                    <input name="classYear" placeholder="2027" />
                  </div>
                </div>
              </AdminForm>
              <p className="admin-note" style={{ marginTop: 14 }}>
                You get a one-time link to send them. They choose their own password, so you never handle it.
              </p>
            </div>
          </div>
        ) : null}

        {tab === "requests" ? (
          <div className="admin-stack">
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ marginBottom: 4 }}>Waiting for a decision</h3>
              <p className="admin-note" style={{ marginBottom: 14 }}>
                People ask for access at <code>/admin/signup</code>. Approving creates a one-time invitation link for them.
              </p>
              {pendingRequests.length === 0 ? <p className="admin-note">No requests waiting.</p> : null}
              <div className="admin-stack">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="card" style={{ padding: 14 }}>
                    <div className="strong">{request.name}</div>
                    <div className="row-sub">
                      {request.email}
                      {request.classYear ? ` · '${request.classYear}` : ""} · {relativeWhen(request.createdAt)}
                    </div>
                    {request.roleWanted ? <div className="admin-note">Role: {request.roleWanted}</div> : null}
                    {request.message ? <div className="quote" style={{ marginTop: 8 }}>{request.message}</div> : null}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, alignItems: "flex-start" }}>
                      <AdminForm action={approveAccessRequest} submitLabel="Approve and create link" pendingLabel="Working…" refresh={false}>
                        <input type="hidden" name="id" value={request.id} />
                        <div className="field" style={{ marginBottom: 0 }}>
                          <label>Give them the role</label>
                          <RoleSelect />
                        </div>
                      </AdminForm>
                      <ConfirmAction action={denyAccessRequest.bind(null, request.id)} confirm={`Deny ${request.name}'s request?`} className="btn danger">
                        Deny
                      </ConfirmAction>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {requests.filter((r) => r.status !== "PENDING").length > 0 ? (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ marginBottom: 10 }}>Decided</h3>
                <table className="table">
                  <tbody>
                    {requests
                      .filter((r) => r.status !== "PENDING")
                      .map((request) => (
                        <tr key={request.id} className="row">
                          <td>{request.name}</td>
                          <td>{request.email}</td>
                          <td>{request.status === "APPROVED" ? <span className="pill green">Approved</span> : <span className="pill gray">Denied</span>}</td>
                          <td className="row-sub">{request.decidedBy ? `by ${request.decidedBy}` : ""}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
