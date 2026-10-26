import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { PhotoField } from "@/components/admin/PhotoField";
import { Topbar } from "@/components/admin/Topbar";
import { deleteMeeting, duplicateMeeting, saveMeeting } from "@/lib/actions/admin";
import { dateToChicagoLocal } from "@/lib/datetime";
import { prisma } from "@/lib/db";
import { getClubSettings } from "@/lib/queries";
import { displayName } from "@/lib/utils";

export default async function MeetingEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const [meeting, speakers, settings] = await Promise.all([
    isNew ? null : prisma.meeting.findUnique({ where: { id } }),
    prisma.speaker.findMany({ orderBy: [{ status: "asc" }, { lastName: "asc" }] }),
    getClubSettings(),
  ]);
  if (!isNew && !meeting) notFound();

  return (
    <>
      <Topbar crumbs={["Admin", "Meetings", meeting ? meeting.date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" }) : "New meeting"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              {meeting ? "Edit" : "Schedule a"} <span className="serif">meeting.</span>
            </h1>
            <p className="sub">Tick “Published” when you want it to show on the Meetings page, the home page countdown and the calendar downloads.</p>
          </div>
          <div className="r">
            <Link href="/admin/meetings" className="btn">
              ← All meetings
            </Link>
          </div>
        </div>

        <AdminForm action={saveMeeting} submitLabel={meeting ? "Save meeting" : "Add meeting"}>
          {meeting ? <input type="hidden" name="id" value={meeting.id} /> : null}
          <div className="admin-two">
            <div className="card" style={{ padding: 22 }}>
              <div className="field-row">
                <div className="field">
                  <label>Date and time (St. Louis)</label>
                  <input type="datetime-local" name="date" defaultValue={dateToChicagoLocal(meeting?.date)} required />
                </div>
                <div className="field">
                  <label>Time shown on the site</label>
                  <input name="time" defaultValue={meeting?.time ?? ""} placeholder={settings.meetingTime} />
                  <div className="field-help">Leave empty to use the time above.</div>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Location</label>
                  <input name="location" defaultValue={meeting?.location ?? settings.meetingLocation} />
                </div>
                <div className="field">
                  <label>Speaker</label>
                  <select name="speakerId" defaultValue={meeting?.speakerId ?? ""}>
                    <option value="">None (student-led or to be announced)</option>
                    {speakers.map((speaker) => (
                      <option key={speaker.id} value={speaker.id}>
                        {displayName(speaker.firstName, speaker.lastName)} {speaker.status === "UPCOMING" ? "· upcoming" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Topic</label>
                <input name="topic" defaultValue={meeting?.topic} placeholder="What this session is about" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Format</label>
                  <input name="format" defaultValue={meeting?.format ?? "Talk + Q&A"} placeholder="Talk + Q&A, or Student stock pitches" />
                </div>
                <div className="field">
                  <label>Duration</label>
                  <input name="duration" defaultValue={meeting?.duration ?? "~45 min"} />
                </div>
              </div>
            </div>

            <div className="admin-stack">
              <div className="card" style={{ padding: 22 }}>
                <div className="field">
                  <label>Status</label>
                  <select name="status" defaultValue={meeting?.status ?? "TENTATIVE"}>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="TENTATIVE">Tentative (shows as TBA)</option>
                    <option value="OPEN">Open</option>
                  </select>
                </div>
                <div className="field">
                  <label>RSVPs</label>
                  <input name="rsvpCount" type="number" min={0} defaultValue={meeting?.rsvpCount ?? 0} />
                </div>
                <div className="field">
                  <label style={{ display: "flex", gap: 8, alignItems: "center", textTransform: "none", letterSpacing: 0 }}>
                    <input type="checkbox" name="published" defaultChecked={meeting?.published ?? false} style={{ width: "auto" }} />
                    Published (visible on the public site)
                  </label>
                </div>
              </div>
              <div className="card" style={{ padding: 22 }}>
                <PhotoField label="Photo (for past sessions)" defaultValue={meeting?.photoUrl} />
              </div>
              {meeting ? (
                <div className="card" style={{ padding: 22 }}>
                  <h3 style={{ marginBottom: 10 }}>More</h3>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <ConfirmAction action={duplicateMeeting.bind(null, meeting.id)}>Duplicate (+2 weeks)</ConfirmAction>
                    <ConfirmAction action={deleteMeeting.bind(null, meeting.id)} confirm="Delete this meeting? This cannot be undone." className="btn danger">
                      Delete
                    </ConfirmAction>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </AdminForm>
      </div>
    </>
  );
}
