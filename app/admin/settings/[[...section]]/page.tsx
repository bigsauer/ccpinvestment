import Link from "next/link";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Topbar } from "@/components/admin/Topbar";
import { cleanupPhotos, purgeApplications, saveClubSettings } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { getClubSettings } from "@/lib/queries";

const SECTIONS = [
  ["general", "Club details"],
  ["site", "Home page & contact"],
  ["maintenance", "Maintenance"],
] as const;

export default async function SettingsPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section } = await params;
  const current = SECTIONS.some(([id]) => id === section?.[0]) ? section![0]! : "general";
  const settings = await getClubSettings();
  const photoCount = await prisma.photo.count();

  return (
    <>
      <Topbar crumbs={["Admin", "Settings"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Club, <span className="serif">configured.</span>
            </h1>
            <p className="sub">Details the public site uses everywhere. Officer accounts live under Officers.</p>
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
            {current !== "maintenance" ? (
              <AdminForm action={saveClubSettings} submitLabel="Save settings">
                {/* Both tabs save the whole record, so keep the other tab's values. */}
                {current === "general" ? (
                  <>
                    <div className="field">
                      <label>Club name</label>
                      <input name="name" defaultValue={settings.name} />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Short name</label>
                        <input name="shortName" defaultValue={settings.shortName} />
                      </div>
                      <div className="field">
                        <label>Founded</label>
                        <input name="foundedYear" defaultValue={settings.foundedYear} />
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Usual meeting location</label>
                        <input name="meetingLocation" defaultValue={settings.meetingLocation} />
                      </div>
                      <div className="field">
                        <label>Usual meeting time</label>
                        <input name="meetingTime" defaultValue={settings.meetingTime} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Season label</label>
                      <input name="seasonLabel" defaultValue={settings.seasonLabel} placeholder="Fall 2026" />
                      <div className="field-help">Shown on the home page and the Meetings page.</div>
                    </div>
                    <div className="group-h" style={{ margin: "6px 0 8px" }}>Join form</div>
                    <div className="field-row">
                      <div className="field">
                        <label>First class year offered</label>
                        <input name="classYearFrom" type="number" min={2000} max={2100} defaultValue={settings.classYearFrom} />
                      </div>
                      <div className="field">
                        <label>Last class year offered</label>
                        <input name="classYearTo" type="number" min={2000} max={2100} defaultValue={settings.classYearTo} />
                      </div>
                    </div>
                    <div className="field-help" style={{ marginBottom: 14 }}>
                      Students pick their “Class of” from this range on the join form. Move the first year up each fall when a class graduates.
                    </div>
                    <HiddenSiteFields settings={settings} />
                  </>
                ) : (
                  <>
                    <div className="group-h" style={{ marginBottom: 8 }}>Numbers on the home page</div>
                    <div className="field-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                      <div className="field">
                        <label>Members</label>
                        <input name="statMembers" defaultValue={settings.statMembers} placeholder="60+" />
                      </div>
                      <div className="field">
                        <label>Guest speakers</label>
                        <input name="statSpeakers" defaultValue={settings.statSpeakers} placeholder="12+" />
                      </div>
                      <div className="field">
                        <label>Sessions held</label>
                        <input name="statSessions" defaultValue={settings.statSessions} placeholder="24+" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Caption on the home page photo</label>
                      <input name="heroCaption" defaultValue={settings.heroCaption} placeholder="e.g. 04/16/26 · Spring session" />
                      <div className="field-help">Leave empty to hide it.</div>
                    </div>
                    <div className="group-h" style={{ margin: "18px 0 8px" }}>Contact</div>
                    <div className="field-row">
                      <div className="field">
                        <label>Club contact email</label>
                        <input name="contactEmail" type="email" defaultValue={settings.contactEmail ?? ""} />
                      </div>
                      <div className="field">
                        <label>Instagram link</label>
                        <input name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} placeholder="https://www.instagram.com/ccp_investment" />
                      </div>
                    </div>
                    <GeneralHidden settings={settings} />
                  </>
                )}
              </AdminForm>
            ) : (
              <div className="admin-stack">
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ marginBottom: 6 }}>Unused photos</h3>
                  <p className="admin-note" style={{ marginBottom: 12 }}>
                    {photoCount} uploaded photo{photoCount === 1 ? "" : "s"} stored. Replacing or removing a photo leaves the old file behind; this clears the ones nothing uses.
                  </p>
                  <ConfirmAction action={cleanupPhotos} doneLabel="Done ✓">
                    Remove unused photos
                  </ConfirmAction>
                </div>
                <div className="card" style={{ padding: 20, borderColor: "#e4b4b0" }}>
                  <h3 style={{ marginBottom: 6, color: "#b3261e" }}>Delete all inquiries</h3>
                  <p className="admin-note" style={{ marginBottom: 12 }}>
                    Deletes every student and speaker inquiry, including notes. Members and speakers already created stay. To keep a record, use Export on the Inquiries page first.
                  </p>
                  <AdminForm action={purgeApplications} submitLabel="Delete all inquiries" pendingLabel="Deleting…" resetOnSuccess>
                    <div className="field">
                      <label>Type DELETE to confirm</label>
                      <input name="confirm" autoComplete="off" placeholder="DELETE" />
                    </div>
                  </AdminForm>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

type Settings = Awaited<ReturnType<typeof getClubSettings>>;

/** The save action replaces the whole settings record, so the tab not on screen rides along unchanged. */
function HiddenSiteFields({ settings }: { settings: Settings }) {
  return (
    <>
      <input type="hidden" name="statMembers" value={settings.statMembers} />
      <input type="hidden" name="statSpeakers" value={settings.statSpeakers} />
      <input type="hidden" name="statSessions" value={settings.statSessions} />
      <input type="hidden" name="heroCaption" value={settings.heroCaption} />
      <input type="hidden" name="contactEmail" value={settings.contactEmail ?? ""} />
      <input type="hidden" name="instagramUrl" value={settings.instagramUrl ?? ""} />
    </>
  );
}

function GeneralHidden({ settings }: { settings: Settings }) {
  return (
    <>
      <input type="hidden" name="name" value={settings.name} />
      <input type="hidden" name="shortName" value={settings.shortName} />
      <input type="hidden" name="foundedYear" value={settings.foundedYear} />
      <input type="hidden" name="meetingLocation" value={settings.meetingLocation} />
      <input type="hidden" name="meetingTime" value={settings.meetingTime} />
      <input type="hidden" name="seasonLabel" value={settings.seasonLabel} />
      <input type="hidden" name="classYearFrom" value={settings.classYearFrom} />
      <input type="hidden" name="classYearTo" value={settings.classYearTo} />
    </>
  );
}
