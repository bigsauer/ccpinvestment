import { upsertSpeaker } from "@/lib/actions/admin";
import { WriteFieldset } from "@/components/admin/WriteGate";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";
import { displayName } from "@/lib/utils";

export default async function AdminSpeakersPage() {
  const speakers = await prisma.speaker.findMany({ orderBy: [{ status: "asc" }, { sessionDate: "desc" }] });

  return (
    <>
      <Topbar crumbs={["Admin", "Speakers"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              The people <span className="serif">in the archive.</span>
            </h1>
            <p className="sub">Add a guest, or approve a speaker application to create one automatically.</p>
          </div>
        </div>

        <div className="spk-grid">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="spk-tile">
              <div className="ph">
                <div className="placeholder">{speaker.firstName[0]}</div>
                <div className={speaker.status === "UPCOMING" ? "tag up" : "tag"}>{speaker.status}</div>
              </div>
              <div className="b">
                <div className="d">{speaker.season ?? "—"}</div>
                <div className="n">{displayName(speaker.firstName, speaker.lastName)}</div>
                <div className="r">
                  {speaker.title} · {speaker.firm}
                </div>
              </div>
            </div>
          ))}
          <details className="add-tile">
            <summary>
              <div className="ico">+</div>
              <div className="t">Add speaker</div>
              <div className="s">Name, firm, topic</div>
            </summary>
            <form action={upsertSpeaker} style={{ textAlign: "left", width: "100%", paddingTop: 16 }}>
              <WriteFieldset>
              <div className="field">
                <label>First name</label>
                <input name="firstName" required />
              </div>
              <div className="field">
                <label>Last name</label>
                <input name="lastName" required />
              </div>
              <div className="field">
                <label>Firm</label>
                <input name="firm" required />
              </div>
              <div className="field">
                <label>Title</label>
                <input name="title" required />
              </div>
              <div className="field">
                <label>Topic</label>
                <input name="topic" />
              </div>
              <div className="field">
                <label>Status</label>
                <select name="status" defaultValue="UPCOMING">
                  <option value="UPCOMING">Upcoming</option>
                  <option value="PAST">Past</option>
                </select>
              </div>
              <button className="btn red" type="submit">
                Save
              </button>
              </WriteFieldset>
            </form>
          </details>
        </div>
      </div>
    </>
  );
}
