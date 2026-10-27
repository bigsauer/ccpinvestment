import { cleanHref } from "@/lib/page-blocks";

export type NavLink = { label: string; href: string };

/** The menu the site ships with, shown whenever officers have not customised it. */
export const DEFAULT_NAV: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/meetings", label: "Meetings" },
  { href: "/speakers", label: "Speakers" },
  { href: "/get-involved", label: "Get involved" },
  { href: "/team", label: "Team" },
];

/** Pages built into the site, for the menu editor's "goes to" list. */
export const BUILT_IN_PAGES: NavLink[] = [
  ...DEFAULT_NAV,
  { href: "/get-involved?tab=students", label: "Apply to join (form)" },
  { href: "/get-involved?tab=speakers", label: "Speak to us (form)" },
];

export const MAX_NAV_ITEMS = 8;

/** Cleans a menu coming from the editor: known-safe links only, sane lengths, at most 8 entries. */
export function sanitizeNav(raw: unknown): (NavLink & { visible: boolean })[] {
  if (!Array.isArray(raw)) return [];
  const out: (NavLink & { visible: boolean })[] = [];
  for (const entry of raw.slice(0, MAX_NAV_ITEMS)) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    const label = typeof e.label === "string" ? e.label.trim().slice(0, 30) : "";
    const href = cleanHref(e.href);
    if (!label || !href) continue;
    out.push({ label, href, visible: e.visible !== false });
  }
  return out;
}
