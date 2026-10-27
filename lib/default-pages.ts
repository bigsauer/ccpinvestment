import { blockDef, type Block, type BlockType } from "@/lib/page-blocks";

/**
 * The club's own pages, described with the same blocks the page builder offers. These are what the site
 * shows until an officer edits a page; saving a page stores a copy in the database (see /admin/pages).
 */
export type SystemSlug = "home" | "meetings" | "speakers" | "team" | "get-involved";

export type SystemPageDef = {
  slug: SystemSlug;
  path: string;
  title: string;
  /** Search and share description. */
  description: string;
  blocks: Block[];
};

function mk(id: string, type: BlockType, overrides: Record<string, unknown> = {}): Block {
  const def = blockDef(type)!;
  return { id, type, ...structuredClone(def.defaults), ...overrides } as Block;
}

export const SYSTEM_PAGES: SystemPageDef[] = [
  {
    slug: "home",
    path: "/",
    title: "Home",
    description:
      "Student-run finance club at Chaminade College Preparatory School in St. Louis. Hear from working professionals, pitch stocks, and learn how investing really works.",
    blocks: [
      mk("home-hero", "homeHero"),
      mk("home-logos", "logoBand"),
      mk("home-stats", "homeStats"),
      mk("home-features", "featureGrid"),
      mk("home-pitch", "pitch"),
      mk("home-cta", "ctaBand"),
    ],
  },
  {
    slug: "meetings",
    path: "/meetings",
    title: "Meeting Schedule & Upcoming Sessions",
    description:
      "See the next Chaminade Investment Club meetings: dates, times, location, guest speakers, and student-led stock pitch sessions at Chaminade College Prep in St. Louis.",
    blocks: [
      mk("meetings-banner", "pageBanner", {
        crumbs: "Meetings · {season}",
        headline: "Schedule & *upcoming sessions.*",
        lede: "Meeting cadence varies — we schedule around speaker availability. Every session lists date, time, the guest speaker, and a short background on their firm and role.",
        caption: "Past session · Speaker in front of the room",
        imageSlot: "meetings-banner",
      }),
      mk("meetings-body", "meetingsSchedule"),
    ],
  },
  {
    slug: "speakers",
    path: "/speakers",
    title: "Guest Speakers: Past & Upcoming",
    description:
      "Meet the working professionals who have spoken to Chaminade Investment Club students: executives, founders, and investors, plus who is coming up next.",
    blocks: [
      mk("speakers-banner", "pageBanner", {
        crumbs: "Speakers · Present & Past",
        headline: "The people *in the room.*",
        lede: "Guests are the core of the club. Professionals who've shaped careers in equities, banking, venture, and macro — and who answer real questions from students who've done the reading.",
        caption: "Past session · Members & guest",
        imageSlot: "speakers-banner",
      }),
      mk("speakers-archive", "speakerArchive"),
    ],
  },
  {
    slug: "team",
    path: "/team",
    title: "The Team: Student Members & Faculty Advisor",
    description:
      "Meet the students who run the Chaminade Investment Club together, and the faculty advisor who supports them, at Chaminade College Preparatory School in St. Louis.",
    blocks: [
      mk("team-banner", "pageBanner", {
        crumbs: "Team · Members & Advisor",
        headline: "Student-run, *end to end.*",
        lede: "Members run the club together: speaker outreach, programming, the paper portfolio, and everything in between. No faculty ghost-writer, no pre-made script.",
        caption: "Networking · Post-session",
        imageSlot: "team-banner",
      }),
      mk("team-people", "teamPeople"),
    ],
  },
  {
    slug: "get-involved",
    path: "/get-involved",
    title: "Join the Club or Speak to Students",
    description:
      "Chaminade students can apply to join the investment club, and working professionals can apply to speak. Free to join, no experience needed. St. Louis.",
    blocks: [
      mk("gi-banner", "pageBanner", {
        crumbs: "Get involved · Two ways in",
        headline: "Pick the door *that's yours.*",
        lede: "If you're a student at Chaminade, apply to join — it's free, no experience needed, and meetings start at 6:45 AM on Wednesday mornings. If you're a working professional, come tell our students what you actually do — 35 minutes, real questions, no pitching.",
        caption: "",
        imageSlot: "",
      }),
      mk("gi-forms", "joinForms"),
    ],
  },
];

export const SYSTEM_SLUGS = SYSTEM_PAGES.map((p) => p.slug) as SystemSlug[];

export function isSystemSlug(slug: string): slug is SystemSlug {
  return (SYSTEM_SLUGS as string[]).includes(slug);
}

export function systemPageDef(slug: string) {
  return SYSTEM_PAGES.find((p) => p.slug === slug) ?? null;
}
