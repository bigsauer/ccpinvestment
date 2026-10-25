import { asStringBlocks } from "@/lib/copy";
import { prisma } from "@/lib/db";
import { safeHttpUrl } from "@/lib/safe-url";
import { speakerSlug } from "@/lib/site";

export async function getLivePageBlocks(slug: string) {
  const page = await prisma.pageContent.findUnique({ where: { slug } });
  if (!page || page.status !== "LIVE") return {} as Record<string, string>;
  return asStringBlocks(page.blocks);
}

export async function getClubSettings() {
  return (
    (await prisma.clubSettings.findUnique({ where: { id: "club" } })) ?? {
      id: "club",
      name: "Chaminade Investment Club",
      shortName: "CIC",
      foundedYear: "2024",
      meetingLocation: "Skip Little Theater",
      meetingTime: "6:45 AM",
      seasonLabel: "Fall 2026",
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
    orderBy: { role: "asc" },
    select: {
      id: true,
      name: true,
      role: true,
      classYear: true,
      bio: true,
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
