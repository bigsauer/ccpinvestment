// Meetings happen in St. Louis. Form inputs are wall-clock times in that zone, but servers run in UTC,
// so convert explicitly instead of relying on the server's timezone.
export const CLUB_TZ = "America/Chicago";

function offsetMinutes(at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLUB_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(at.getTime() / 1000) * 1000) / 60000);
}

/** "2026-11-04T06:45" (St. Louis wall clock) -> the matching instant. Returns null if empty or invalid. */
export function chicagoToDate(local: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/.exec(local.trim());
  if (!match) return null;
  const [, y, mo, d, h = "06", mi = "45"] = match;
  const guess = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  let result = guess - offsetMinutes(new Date(guess)) * 60000;
  result = guess - offsetMinutes(new Date(result)) * 60000; // settle across a DST change
  const date = new Date(result);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** An instant -> "2026-11-04T06:45" in St. Louis time, for <input type="datetime-local">. */
export function dateToChicagoLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLUB_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** "6:45 AM" for an instant, in St. Louis time. */
export function clockLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: CLUB_TZ, hour: "numeric", minute: "2-digit" }).format(date);
}
