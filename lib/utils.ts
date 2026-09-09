export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function avatarTone(key: string): "b1" | "b2" | "b3" | "b4" | "b5" | "b6" {
  const tones = ["b1", "b2", "b3", "b4", "b5", "b6"] as const;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i) * (i + 1)) % 97;
  return tones[hash % tones.length]!;
}

export function displayName(first: string, last: string) {
  return `${first} ${last}`.trim();
}

export function formatMeetingDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(date);
}

export function weekdayName(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/Chicago",
  }).format(date);
}

export function monthName(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "America/Chicago",
  }).format(date);
}

export function dayNumber(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    timeZone: "America/Chicago",
  }).format(date);
}

export function linkedinHandle(url: string) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  }
}

export function roleLabel(role: string) {
  switch (role) {
    case "PRESIDENT":
      return "President";
    case "VP":
      return "Vice President";
    case "SECRETARY":
      return "Secretary";
    case "TREASURER":
      return "Treasurer";
    case "ADVISOR":
      return "Faculty advisor";
    default:
      return role;
  }
}

export function greetingForNow(now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Chicago",
    }).format(now),
  );
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/Chicago",
  }).format(now);
  if (hour < 12) return `${weekday} morning`;
  if (hour < 17) return `${weekday} afternoon`;
  return `${weekday} evening`;
}

export function daysUntil(date: Date, now = new Date()) {
  const ms = date.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function relativeWhen(date: Date, now = new Date()) {
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24 && now.getDate() === date.getDate()) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Chicago",
    }).format(date);
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatShortDate(date);
}

export function meetingStatusLabel(status: string, isNext: boolean) {
  if (isNext) return "Next";
  switch (status) {
    case "CONFIRMED":
      return "Confirmed";
    case "TENTATIVE":
      return "TBA";
    case "OPEN":
      return "Open";
    default:
      return status;
  }
}
