import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { PhotoField } from "@/components/admin/PhotoField";
import { StoryEditor } from "@/components/admin/StoryEditor";
import { Topbar } from "@/components/admin/Topbar";
import { deleteSpeaker, saveSpeaker } from "@/lib/actions/admin";
import { dateToChicagoLocal } from "@/lib/datetime";
import { prisma } from "@/lib/db";
import { speakerSlug } from "@/lib/site";
import { parseHighlights } from "@/lib/speakers";

export default async function SpeakerEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const speaker = isNew ? null : await prisma.speaker.findUnique({ where: { id } });
  if (!isNew && !speaker) notFound();

  return (
    <>
      <Topbar crumbs={["Admin", "Speakers", speaker ? `${speaker.firstName} ${speaker.lastName}` : "New speaker"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              {speaker ? `${speaker.firstName} ${speaker.lastName}` : "Add a"} <span className="serif">{speaker ? "" : "speaker."}</span>
            </h1>
            <p className="sub">What you save here appears on the public Speakers page and this speaker&apos;s own page within a minute.</p>
          </div>
          <div className="r">
            <Link href="/admin/speakers" className="btn">
              ← All speakers
            </Link>
            {speaker ? (
              <Link href={`/speakers/${speakerSlug(speaker.firstName, speaker.lastName)}`} target="_blank" className="btn">
                View public page
              </Link>
            ) : null}
          </div>
        </div>

        <AdminForm action={saveSpeaker} submitLabel={speaker ? "Save speaker" : "Add speaker"}>
          {speaker ? <input type="hidden" name="id" value={speaker.id} /> : null}
          <div className="admin-two">
            <div className="admin-stack">
              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ marginBottom: 12 }}>Who</h3>
                <div className="field-row">
                  <div className="field">
                    <label>First name</label>
                    <input name="firstName" defaultValue={speaker?.firstName} required />
                  </div>
                  <div className="field">
                    <label>Last name</label>
                    <input name="lastName" defaultValue={speaker?.lastName} required />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Title</label>
                    <input name="title" defaultValue={speaker?.title} placeholder="Chief Financial Officer" />
                  </div>
                  <div className="field">
                    <label>Firm</label>
                    <input name="firm" defaultValue={speaker?.firm} placeholder="agilon health" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Industry</label>
                    <input name="industry" defaultValue={speaker?.industry ?? ""} placeholder="Health care finance" />
                  </div>
                  <div className="field">
                    <label>LinkedIn link</label>
                    <input name="linkedinUrl" defaultValue={speaker?.linkedinUrl ?? ""} placeholder="https://www.linkedin.com/in/…" />
                  </div>
                </div>
                <div className="field">
                  <label>Bio</label>
                  <textarea name="bio" defaultValue={speaker?.bio} style={{ minHeight: 140 }} />
                </div>
                <div className="field">
                  <label>Topic</label>
                  <input name="topic" defaultValue={speaker?.topic} placeholder="What they spoke (or will speak) about" />
                </div>
              </div>

              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ marginBottom: 4 }}>Career story</h3>
                <p className="admin-note" style={{ marginBottom: 14 }}>
                  The animated timeline on the speaker&apos;s page. Optional — leave it empty and the page just shows the bio.
                </p>
                <StoryEditor defaultValue={speaker ? parseHighlights(speaker.highlights) : null} />
              </div>
            </div>

            <div className="admin-stack">
              <div className="card" style={{ padding: 22 }}>
                <h3 style={{ marginBottom: 12 }}>Session</h3>
                <div className="field">
                  <label>Status</label>
                  <select name="status" defaultValue={speaker?.status ?? "UPCOMING"}>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="PAST">Past</option>
                  </select>
                </div>
                <div className="field">
                  <label>Date and time</label>
                  <input type="datetime-local" name="sessionDate" defaultValue={dateToChicagoLocal(speaker?.sessionDate)} />
                  <div className="field-help">St. Louis time. Leave empty if there is no exact date.</div>
                </div>
                <div className="field">
                  <label>Season</label>
                  <input name="season" defaultValue={speaker?.season ?? ""} placeholder="Fall 2026" />
                </div>
              </div>
              <div className="card" style={{ padding: 22 }}>
                <PhotoField defaultValue={speaker?.photoUrl} />
              </div>
              {speaker ? (
                <div className="card" style={{ padding: 22 }}>
                  <h3 style={{ marginBottom: 6 }}>Remove speaker</h3>
                  <p className="admin-note" style={{ marginBottom: 12 }}>Deletes them from the site. Any meeting they were attached to stays, with no speaker.</p>
                  <ConfirmAction
                    action={deleteSpeaker.bind(null, speaker.id)}
                    confirm={`Delete ${speaker.firstName} ${speaker.lastName}? This cannot be undone.`}
                    className="btn danger"
                  >
                    Delete speaker
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
