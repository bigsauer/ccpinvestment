import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/components/public/Countdown";
import { PublicNav } from "@/components/public/Nav";
import { PageBannerCopy } from "@/components/public/PageBannerCopy";
import { getLivePageBlocks, getPastMeetings, getUpcomingMeetings } from "@/lib/queries";
import { dayNumber, displayName, meetingStatusLabel, monthName, weekdayName } from "@/lib/utils";

export const metadata: Metadata = { title: "Meetings" };
export const revalidate = 60;

export default async function MeetingsPage() {
  const [upcoming, past, blocks] = await Promise.all([
    getUpcomingMeetings(),
    getPastMeetings(),
    getLivePageBlocks("meetings"),
  ]);
  const next = upcoming[0] ?? null;

  return (
    <>
      <PublicNav />
      <header className="page-banner">
        <Image className="pb-img" src="/photos/session-04.jpg" alt="Chaminade Investment Club meeting" fill priority sizes="100vw" />
        <div className="pb-overlay" />
        <div className="wrap pb-content">
          <PageBannerCopy
            blocks={blocks}
            crumbs="Meetings · Fall 2026"
            lede="Meeting cadence varies — we schedule around speaker availability. Every session lists date, time, the guest speaker, and a short background on their firm and role."
          >
            Schedule &amp; <span className="serif">upcoming sessions.</span>
          </PageBannerCopy>
        </div>
        <div className="pb-caption">Past session · Speaker in front of the room</div>
      </header>

      <section className="section">
        <div className="wrap">
          {next ? (
            <div className="hero-meeting">
              <div className="left">
                <div className="tag">Next session</div>
                <h3>
                  {next.speaker
                    ? displayName(next.speaker.firstName, next.speaker.lastName)
                    : isStudentLed(next)
                      ? next.format
                      : "To be announced"}
                </h3>
                <div className="role">
                  {next.speaker
                    ? [next.speaker.title, next.speaker.firm].filter(Boolean).join(" · ")
                    : isStudentLed(next)
                      ? "Student-led session"
                      : "Speaker locking in"}
                </div>
                <p className="bio">
                  {next.speaker?.bio ||
                    (next.speaker
                      ? "More on this guest is coming soon."
                      : next.topic || "Details will appear here when the guest is confirmed.")}
                </p>
                <div className="meta">
                  <div>
                    <div className="k">Time</div>
                    <div className="v mono">{next.time}</div>
                  </div>
                  <div>
                    <div className="k">Location</div>
                    <div className="v">{next.location}</div>
                  </div>
                  <div>
                    <div className="k">Format</div>
                    <div className="v">{next.format}</div>
                  </div>
                  <div>
                    <div className="k">Duration</div>
                    <div className="v">{next.duration}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href="/get-involved?tab=students" className="btn red">
                    RSVP as a guest <span className="arrow">→</span>
                  </Link>
                  {next.speaker ? (
                    <Link href="/speakers" className="btn">
                      Speaker bio
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="right">
                <div>
                  <div className="date-box">
                    <div className="mo">
                      {monthName(next.date)} · {next.date.getFullYear()}
                    </div>
                    <div className="day">{dayNumber(next.date)}</div>
                    <div className="yr">{weekdayName(next.date)}</div>
                  </div>
                  <Countdown target={next.date.toISOString()} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: 10.5,
                      color: "var(--ink-4)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    Add to calendar
                  </div>
                  <div className="cal-group">
                    <a className="cal-btn" href={`/api/meetings/${next.id}/ics`}>
                      .ics
                    </a>
                    <a
                      className="cal-btn"
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarTitle(next))}&dates=${toGCal(next.date)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Google
                    </a>
                    <span className="cal-btn">Apple</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-note" style={{ marginBottom: 48 }}>
              <span className="em">No upcoming session</span>
              Officers publish the next meeting from the admin calendar.
            </div>
          )}

          <div className="section-head" style={{ marginTop: 0 }}>
            <div>
              <div className="section-label">Full schedule</div>
              <h2>All upcoming sessions.</h2>
            </div>
            <p>Dates below are confirmed unless marked TBA. A speaker bio and topic are added here as soon as they&apos;re locked in.</p>
          </div>

          <div className="table">
            <div className="table-head">
              <div>Date</div>
              <div>Time</div>
              <div>Speaker</div>
              <div>Firm</div>
              <div>Topic</div>
              <div style={{ textAlign: "right" }}>Status</div>
            </div>
            {upcoming.map((meeting, index) => (
              <div key={meeting.id} className={index === 0 ? "table-row next" : "table-row"}>
                <div className="cell-date">
                  {monthName(meeting.date)} {dayNumber(meeting.date)}
                  <span className="yr">{meeting.date.getFullYear()}</span>
                </div>
                <div className="cell-time">{meeting.time}</div>
                <div className="cell-speaker">
                  {meeting.speaker
                    ? displayName(meeting.speaker.firstName, meeting.speaker.lastName)
                    : isStudentLed(meeting)
                      ? "Student-led"
                      : "To be announced"}
                </div>
                <div className="cell-firm">
                  {meeting.speaker ? [meeting.speaker.firm, meeting.speaker.title].filter(Boolean).join(" — ") : "—"}
                </div>
                <div className="cell-topic">{isStudentLed(meeting) ? meeting.format : meeting.topic || "—"}</div>
                <div className="cell-status">
                  <span className={`pill ${index === 0 ? "live" : meeting.status === "TENTATIVE" ? "tba" : ""}`}>
                    {meetingStatusLabel(meeting.status, index === 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">Past sessions</div>
              <h2>
                Previous meetings, <span className="serif">on the record.</span>
              </h2>
            </div>
            <p>A look at past meetings — speakers, Q&amp;A, and the conversations that follow. Click through to see the full speaker archive.</p>
          </div>
          <div className="past-sessions">
            {past.slice(0, 4).map((meeting) => (
              <Link key={meeting.id} href="/speakers" className="past-card">
                {meeting.photoUrl ? (
                  <Image src={meeting.photoUrl} alt="" fill sizes="(max-width: 900px) 100vw, 40vw" />
                ) : (
                  <div className="spkr-fallback" />
                )}
                <div className="past-overlay">
                  <div className="date">
                    {monthName(meeting.date)} {dayNumber(meeting.date)} · {meeting.date.getFullYear()}
                  </div>
                  <div className="title">
                    {meeting.speaker ? displayName(meeting.speaker.firstName, meeting.speaker.lastName) : "Session"}
                  </div>
                  <div className="sub">
                    {meeting.speaker ? `${meeting.speaker.title} · ${meeting.speaker.firm}` : meeting.topic}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <Link href="/speakers" className="btn">
              Full speaker archive <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function toGCal(date: Date) {
  const start = date.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const endDate = new Date(date.getTime() + 45 * 60 * 1000);
  const end = endDate.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  return `${start}/${end}`;
}

/** A meeting with no guest speaker and a non-default format (e.g. student stock pitches). */
function isStudentLed(meeting: { speaker: unknown; format: string }) {
  return !meeting.speaker && meeting.format !== "Talk + Q&A";
}

function calendarTitle(meeting: { speaker: { firstName: string; lastName: string } | null; format: string }) {
  if (meeting.speaker) return `CIC — ${meeting.speaker.firstName} ${meeting.speaker.lastName}`;
  return isStudentLed(meeting) ? `CIC — ${meeting.format}` : "CIC meeting";
}
