import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/public/CountUp";
import { Countdown } from "@/components/public/Countdown";
import { PublicNav } from "@/components/public/Nav";
import { PageBannerCopy } from "@/components/public/PageBannerCopy";
import { Reveal } from "@/components/public/Reveal";
import { localPhoto } from "@/lib/speakers";
import {
  STUDENT_STEPS,
  Sparkline,
  UpcomingCard,
  hasStockPitches,
  isStudentLed,
  type UpcomingMeeting,
} from "@/components/public/UpcomingCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLivePageBlocks, getPastMeetings, getSpeakers, getUpcomingMeetings } from "@/lib/queries";
import { SCHOOL_ADDRESS, SITE, absoluteUrl, pageMeta, speakerSlug } from "@/lib/site";
import { dayNumber, displayName, monthName, weekdayName } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "Meeting Schedule & Upcoming Sessions",
  description:
    "See the next Chaminade Investment Club meetings: dates, times, location, guest speakers, and student-led stock pitch sessions at Chaminade College Prep in St. Louis.",
  path: "/meetings",
});
export const revalidate = 60;

export default async function MeetingsPage() {
  const [upcoming, pastMeetings, blocks, speakers] = await Promise.all([
    getUpcomingMeetings(),
    getPastMeetings(),
    getLivePageBlocks("meetings"),
    getSpeakers(),
  ]);
  // Past sessions come from logged meetings; until officers log those, the speaker archive fills in.
  const past: Array<{ key: string; href: string; photo: string | null; date: Date; title: string; sub: string }> =
    pastMeetings.length > 0
      ? pastMeetings.slice(0, 5).map((m) => ({
          key: m.id,
          href: m.speaker ? `/speakers/${speakerSlug(m.speaker.firstName, m.speaker.lastName)}` : "/speakers",
          photo: localPhoto(m.photoUrl ?? m.speaker?.photoUrl),
          date: m.date,
          title: m.speaker ? displayName(m.speaker.firstName, m.speaker.lastName) : "Session",
          sub: m.speaker ? [m.speaker.title, m.speaker.firm].filter(Boolean).join(" · ") : m.topic,
        }))
      : speakers
          .filter((sp) => sp.status === "PAST" && sp.sessionDate && localPhoto(sp.photoUrl))
          .slice(0, 5)
          .map((sp) => ({
            key: sp.id,
            href: `/speakers/${speakerSlug(sp.firstName, sp.lastName)}`,
            photo: localPhoto(sp.photoUrl),
            date: sp.sessionDate as Date,
            title: displayName(sp.firstName, sp.lastName),
            sub: [sp.title, sp.firm].filter(Boolean).join(" · "),
          }));
  const next = upcoming[0] ?? null;
  const nextStudent = next ? isStudentLed(next) : false;
  const nextPhoto = localPhoto(next?.speaker?.photoUrl);

  const events = upcoming.map((m) => {
    const photo = localPhoto(m.speaker?.photoUrl);
    const name = m.speaker ? displayName(m.speaker.firstName, m.speaker.lastName) : null;
    return {
      "@type": "Event",
      name: name ? `${name} at the ${SITE.name}` : `${SITE.name}: ${m.format}`,
      description:
        (m.speaker?.bio || m.topic || `${m.format} session of the ${SITE.name} at ${SITE.school.name}.`).slice(0, 300),
      startDate: m.date.toISOString(),
      endDate: new Date(m.date.getTime() + 45 * 60 * 1000).toISOString(),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      location: { "@type": "Place", name: `${m.location}, ${SITE.school.name}`, address: SCHOOL_ADDRESS },
      organizer: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") },
      image: [photo ? absoluteUrl(photo) : absoluteUrl("/brand/share.jpg")],
      url: absoluteUrl("/meetings"),
      ...(m.speaker
        ? {
            performer: {
              "@type": "Person",
              name,
              url: absoluteUrl(`/speakers/${speakerSlug(m.speaker.firstName, m.speaker.lastName)}`),
              ...(m.speaker.title ? { jobTitle: m.speaker.title } : {}),
            },
          }
        : {}),
    };
  });

  return (
    <>
      {events.length > 0 ? <JsonLd data={events.map((e) => ({ "@context": "https://schema.org", ...e }))} /> : null}
      <PublicNav />
      <main>
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
            <Reveal>
              <div className={nextStudent ? "hero-meeting student" : "hero-meeting"}>
                <div className="left">
                  {nextStudent ? <Sparkline className="hero-spark" /> : null}
                  <div className="tag">{nextStudent ? "Next session · Student-led" : "Next session"}</div>
                  <div className="hm-head">
                    {next.speaker ? (
                      <div className="up-avatar big">
                        {nextPhoto ? (
                          <Image src={nextPhoto} alt="" fill sizes="88px" />
                        ) : (
                          <span>{`${next.speaker.firstName[0] ?? ""}${next.speaker.lastName[0] ?? ""}`}</span>
                        )}
                      </div>
                    ) : null}
                    <div>
                      <h2 className="hm-title">
                        {next.speaker
                          ? displayName(next.speaker.firstName, next.speaker.lastName)
                          : nextStudent
                            ? next.format
                            : "To be announced"}
                      </h2>
                      <div className="role">
                        {next.speaker
                          ? [next.speaker.title, next.speaker.firm].filter(Boolean).join(" · ")
                          : nextStudent
                            ? "Student-led session · no outside speaker"
                            : "Speaker locking in"}
                      </div>
                    </div>
                  </div>
                  <p className="bio">
                    {next.speaker?.bio ||
                      (next.speaker
                        ? "More on this guest is coming soon."
                        : next.topic || "Details will appear here when the guest is confirmed.")}
                  </p>
                  {nextStudent && hasStockPitches(next) ? (
                    <ol className="up-steps">
                      {STUDENT_STEPS.map((step, i) => (
                        <li key={step} style={{ "--n": i } as React.CSSProperties}>
                          <span>{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  ) : null}
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
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Link href="/get-involved?tab=students" className="btn red">
                      RSVP as a guest <span className="arrow">→</span>
                    </Link>
                    {next.speaker ? (
                      <Link href={`/speakers/${speakerSlug(next.speaker.firstName, next.speaker.lastName)}`} className="btn">
                        Speaker profile
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
                      <div className="day">
                        <CountUp value={dayNumber(next.date)} pad={2} duration={1200} />
                      </div>
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
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarTitle(next))}&dates=${toGCal(next.date)}&location=${encodeURIComponent(next.location)}`}
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
            </Reveal>
          ) : (
            <div className="empty-note" style={{ marginBottom: 48 }}>
              <span className="em">No upcoming session</span>
              The next meeting is posted here as soon as it&apos;s scheduled.
            </div>
          )}

          <Reveal>
            <div className="section-head" style={{ marginTop: 0 }}>
              <div>
                <div className="section-label">Full schedule</div>
                <h2>All upcoming sessions.</h2>
              </div>
              <p>Dates below are confirmed unless marked TBA. A speaker bio and topic are added here as soon as they&apos;re locked in.</p>
            </div>
          </Reveal>

          <div className="up-grid">
            {upcoming.map((meeting, index) => (
              <Reveal key={meeting.id} delay={index * 110}>
                <UpcomingCard meeting={meeting as UpcomingMeeting} isNext={index === 0} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <div>
                <div className="section-label">Past sessions</div>
                <h2>
                  Previous meetings, <span className="serif">on the record.</span>
                </h2>
              </div>
              <p>A look at past meetings — speakers, Q&amp;A, and the conversations that follow. Click through to see the full speaker archive.</p>
            </div>
          </Reveal>
          {past.length > 0 ? (
            <div className="past-sessions" data-count={past.length}>
              {past.map((item) => (
                <Link key={item.key} href={item.href} className="past-card">
                  {item.photo ? (
                    <Image src={item.photo} alt="" fill sizes="(max-width: 900px) 100vw, 40vw" />
                  ) : (
                    <div className="spkr-fallback" />
                  )}
                  <div className="past-overlay">
                    <div className="date">
                      {monthName(item.date)} {dayNumber(item.date)} · {item.date.getFullYear()}
                    </div>
                    <div className="title">{item.title}</div>
                    <div className="sub">{item.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <Link href="/speakers" className="btn">
              Full speaker archive <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

function calendarTitle(meeting: { speaker: { firstName: string; lastName: string } | null; format: string }) {
  if (meeting.speaker) return `CIC — ${meeting.speaker.firstName} ${meeting.speaker.lastName}`;
  return isStudentLed(meeting) ? `CIC — ${meeting.format}` : "CIC meeting";
}

function toGCal(date: Date) {
  const start = date.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const endDate = new Date(date.getTime() + 45 * 60 * 1000);
  const end = endDate.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  return `${start}/${end}`;
}
