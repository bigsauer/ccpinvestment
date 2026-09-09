import { deleteMeeting, upsertMeeting } from "@/lib/actions/admin";
import { WriteFieldset } from "@/components/admin/WriteGate";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";
import { displayName } from "@/lib/utils";

export default async function AdminMeetingsPage() {
  const [meetings, speakers] = await Promise.all([
    prisma.meeting.findMany({ include: { speaker: true }, orderBy: { date: "desc" } }),
    prisma.speaker.findMany({ orderBy: { lastName: "asc" } }),
  ]);

  return (
    <>
      <Topbar crumbs={["Admin", "Meetings"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Schedule, <span className="serif">then publish.</span>
            </h1>
            <p className="sub">RSVP counts are officer-entered. Publishing a row makes it show on the public meetings page.</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20, padding: 20 }}>
          <form action={upsertMeeting} className="field-row" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <WriteFieldset>
            <div className="field">
              <label>Date</label>
              <input type="datetime-local" name="date" required />
            </div>
            <div className="field">
              <label>Time</label>
              <input name="time" defaultValue="7:45 AM" />
            </div>
            <div className="field">
              <label>Location</label>
              <input name="location" defaultValue="Little Theatre" />
            </div>
            <div className="field">
              <label>Speaker</label>
              <select name="speakerId" defaultValue="">
                <option value="">None</option>
                {speakers.map((speaker) => (
                  <option key={speaker.id} value={speaker.id}>
                    {displayName(speaker.firstName, speaker.lastName)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Topic</label>
              <input name="topic" />
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue="TENTATIVE">
                <option value="CONFIRMED">Confirmed</option>
                <option value="TENTATIVE">Tentative</option>
                <option value="OPEN">Open</option>
              </select>
            </div>
            <div className="field">
              <label>RSVPs</label>
              <input name="rsvpCount" type="number" defaultValue={0} />
            </div>
            <div className="field" style={{ display: "flex", alignItems: "end", gap: 10 }}>
              <label>
                <input type="checkbox" name="published" /> Published
              </label>
              <button className="btn red" type="submit">
                Add meeting
              </button>
            </div>
            </WriteFieldset>
          </form>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Speaker</th>
                <th>Topic</th>
                <th>Status</th>
                <th>RSVP</th>
                <th>Live</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="row">
                  <td className="strong">{meeting.date.toLocaleDateString("en-US", { timeZone: "America/Chicago" })}</td>
                  <td>
                    {meeting.speaker ? displayName(meeting.speaker.firstName, meeting.speaker.lastName) : "—"}
                    <div className="sub">{meeting.time}</div>
                  </td>
                  <td>{meeting.topic || "—"}</td>
                  <td>
                    <span className={`pill ${meeting.status === "CONFIRMED" ? "green" : meeting.status === "TENTATIVE" ? "amber" : "gray"}`}>
                      {meeting.status}
                    </span>
                  </td>
                  <td>{meeting.rsvpCount}</td>
                  <td>{meeting.published ? "Yes" : "No"}</td>
                  <td className="cell-actions">
                    <form action={deleteMeeting.bind(null, meeting.id)}>
                      <WriteFieldset>
                        <button className="btn" type="submit">
                          Delete
                        </button>
                      </WriteFieldset>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
