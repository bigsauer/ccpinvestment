import { asStringBlocks } from "@/lib/copy";
import { prisma } from "@/lib/db";
import { safeHttpUrl } from "@/lib/safe-url";
import { speakerSlug } from "@/lib/site";
import { DEFAULT_NAV, type NavLink } from "@/lib/nav";
import { sanitizeBlocks, type Block } from "@/lib/page-blocks";
import { isSystemSlug, systemPageDef } from "@/lib/default-pages";
import type { PageCtx } from "@/lib/page-context";
import { formatShortDate } from "@/lib/utils";
import { SITE_IMAGE_SLOTS, resolveSiteImage, type ResolvedImage, type SiteImageSlot } from "@/lib/site-images";

export async function getLivePageBlocks(slug: string) {
  const page = await prisma.pageContent.findUnique({ where: { slug } });
  if (!page || page.status !== "LIVE") return {} as Record<string, string>;
  return asStringBlocks(page.blocks);
}

/** Every replaceable website photo, with the officer's replacement and crop if there is one. */
export async function getSiteImages() {
  const rows = await prisma.siteImage.findMany();
  return Object.fromEntries(
    SITE_IMAGE_SLOTS.map((def) => [def.slot, resolveSiteImage(def, rows.find((row) => row.slot === def.slot))]),
  ) as Record<SiteImageSlot, ResolvedImage>;
}

export async function getClubSettings() {
  return (
    (await prisma.clubSettings.findUnique({ where: { id: "club" } })) ?? {
      id: "club",
      name: "Chaminade Investment Club",
      shortName: "CIC",
      foundedYear: "2024",
      meetingLocation: "ISC",
      meetingTime: "6:45 AM",
      seasonLabel: "Fall 2026",
      statMembers: "60+",
      statSpeakers: "12+",
      statSessions: "24+",
      heroCaption: "",
      contactEmail: null as string | null,
      instagramUrl: null as string | null,
      classYearFrom: 2027,
      classYearTo: 2035,
    }
  );
}

export async function getNextMeeting() {
  return prisma.meeting.findFirst({
    where: { published: true, date: { gte: new Date() } },
    include: { speaker: true },
    orderBy: { date: "asc" },
  });
}

export async function getUpcomingMeetings() {
  return prisma.meeting.findMany({
    where: { published: true, date: { gte: new Date() } },
    include: { speaker: true },
    orderBy: { date: "asc" },
  });
}

export async function getPastMeetings() {
  return prisma.meeting.findMany({
    where: { published: true, date: { lt: new Date() } },
    include: { speaker: true },
    orderBy: { date: "desc" },
    take: 8,
  });
}

export async function getSpeakers() {
  const speakers = await prisma.speaker.findMany({
    orderBy: [{ status: "asc" }, { sessionDate: { sort: "desc", nulls: "last" } }],
  });
  return speakers.map((speaker) => ({
    ...speaker,
    linkedinUrl: safeHttpUrl(speaker.linkedinUrl),
  }));
}

export async function getPublicOfficers() {
  return prisma.officer.findMany({
    where: { active: true },
    orderBy: { role: "asc" },
    select: {
      id: true,
      name: true,
      role: true,
      classYear: true,
      bio: true,
      photoUrl: true,
    },
  });
}

/** Active members who have supplied a photo for the site. Names and photos only, never email. */
export async function getPublicMembers() {
  return prisma.member.findMany({
    where: { status: "ACTIVE", photoUrl: { not: null } },
    orderBy: [{ gradYear: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true, gradYear: true, photoUrl: true },
  });
}

export async function getDashboardStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [activeMembers, membersThisWeek, openApps, appsThisWeek, speakersBooked, nextMeeting, recentActivity] =
    await Promise.all([
      prisma.member.count({ where: { status: "ACTIVE" } }),
      prisma.member.count({ where: { status: "ACTIVE", joinedAt: { gte: weekAgo } } }),
      prisma.application.count({ where: { status: { in: ["NEW", "REVIEWING"] } } }),
      prisma.application.count({
        where: { status: { in: ["NEW", "REVIEWING"] }, submittedAt: { gte: weekAgo } },
      }),
      prisma.speaker.count({ where: { status: "UPCOMING" } }),
      getNextMeeting(),
      prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);

  const avgAttendance = await prisma.meeting.aggregate({
    where: { published: true, date: { lt: now }, rsvpCount: { gt: 0 } },
    _avg: { rsvpCount: true },
  });

  return {
    activeMembers,
    membersThisWeek,
    openApps,
    appsThisWeek,
    speakersBooked,
    avgAttendance: Math.round(avgAttendance._avg.rsvpCount ?? 0),
    nextMeeting,
    recentActivity,
  };
}

export async function getSpeakerBySlug(slug: string) {
  const speakers = await getSpeakers();
  return speakers.find((s) => speakerSlug(s.firstName, s.lastName) === slug) ?? null;
}

export async function getMeetingForSpeaker(speakerId: string) {
  return prisma.meeting.findFirst({
    where: { speakerId, published: true },
    orderBy: { date: "desc" },
  });
}

/** The site menu: the officers' version when they have saved one, otherwise the original. */
export async function getNavLinks(): Promise<NavLink[]> {
  const rows = await prisma.navItem.findMany({ where: { visible: true }, orderBy: { position: "asc" } });
  const total = await prisma.navItem.count();
  if (total === 0) return DEFAULT_NAV;
  return rows.map((row) => ({ label: row.label, href: row.href }));
}

/** A published page built with the page builder, or null. */
export async function getCustomPage(slug: string) {
  if (isSystemSlug(slug)) return null; // the club's own pages are served from their own addresses
  const page = await prisma.customPage.findUnique({ where: { slug } });
  if (!page || page.status !== "LIVE") return null;
  return { ...page, blocks: sanitizeBlocks(page.blocks) };
}

/** One of the club's own pages (home, meetings, ...): the officers' saved version, or the original design. */
export async function getSystemPage(slug: string): Promise<{ title: string; description: string; blocks: Block[]; edited: boolean }> {
  const def = systemPageDef(slug);
  if (!def) throw new Error(`Unknown system page ${slug}`);
  const row = await prisma.customPage.findUnique({ where: { slug } });
  if (!row) return { title: def.title, description: def.description, blocks: def.blocks, edited: false };
  const blocks = sanitizeBlocks(row.blocks);
  return { title: row.title || def.title, description: row.description || def.description, blocks: blocks.length ? blocks : def.blocks, edited: true };
}

/** Everything site-section blocks need besides their own fields. */
export async function getPageContext(): Promise<PageCtx> {
  const [settings, images, next] = await Promise.all([getClubSettings(), getSiteImages(), getNextMeeting()]);
  return {
    settings: {
      name: settings.name,
      foundedYear: settings.foundedYear,
      seasonLabel: settings.seasonLabel,
      statMembers: settings.statMembers,
      statSpeakers: settings.statSpeakers,
      statSessions: settings.statSessions,
      heroCaption: settings.heroCaption,
    },
    images,
    nextLabel: next ? `NEXT SESSION · ${formatShortDate(next.date).toUpperCase()}` : "SCHEDULE TBA",
  };
}
