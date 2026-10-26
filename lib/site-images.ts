/** The photos on the public site that officers can replace, and how each one is shown. */
export type SiteImageSlot = "home-hero" | "home-inside" | "meetings-banner" | "speakers-banner" | "team-banner";

export type SlotDef = {
  slot: SiteImageSlot;
  label: string;
  where: string;
  /** hero: tall photo behind the home headline; banner: wide photo behind a page title; pitch: framed photo beside text. */
  kind: "hero" | "banner" | "pitch";
  path: string;
  defaultSrc: string;
  defaultAlt: string;
  defaultFocus: { x: number; y: number };
  /** Sample headline shown over the preview so legibility can be judged. */
  sample: { eyebrow: string; title: string };
};

export const SITE_IMAGE_SLOTS: SlotDef[] = [
  {
    slot: "home-hero",
    label: "Home page: main photo",
    where: "The big photo behind the headline at the top of the home page.",
    kind: "hero",
    path: "/",
    defaultSrc: "/photos/session-02.jpg",
    defaultAlt: "A Chaminade Investment Club meeting in session",
    defaultFocus: { x: 50, y: 50 },
    sample: { eyebrow: "FALL 2026", title: "Where the next generation of investors meets the market." },
  },
  {
    slot: "home-inside",
    label: "Home page: “Inside the club” photo",
    where: "The framed photo next to “Run by students, built for real work.”",
    kind: "pitch",
    path: "/",
    defaultSrc: "/photos/session-07.jpg",
    defaultAlt: "A Chaminade Investment Club meeting in progress",
    defaultFocus: { x: 50, y: 50 },
    sample: { eyebrow: "", title: "" },
  },
  {
    slot: "meetings-banner",
    label: "Meetings page: banner",
    where: "The wide photo behind the Meetings page title.",
    kind: "banner",
    path: "/meetings",
    defaultSrc: "/photos/session-04.jpg",
    defaultAlt: "Chaminade Investment Club meeting",
    defaultFocus: { x: 50, y: 30 },
    sample: { eyebrow: "MEETINGS", title: "Schedule & upcoming sessions." },
  },
  {
    slot: "speakers-banner",
    label: "Speakers page: banner",
    where: "The wide photo behind the Speakers page title.",
    kind: "banner",
    path: "/speakers",
    defaultSrc: "/photos/session-05.jpg",
    defaultAlt: "Chaminade Investment Club meeting",
    defaultFocus: { x: 50, y: 30 },
    sample: { eyebrow: "SPEAKERS", title: "The people in the room." },
  },
  {
    slot: "team-banner",
    label: "Team page: banner",
    where: "The wide photo behind the Team page title.",
    kind: "banner",
    path: "/team",
    defaultSrc: "/photos/session-06.jpg",
    defaultAlt: "Chaminade Investment Club meeting",
    defaultFocus: { x: 50, y: 30 },
    sample: { eyebrow: "TEAM", title: "Student-run, end to end." },
  },
];

export function slotDef(slot: string) {
  return SITE_IMAGE_SLOTS.find((s) => s.slot === slot) ?? null;
}

export type ResolvedImage = {
  src: string;
  alt: string;
  x: number;
  y: number;
  style: { objectPosition: string };
  custom: boolean;
};

export function resolveSiteImage(def: SlotDef, row?: { photoUrl: string; focusX: number; focusY: number; alt: string } | null): ResolvedImage {
  const x = row ? row.focusX : def.defaultFocus.x;
  const y = row ? row.focusY : def.defaultFocus.y;
  return {
    src: row ? row.photoUrl : def.defaultSrc,
    alt: (row?.alt || def.defaultAlt).trim(),
    x,
    y,
    style: { objectPosition: `${x}% ${y}%` },
    custom: Boolean(row),
  };
}
