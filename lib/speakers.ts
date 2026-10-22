/** Shared (server + client safe) speaker helpers and types. */

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
