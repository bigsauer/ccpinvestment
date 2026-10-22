import Image from "next/image";
import Link from "next/link";
import { localPhoto } from "@/lib/speakers";
import { speakerSlug } from "@/lib/site";
import { dayNumber, displayName, monthName, weekdayName } from "@/lib/utils";

export type UpcomingMeeting = {
  id: string;
  date: Date;
  time: string;
  location: string;
  topic: string;
  format: string;
  status: string;
  speaker: {
    firstName: string;
    lastName: string;
    title: string;
    firm: string;
    bio: string;
    photoUrl: string | null;
  } | null;
};

/** A meeting with no guest speaker and a non-default format (e.g. student stock pitches). */
export function isStudentLed(meeting: { speaker: unknown; format: string }) {
  return !meeting.speaker && meeting.format !== "Talk + Q&A";
}

export function hasStockPitches(meeting: { format: string }) {
  return /stock/i.test(meeting.format);
}

export const STUDENT_STEPS = [
  "Small groups research the stocks the club assigned",
  "Each group presents its findings to the room",
  "Members weigh in: add it to the club's account, or pass",
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Sparkline({ className = "" }: { className?: string }) {
  return (
    <svg className={`up-spark ${className}`.trim()} viewBox="0 0 220 64" fill="none" aria-hidden="true">
      <path pathLength="1" d="M2 52 C 26 50, 34 34, 62 38 S 108 14, 134 24 S 186 8, 216 6" />
      <circle cx="216" cy="6" r="4" />
    </svg>
  );
}

export function UpcomingCard({ meeting, isNext }: { meeting: UpcomingMeeting; isNext: boolean }) {
  const s = meeting.speaker;
  const student = isStudentLed(meeting);
  const photo = localPhoto(s?.photoUrl);
  const slug = s ? speakerSlug(s.firstName, s.lastName) : null;
  const role = s ? [s.title, s.firm].filter(Boolean).join(", ") : "";
  const blurb = s ? s.bio || meeting.topic : meeting.topic;

  return (
    <article className={["up-card", student ? "is-student" : "", isNext ? "is-next" : ""].filter(Boolean).join(" ")}>
      <time className="up-date" dateTime={meeting.date.toISOString()}>
        <span className="mo">{monthName(meeting.date)}</span>
        <span className="day">{dayNumber(meeting.date)}</span>
        <span className="wd">{weekdayName(meeting.date)}</span>
      </time>

      <div className="up-main">
        {student ? <Sparkline /> : null}
        <div className="up-tags">
          <span className={`up-badge ${student ? "student" : "guest"}`}>
            {student ? "Student session" : s ? "Guest speaker" : "Speaker TBA"}
          </span>
          {isNext ? (
            <span className="up-badge live">Next up</span>
          ) : (
            <span className={`up-badge ${meeting.status === "TENTATIVE" ? "tba" : "ok"}`}>
              {meeting.status === "TENTATIVE" ? "TBA" : "Confirmed"}
            </span>
          )}
        </div>

        {s ? (
          <div className="up-speaker">
            <div className="up-avatar">
              {photo ? (
                <Image src={photo} alt="" fill sizes="72px" />
              ) : (
                <span>{`${s.firstName[0] ?? ""}${s.lastName[0] ?? ""}`}</span>
              )}
            </div>
            <div>
              <h3 className="up-title">
                <Link href={`/speakers/${slug}`}>{displayName(s.firstName, s.lastName)}</Link>
              </h3>
              {role ? <p className="up-role">{role}</p> : null}
            </div>
          </div>
        ) : (
          <div className="up-speaker no-photo">
            <div>
              <h3 className="up-title">{student ? meeting.format : "To be announced"}</h3>
              <p className="up-role">{student ? "Student-led · no outside speaker" : "Speaker locking in"}</p>
            </div>
          </div>
        )}

        {blurb ? <p className="up-text">{blurb}</p> : null}

        {student && hasStockPitches(meeting) ? (
          <ol className="up-steps">
            {STUDENT_STEPS.map((step, i) => (
              <li key={step} style={{ "--n": i } as React.CSSProperties}>
                <span>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        ) : null}

        <ul className="up-meta">
          <li>
            <Icon d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            {meeting.time}
          </li>
          <li>
            <Icon d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
            {meeting.location}
          </li>
          <li>
            <Icon d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
            {weekdayName(meeting.date)}
          </li>
        </ul>

        <div className="up-actions">
          {slug ? (
            <Link href={`/speakers/${slug}`} className="btn">
              Speaker profile <span className="arrow">→</span>
            </Link>
          ) : null}
          <a className="btn" href={`/api/meetings/${meeting.id}/ics`}>
            Add to calendar
          </a>
          <Link href="/get-involved?tab=students" className="btn red">
            RSVP <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
