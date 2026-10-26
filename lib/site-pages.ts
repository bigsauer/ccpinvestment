/** The public pages whose headline copy officers can edit, and the wording they show until edited. */
export type EditablePage = {
  slug: string;
  title: string;
  path: string;
  /** Home has no breadcrumb line. */
  hasCrumbs: boolean;
  defaults: { crumbs?: string; headline: string; serif: string; lede: string };
};

export const EDITABLE_PAGES: EditablePage[] = [
  {
    slug: "home",
    title: "Home",
    path: "/",
    hasCrumbs: false,
    defaults: {
      headline: "Where the next generation of investors",
      serif: "meets the market.",
      lede: "A student-run club at Chaminade College Preparatory School bringing working professionals — portfolio managers, bankers, founders — into the room with students who are serious about finance.",
    },
  },
  {
    slug: "meetings",
    title: "Meetings",
    path: "/meetings",
    hasCrumbs: true,
    defaults: {
      crumbs: "Meetings · (current season)",
      headline: "Schedule & upcoming sessions.",
      serif: "",
      lede: "Meeting cadence varies — we schedule around speaker availability. Every session lists date, time, the guest speaker, and a short background on their firm and role.",
    },
  },
  {
    slug: "speakers",
    title: "Speakers",
    path: "/speakers",
    hasCrumbs: true,
    defaults: {
      crumbs: "Speakers · Present & Past",
      headline: "The people",
      serif: "in the room.",
      lede: "Guests are the core of the club. Professionals who've shaped careers in equities, banking, venture, and macro — and who answer real questions from students who've done the reading.",
    },
  },
  {
    slug: "team",
    title: "Team",
    path: "/team",
    hasCrumbs: true,
    defaults: {
      crumbs: "Team · Members & Advisor",
      headline: "Student-run,",
      serif: "end to end.",
      lede: "Members run the club together: speaker outreach, programming, the paper portfolio, and everything in between. No faculty ghost-writer, no pre-made script.",
    },
  },
  {
    slug: "get-involved",
    title: "Get involved",
    path: "/get-involved",
    hasCrumbs: true,
    defaults: {
      crumbs: "Get involved · Two ways in",
      headline: "Pick the door",
      serif: "that's yours.",
      lede: "If you're a student at Chaminade, apply to join — it's free, no experience needed, and meetings start at 6:45 AM on Wednesday mornings. If you're a working professional, come tell our students what you actually do — 35 minutes, real questions, no pitching.",
    },
  },
];
