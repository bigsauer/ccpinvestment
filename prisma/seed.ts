import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

// LOCAL only. Never run against staging/prod — every officer shares SEED_ADMIN_PASSWORD.

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "jack@ccpinvestment.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("SEED_ADMIN_PASSWORD must be set in .env.local before seeding");
  }
  const passwordHash = await hash(password, 12);

  await prisma.note.deleteMany();
  await prisma.application.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.member.deleteMany();
  await prisma.pageContent.deleteMany();
  await prisma.officer.deleteMany();
  await prisma.clubSettings.deleteMany();

  const jack = await prisma.officer.create({
    data: {
      name: process.env.SEED_ADMIN_NAME ?? "Jack Doe",
      email,
      passwordHash,
      role: "PRESIDENT",
      classYear: "26",
      bio: "Leads programming, speaker outreach, and semester planning. Sets the agenda and runs the general meeting.",
    },
  });

  await prisma.officer.createMany({
    data: [
      {
        name: "Asha Rao",
        email: "asha@ccpinvestment.local",
        passwordHash,
        role: "VP",
        classYear: "26",
        bio: "Runs meetings, prepares speaker briefs, oversees the analyst team, and stands in for the president.",
      },
      {
        name: "Eli Vargas",
        email: "eli@ccpinvestment.local",
        passwordHash,
        role: "TREASURER",
        classYear: "27",
        bio: "Owns the paper portfolio, weekly P&L reporting, and the risk limits the book trades within.",
      },
      {
        name: "Nora Blake",
        email: "nora@ccpinvestment.local",
        passwordHash,
        role: "SECRETARY",
        classYear: "27",
        bio: "Maintains meeting notes, the speaker archive, and the active member roster.",
      },
      {
        name: "Faculty Advisor",
        email: "advisor@ccpinvestment.local",
        passwordHash,
        role: "ADVISOR",
        bio: "Faculty, Chaminade College Preparatory School",
      },
    ],
  });

  await prisma.clubSettings.create({
    data: {
      name: "Chaminade Investment Club",
      shortName: "CIC",
      foundedYear: "2024",
      meetingLocation: "Little Theatre",
      meetingTime: "7:45 AM",
      seasonLabel: "Spring 2026",
    },
  });

  const sarah = await prisma.speaker.create({
    data: {
      firstName: "Sarah",
      lastName: "Chen",
      firm: "Edward Jones",
      title: "Senior Portfolio Manager, Global Equities",
      bio: "Covers global equities and fundamental research. Walks members through how an institutional book is built and defended — idea generation, position sizing, quarterly review.",
      topic: "Building an institutional book",
      industry: "Asset management",
      status: "UPCOMING",
      sessionDate: new Date("2026-05-07T12:45:00Z"),
      season: "Spring 2026",
      linkedinUrl: "https://www.linkedin.com/in/sarah-chen",
    },
  });

  const marcus = await prisma.speaker.create({
    data: {
      firstName: "Marcus",
      lastName: "Hollis",
      firm: "Stifel",
      title: "Partner",
      bio: "Topic to be confirmed closer to the session.",
      topic: "Topic to be confirmed closer to the session.",
      industry: "Investment banking",
      status: "UPCOMING",
      sessionDate: new Date("2026-05-21T12:45:00Z"),
      season: "Spring 2026",
    },
  });

  const pastSpeakers = await Promise.all([
    prisma.speaker.create({
      data: {
        firstName: "Priya",
        lastName: "Shah",
        firm: "Wellington",
        title: "Portfolio Manager",
        bio: "What a real PM actually does in a trading day — and what goes on the whiteboard.",
        topic: "What a real PM actually does in a trading day — and what goes on the whiteboard.",
        industry: "Asset management",
        status: "PAST",
        sessionDate: new Date("2026-04-16T12:45:00Z"),
        season: "Spring 2026",
        linkedinUrl: "https://www.linkedin.com/in/priya-shah",
      },
    }),
    prisma.speaker.create({
      data: {
        firstName: "Jonah",
        lastName: "Reeves",
        firm: "Goldman Sachs",
        title: "Senior Analyst",
        bio: "Reading 10-Ks like it's a job — where the truth actually hides.",
        topic: "Reading 10-Ks like it's a job — where the truth actually hides.",
        industry: "Equity research",
        status: "PAST",
        sessionDate: new Date("2026-03-19T12:45:00Z"),
        season: "Spring 2026",
        linkedinUrl: "https://www.linkedin.com/in/jonah-reeves",
      },
    }),
    prisma.speaker.create({
      data: {
        firstName: "Camille",
        lastName: "Ortiz",
        firm: "Bridgewater",
        title: "Director",
        bio: "Capital markets cycle — how rates move everything downstream.",
        topic: "Capital markets cycle — how rates move everything downstream.",
        industry: "Hedge fund / trading",
        status: "PAST",
        sessionDate: new Date("2026-02-28T12:45:00Z"),
        season: "Winter 2025–26",
        linkedinUrl: "https://www.linkedin.com/in/camille-ortiz",
      },
    }),
    prisma.speaker.create({
      data: {
        firstName: "Ben",
        lastName: "Okoye",
        firm: "Independent",
        title: "Founder & CEO",
        bio: "From first check to first hundred — building a company from nothing.",
        topic: "From first check to first hundred — building a company from nothing.",
        industry: "Fintech / startup",
        status: "PAST",
        sessionDate: new Date("2026-01-25T12:45:00Z"),
        season: "Winter 2025–26",
        linkedinUrl: "https://www.linkedin.com/in/ben-okoye",
      },
    }),
  ]);

  await prisma.meeting.createMany({
    data: [
      {
        date: new Date("2026-05-07T12:45:00Z"),
        time: "07:30 CT",
        location: "Little Theatre",
        topic: "Building an institutional book",
        status: "CONFIRMED",
        published: true,
        rsvpCount: 42,
        speakerId: sarah.id,
        photoUrl: "/photos/session-02.jpg",
      },
      {
        date: new Date("2026-05-21T12:45:00Z"),
        time: "07:30 CT",
        location: "Little Theatre",
        topic: "Topic to be confirmed",
        status: "CONFIRMED",
        published: true,
        rsvpCount: 18,
        speakerId: marcus.id,
      },
      {
        date: new Date("2026-06-04T12:45:00Z"),
        time: "TBA",
        location: "Little Theatre",
        topic: "",
        status: "TENTATIVE",
        published: true,
        rsvpCount: 0,
      },
      {
        date: new Date("2026-04-16T12:45:00Z"),
        time: "07:30 CT",
        location: "Little Theatre",
        topic: "A trading day on the desk",
        status: "CONFIRMED",
        published: true,
        rsvpCount: 51,
        speakerId: pastSpeakers[0]!.id,
        photoUrl: "/photos/session-04.jpg",
      },
      {
        date: new Date("2026-03-19T12:45:00Z"),
        time: "07:30 CT",
        location: "Little Theatre",
        topic: "Reading 10-Ks like a job",
        status: "CONFIRMED",
        published: true,
        rsvpCount: 47,
        speakerId: pastSpeakers[1]!.id,
        photoUrl: "/photos/session-05.jpg",
      },
      {
        date: new Date("2026-02-28T12:45:00Z"),
        time: "07:30 CT",
        location: "Little Theatre",
        topic: "How rates move everything downstream",
        status: "CONFIRMED",
        published: true,
        rsvpCount: 44,
        speakerId: pastSpeakers[2]!.id,
        photoUrl: "/photos/session-07.jpg",
      },
      {
        date: new Date("2026-01-25T12:45:00Z"),
        time: "07:30 CT",
        location: "Little Theatre",
        topic: "Building a company from nothing",
        status: "CONFIRMED",
        published: true,
        rsvpCount: 49,
        speakerId: pastSpeakers[3]!.id,
        photoUrl: "/photos/session-08.jpg",
      },
    ],
  });

  await prisma.member.createMany({
    data: [
      { firstName: "Tomás", lastName: "Reyes", email: "treyes@chaminade-stl.org", gradYear: "2027", status: "ACTIVE", role: "Analyst" },
      { firstName: "Maya", lastName: "Cole", email: "mcole@chaminade-stl.org", gradYear: "2026", status: "ACTIVE", role: "Member" },
      { firstName: "Owen", lastName: "Hart", email: "ohart@chaminade-stl.org", gradYear: "2028", status: "ACTIVE" },
      { firstName: "Lila", lastName: "Nguyen", email: "lnguyen@chaminade-stl.org", gradYear: "2029", status: "ACTIVE" },
      { firstName: "Chris", lastName: "Adler", email: "cadler@chaminade-stl.org", gradYear: "2025", status: "ALUM" },
    ],
  });

  const mira = await prisma.application.create({
    data: {
      type: "SPEAKER",
      status: "NEW",
      submittedAt: new Date(),
      payload: {
        firstName: "Mira",
        lastName: "Patel",
        email: "mira.patel@example.com",
        phone: "(314) 555-0142",
        linkedin: "https://www.linkedin.com/in/mira-patel",
        city: "Chicago, IL",
        firm: "Citadel",
        title: "Portfolio Manager",
        industry: "Hedge fund / trading",
        years: "11–20",
        connection: "Alum parent",
        topics: "Portfolio construction, Day in the life",
        sessionTitle: "How a PM actually sizes a book",
        abstract: "I'd walk through a live book construction problem — what gets on the whiteboard, what gets cut, and how risk talks back.",
        format: "In-person",
        dates: "2026-09-25, 2026-10-09",
      },
    },
  });

  await prisma.application.createMany({
    data: [
      {
        type: "SPEAKER",
        status: "NEW",
        submittedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
        payload: {
          firstName: "Daniel",
          lastName: "Kim",
          email: "daniel.kim@example.com",
          firm: "Goldman Sachs",
          title: "VP, IBD",
          industry: "Investment banking",
          years: "6–10",
          city: "New York, NY",
          sessionTitle: "What a live deal week looks like",
          abstract: "A week on a live M&A process — who is in the room, what the model is actually for, and where juniors get cut.",
          format: "Either",
          topics: "A specific deal, Career path",
        },
      },
      {
        type: "STUDENT",
        status: "NEW",
        submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        payload: {
          firstName: "Leo",
          lastName: "Martinez",
          email: "lmartinez@chaminade-stl.org",
          gradYear: "2028",
          interest: "Regular member",
          why: "I want to sit in a room where people talk about markets like a job, not a class.",
        },
      },
      {
        type: "STUDENT",
        status: "REVIEWING",
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        payload: {
          firstName: "Sam",
          lastName: "Whitaker",
          email: "swhitaker@chaminade-stl.org",
          gradYear: "2027",
          interest: "Officer track",
          why: "I've been following the paper portfolio posts and want to help run outreach.",
        },
      },
    ],
  });

  await prisma.note.create({
    data: {
      applicationId: mira.id,
      authorId: jack.id,
      body: "Strong inbound. Check May 21 as backup if Chen stays locked.",
    },
  });

  await prisma.activityLog.createMany({
    data: [
      { actor: "web", action: "New speaker application from Mira Patel — Portfolio Manager at Citadel", targetType: "Application", targetId: mira.id },
      { actor: "jdoe", action: "Student application approved — Tomás Reyes ('27) added to roster", targetType: "Member" },
      { actor: "arao", action: "Meeting published — May 07 with Sarah Chen, RSVPs opened", targetType: "Meeting" },
      { actor: "jdoe", action: "Speaker bio updated — Marcus Hollis (Spring 2026)", targetType: "Speaker" },
    ],
  });

  await prisma.pageContent.createMany({
    data: [
      {
        slug: "home",
        title: "Home",
        path: "/",
        status: "LIVE",
        updatedById: jack.id,
        blocks: {
          lede: "A student-run club at Chaminade College Preparatory School bringing working professionals — portfolio managers, bankers, founders — into the room with students who are serious about finance.",
        },
      },
      {
        slug: "meetings",
        title: "Meetings",
        path: "/meetings",
        status: "LIVE",
        updatedById: jack.id,
        blocks: {
          crumbs: "Meetings · Spring 2026",
          lede: "Meeting cadence varies — we schedule around speaker availability. Every session lists date, time, the guest speaker, and a short background on their firm and role.",
        },
      },
      {
        slug: "speakers",
        title: "Speakers",
        path: "/speakers",
        status: "LIVE",
        updatedById: jack.id,
        blocks: {
          crumbs: "Speakers · Present & Past",
          lede: "Guests are the core of the club. Professionals who've shaped careers in equities, banking, venture, and macro — and who answer real questions from students who've done the reading.",
        },
      },
      {
        slug: "team",
        title: "Team",
        path: "/team",
        status: "LIVE",
        updatedById: jack.id,
        blocks: {
          crumbs: "Team · Officers & Advisor",
          lede: "Officers handle everything: speaker outreach, programming, the paper portfolio, and operations. No faculty ghost-writer, no pre-made script.",
        },
      },
      {
        slug: "get-involved",
        title: "Get involved",
        path: "/get-involved",
        status: "LIVE",
        updatedById: jack.id,
        blocks: {
          crumbs: "Get involved · Two ways in",
          lede: "If you're a student at Chaminade, apply to join — it's free, no experience needed, and meetings start at 7:45 AM Friday. If you're a working professional, come tell our students what you actually do — 35 minutes, real questions, no pitching.",
        },
      },
    ],
  });

  console.log(`Seeded officer ${email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
