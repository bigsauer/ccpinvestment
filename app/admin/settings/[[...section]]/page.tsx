import Link from "next/link";
import { purgeApplications, saveClubSettings } from "@/lib/actions/admin";
import { WriteFieldset } from "@/components/admin/WriteGate";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";
import { roleLabel } from "@/lib/utils";

const SECTIONS = [
  ["general", "General"],
  ["officers", "Officers & roles"],
  ["integrations", "Integrations"],
  ["email", "Email templates"],
  ["forms", "Forms"],
  ["deploy", "Deploy"],
  ["billing", "Billing"],
  ["danger", "Danger zone"],
] as const;

export default async function SettingsPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section } = await params;
  const current = section?.[0] ?? "general";
  const [settings, officers] = await Promise.all([
    prisma.clubSettings.findUnique({ where: { id: "club" } }),
    prisma.officer.findMany({ orderBy: { role: "asc" } }),
  ]);

  return (
    <>
      <Topbar crumbs={["Admin", "Settings"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Club, <span className="serif">configured.</span>
            </h1>
            <p className="sub">General and officers are live. Integrations, email, deploy, and billing are shells for later.</p>
          </div>
        </div>
        <div className="settings-grid">
          <nav className="settings-nav">
            {SECTIONS.map(([id, label]) => (
              <Link key={id} href={`/admin/settings/${id}`} className={current === id ? "item on" : "item"}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="settings-pane">
            {current === "general" ? (
              <form action={saveClubSettings}>
                <WriteFieldset>
                <div className="field">
                  <label>Club name</label>
                  <input name="name" defaultValue={settings?.name ?? ""} />
                </div>
                <div className="field">
                  <label>Short name</label>
                  <input name="shortName" defaultValue={settings?.shortName ?? ""} />
                </div>
                <div className="field">
                  <label>Founded</label>
                  <input name="foundedYear" defaultValue={settings?.foundedYear ?? ""} />
                </div>
                <div className="field">
                  <label>Meeting location</label>
                  <input name="meetingLocation" defaultValue={settings?.meetingLocation ?? ""} />
                </div>
                <div className="field">
                  <label>Meeting time</label>
                  <input name="meetingTime" defaultValue={settings?.meetingTime ?? ""} />
                </div>
                <div className="field">
                  <label>Season label</label>
                  <input name="seasonLabel" defaultValue={settings?.seasonLabel ?? ""} />
                </div>
                <button className="btn red" type="submit">
                  Save
                </button>
                </WriteFieldset>
              </form>
            ) : null}

            {current === "officers" ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((officer) => (
                    <tr key={officer.id}>
                      <td className="strong">{officer.name}</td>
                      <td>{officer.email}</td>
                      <td>{roleLabel(officer.role)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {["integrations", "email", "forms", "deploy", "billing"].includes(current) ? (
              <p style={{ color: "var(--ink-3)" }}>
                Placeholder for {current}. Email, OAuth, and deploy are out of scope for v1.
              </p>
            ) : null}

            {current === "danger" ? (
              <form action={purgeApplications}>
                <WriteFieldset>
                  <p style={{ marginBottom: 16 }}>Delete every application. Members and speakers already created stay.</p>
                  <button className="btn red" type="submit">
                    Purge applications
                  </button>
                </WriteFieldset>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
