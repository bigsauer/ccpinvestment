import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";

const TASKS: [string, string, string][] = [
  ["Answer student and speaker forms", "Inquiries", "/admin/applications"],
  ["Add a speaker, photo or career story", "Speakers", "/admin/speakers"],
  ["Schedule and publish a meeting", "Meetings", "/admin/meetings"],
  ["Build a whole new page (no code)", "Pages", "/admin/pages"],
  ["Change the top menu and footer links", "Navigation", "/admin/navigation"],
  ["Change page headlines and intro text", "Page wording", "/admin/content"],
  ["Replace the big photos", "Site images", "/admin/images"],
  ["Add members and their photos", "Members", "/admin/members"],
  ["Invite or remove officers", "Officers", "/admin/officers"],
  ["Club name, season, home numbers, class years", "Settings", "/admin/settings"],
  ["See who changed what", "Activity log", "/admin/activity"],
];

export default function HelpPage() {
  return (
    <>
      <Topbar crumbs={["Admin", "Help & handoff"]} />
      <div className="admin-page" style={{ maxWidth: 980 }}>
        <div className="admin-head">
          <div className="l">
            <h1>
              Keeping the site <span className="serif">running.</span>
            </h1>
            <p className="sub">Everything on the public site is managed here, so no developer is needed for day-to-day work. This page covers the rest.</p>
          </div>
        </div>

        <div className="admin-stack">
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ marginBottom: 12 }}>Where to do what</h3>
            <table className="table">
              <tbody>
                {TASKS.map(([task, where, href]) => (
                  <tr key={href} className="row">
                    <td>{task}</td>
                    <td className="cell-actions">
                      <Link className="btn" href={href}>
                        {where} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ marginBottom: 10 }}>Before the tech lead graduates</h3>
            <ul className="help-list">
              <li>Make your successor a <b>super admin</b> (Officers → Manage), plus a backup such as a faculty advisor.</li>
              <li><b>GitHub</b> (the code): transfer the repository to a club or school account, or add the successor as an owner.</li>
              <li><b>Vercel</b> (hosting) and <b>Supabase</b> (database): add the successor as an owner of each.</li>
              <li><b>GoDaddy</b> (the domain): put the club or school as account holder, turn on auto-renew, use a club email.</li>
              <li>Keep every login in a shared password manager that more than one adult can open.</li>
              <li>Last: the successor deletes your officer account. You can&apos;t delete yourself.</li>
            </ul>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ marginBottom: 10 }}>Every year, late summer</h3>
            <ol className="help-list">
              <li>Officers: invite the new ones, delete or deactivate the graduated ones.</li>
              <li>Members: set graduated students to <b>Alum</b>; approve or add new members.</li>
              <li>Settings: update the season label and move the first class year offered on the join form.</li>
              <li>Meetings and speakers: add the new schedule and publish it. Update the home page numbers.</li>
              <li>Check the domain renewal date and that the database is awake (below).</li>
            </ol>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ marginBottom: 10 }}>If something goes wrong</h3>
            <ul className="help-list">
              <li><b>Locked out:</b> five wrong passwords lock an account for 15 minutes. A super admin can set a temporary password (Officers → Manage).</li>
              <li><b>Site shows an error:</b> the free database sleeps after about a week of no use. Open the project in Supabase and press <b>Restore project</b>.</li>
              <li><b>Changes not showing:</b> they can take up to a minute. Refresh the page.</li>
              <li><b>Photo won&apos;t upload:</b> use a JPG or PNG under 8 MB.</li>
              <li><b>Nobody can sign in at all:</b> see <code>docs/HANDOFF.md</code> in the code for the recovery steps.</li>
            </ul>
          </div>

          <p className="admin-note">The full guide is <code>docs/HANDOFF.md</code> in the website&apos;s code, alongside <code>docs/ADMIN.md</code>.</p>
        </div>
      </div>
    </>
  );
}
