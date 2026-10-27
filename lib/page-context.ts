import { SITE_IMAGE_SLOTS, resolveSiteImage, type ResolvedImage, type SiteImageSlot } from "@/lib/site-images";

/** What site-section blocks need from the rest of the site (settings, replaceable photos, next meeting). */
export type PageCtx = {
  settings: {
    name: string;
    foundedYear: string;
    seasonLabel: string;
    statMembers: string;
    statSpeakers: string;
    statSessions: string;
    heroCaption: string;
  };
  images: Record<SiteImageSlot, ResolvedImage>;
  /** Small text next to the season on the home opening, e.g. "NEXT SESSION · NOV 4". */
  nextLabel: string;
};

/** Stand-in used by the editor preview, where the live site data is not loaded. */
export function previewCtx(): PageCtx {
  return {
    settings: {
      name: "Chaminade Investment Club",
      foundedYear: "2024",
      seasonLabel: "Fall 2026",
      statMembers: "60+",
      statSpeakers: "12+",
      statSessions: "24+",
      heroCaption: "",
    },
    images: Object.fromEntries(SITE_IMAGE_SLOTS.map((def) => [def.slot, resolveSiteImage(def, null)])) as Record<SiteImageSlot, ResolvedImage>,
    nextLabel: "NEXT SESSION · NOV 4",
  };
}
