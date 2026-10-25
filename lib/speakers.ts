/** Shared (server + client safe) speaker helpers and types. */

export type StoryStep = { when?: string; title: string; org?: string; detail: string };
export type StoryPillar = { title: string; text: string };
export type SpeakerHighlights = { timeline: StoryStep[]; pillars: StoryPillar[] };

const str = (v: unknown, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validates the stored JSON; returns null unless there is something worth animating. */
export function parseHighlights(raw: unknown): SpeakerHighlights | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { timeline?: unknown; pillars?: unknown };
  const timeline = (Array.isArray(r.timeline) ? r.timeline : [])
    .map((x): StoryStep | null => {
      const o = (x ?? {}) as Record<string, unknown>;
      const title = str(o.title, 140);
      const detail = str(o.detail);
      if (!title || !detail) return null;
      return { title, detail, when: str(o.when, 40) || undefined, org: str(o.org, 140) || undefined };
    })
    .filter((x): x is StoryStep => x !== null)
    .slice(0, 12);
  const pillars = (Array.isArray(r.pillars) ? r.pillars : [])
    .map((x): StoryPillar | null => {
      const o = (x ?? {}) as Record<string, unknown>;
      const title = str(o.title, 80);
      const text = str(o.text);
      return title && text ? { title, text } : null;
    })
    .filter((x): x is StoryPillar => x !== null)
    .slice(0, 8);
  return timeline.length || pillars.length ? { timeline, pillars } : null;
}

export type PublicSpeaker = {
  id: string;
  firstName: string;
  lastName: string;
  firm: string;
  title: string;
  topic: string;
  bio?: string;
  industry?: string | null;
  season: string | null;
  status: "UPCOMING" | "PAST";
  sessionDate: string | null;
  photoUrl?: string | null;
  highlights?: SpeakerHighlights | null;
  linkedinUrl: string | null;
};

/** Local images only (served from /public); anything else falls back to initials. */
export function localPhoto(url?: string | null) {
  return url && url.startsWith("/") && !url.startsWith("//") ? url : null;
}

export function tagLabel(speaker: PublicSpeaker) {
  if (!speaker.sessionDate) return speaker.status === "UPCOMING" ? "Upcoming" : "Past";
  const label = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "America/Chicago",
  }).format(new Date(speaker.sessionDate));
  return speaker.status === "UPCOMING" ? `Upcoming · ${label}` : `Past · ${label}`;
}

/** One-line description for share sheets: who they are and when they speak or spoke. */
export function speakerShareText(speaker: {
  firstName: string;
  lastName: string;
  title: string;
  firm: string;
  status: string;
  sessionDate: Date | string | null;
}) {
  const name = `${speaker.firstName} ${speaker.lastName}`;
  const role = [speaker.title, speaker.firm].filter(Boolean).join(", ");
  const upcoming = speaker.status === "UPCOMING";
  const when = speaker.sessionDate
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" }).format(
        new Date(speaker.sessionDate),
      )
    : null;
  const lead = role ? `${name}, ${role}` : name;
  if (when) return `${lead}: ${upcoming ? "speaking to Chaminade Investment Club students on" : "spoke to Chaminade Investment Club students on"} ${when}`;
  return `${lead}: ${upcoming ? "an upcoming guest speaker" : "a past guest speaker"} at Chaminade Investment Club`;
}
