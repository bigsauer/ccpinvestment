"use server";

import { revalidatePath } from "next/cache";
import {
  ApplicationStatus,
  MeetingStatus,
  MemberStatus,
  PageStatus,
  Prisma,
  SpeakerStatus,
} from "@prisma/client";
import { auth, canWrite } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { safeHttpUrl } from "@/lib/safe-url";

export type ActionResult = { ok: true } | { ok: false; error: string };

function asResult(error: unknown): ActionResult {
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong" };
}

async function requireWriter() {
  const session = await auth();
  if (!session?.user?.officerId) throw new Error("Sign in required");
  if (!canWrite(session.user.role)) throw new Error("Advisor accounts are read-only");
  return session.user;
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function setApplicationStatus(id: string, status: ApplicationStatus): Promise<ActionResult> {
  try {
    const user = await requireWriter();
    await prisma.$transaction(async (tx) => {
      const locked = await tx.$queryRaw<
        { id: string; promotedId: string | null; status: ApplicationStatus; type: "STUDENT" | "SPEAKER"; payload: unknown }[]
      >`SELECT id, "promotedId", status, "type", payload FROM "Application" WHERE id = ${id} FOR UPDATE`;
      const app = locked[0];
      if (!app) throw new Error("Application not found");

      const payload = (app.payload ?? {}) as Record<string, string>;
      let promotedId = app.promotedId;

      if (status === "APPROVED" && !promotedId && app.status !== "APPROVED") {
        if (app.type === "SPEAKER") {
          const firstName = payload.firstName ?? "Guest";
          const lastName = payload.lastName ?? "Speaker";
          const firm = payload.firm ?? "";
          const existing = await tx.speaker.findFirst({
            where: {
              firstName: { equals: firstName, mode: "insensitive" },
              lastName: { equals: lastName, mode: "insensitive" },
              firm: { equals: firm, mode: "insensitive" },
            },
          });
          const speaker =
            existing ??
            (await tx.speaker.create({
              data: {
                firstName,
                lastName,
                firm,
                title: payload.title ?? "",
                bio: payload.abstract ?? "",
                topic: payload.sessionTitle ?? payload.topics ?? "",
                linkedinUrl: safeHttpUrl(payload.linkedin),
                industry: payload.industry ?? null,
                status: "UPCOMING",
              },
            }));
          promotedId = speaker.id;
        } else {
          const email = (payload.email ?? `${id}@pending.local`).toLowerCase();
          const member = await tx.member.upsert({
            where: { email },
            create: {
              firstName: payload.firstName ?? "Student",
              lastName: payload.lastName ?? "Member",
              email,
              gradYear: payload.gradYear ?? "",
              status: "ACTIVE",
              role: payload.interest ?? null,
            },
            update: {
              status: "ACTIVE",
              firstName: payload.firstName ?? undefined,
              lastName: payload.lastName ?? undefined,
            },
          });
          promotedId = member.id;
        }
      }

      await tx.application.update({
        where: { id },
        data: { status, reviewedById: user.officerId, promotedId },
      });

      await tx.activityLog.create({
        data: {
          actor: user.name ?? user.email ?? "officer",
          action: `${app.type === "SPEAKER" ? "Speaker" : "Student"} application ${status.toLowerCase()} — ${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(),
          targetType: "Application",
          targetId: id,
        },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/speakers");
    revalidatePath("/admin/members");
    revalidatePath("/speakers");
    return { ok: true };
  } catch (error) {
    return asResult(error);
  }
}

export async function toggleApplicationFlag(id: string): Promise<ActionResult> {
  try {
    await requireWriter();
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) throw new Error("Application not found");
    await prisma.application.update({ where: { id }, data: { flagged: !app.flagged } });
    revalidatePath("/admin/applications");
    return { ok: true };
  } catch (error) {
    return asResult(error);
  }
}

export async function addApplicationNote(applicationId: string, body: string): Promise<ActionResult> {
  try {
    const user = await requireWriter();
    const text = body.trim();
    if (!text) throw new Error("Note cannot be empty");
    await prisma.note.create({
      data: { applicationId, authorId: user.officerId, body: text },
    });
    revalidatePath("/admin/applications");
    return { ok: true };
  } catch (error) {
    return asResult(error);
  }
}

export async function upsertMeeting(formData: FormData) {
  const user = await requireWriter();
  const id = str(formData, "id");
  const data = {
    date: new Date(str(formData, "date")),
    time: str(formData, "time") || "7:45 AM",
    location: str(formData, "location") || "Little Theatre",
    topic: str(formData, "topic"),
    format: str(formData, "format") || "Talk + Q&A",
    duration: str(formData, "duration") || "~45 min",
    status: (str(formData, "status") as MeetingStatus) || "TENTATIVE",
    published: str(formData, "published") === "on",
    rsvpCount: Number(str(formData, "rsvpCount") || 0),
    speakerId: str(formData, "speakerId") || null,
  };

  const meeting = id
    ? await prisma.meeting.update({ where: { id }, data })
    : await prisma.meeting.create({ data });

  await prisma.activityLog.create({
    data: {
      actor: user.name ?? "officer",
      action: id ? `Meeting updated — ${data.topic || meeting.id}` : `Meeting created — ${data.topic || meeting.id}`,
      targetType: "Meeting",
      targetId: meeting.id,
    },
  });

  revalidatePath("/admin/meetings");
  revalidatePath("/admin");
  revalidatePath("/meetings");
  revalidatePath("/");
}

export async function deleteMeeting(id: string) {
  await requireWriter();
  await prisma.meeting.delete({ where: { id } });
  revalidatePath("/admin/meetings");
  revalidatePath("/meetings");
}

export async function upsertSpeaker(formData: FormData) {
  const user = await requireWriter();
  const id = str(formData, "id");
  const linkedinRaw = str(formData, "linkedinUrl");
  const linkedinUrl = linkedinRaw ? safeHttpUrl(linkedinRaw) : null;
  if (linkedinRaw && !linkedinUrl) throw new Error("LinkedIn URL must start with http:// or https://");
  const data = {
    firstName: str(formData, "firstName"),
    lastName: str(formData, "lastName"),
    firm: str(formData, "firm"),
    title: str(formData, "title"),
    bio: str(formData, "bio"),
    topic: str(formData, "topic"),
    linkedinUrl,
    industry: str(formData, "industry") || null,
    season: str(formData, "season") || null,
    status: (str(formData, "status") as SpeakerStatus) || "UPCOMING",
    sessionDate: str(formData, "sessionDate") ? new Date(str(formData, "sessionDate")) : null,
  };

  const speaker = id
    ? await prisma.speaker.update({ where: { id }, data })
    : await prisma.speaker.create({ data });

  await prisma.activityLog.create({
    data: {
      actor: user.name ?? "officer",
      action: `Speaker ${id ? "updated" : "added"} — ${data.firstName} ${data.lastName}`,
      targetType: "Speaker",
      targetId: speaker.id,
    },
  });

  revalidatePath("/admin/speakers");
  revalidatePath("/speakers");
}

export async function upsertMember(formData: FormData) {
  await requireWriter();
  const id = str(formData, "id");
  const data = {
    firstName: str(formData, "firstName"),
    lastName: str(formData, "lastName"),
    email: str(formData, "email").toLowerCase(),
    gradYear: str(formData, "gradYear"),
    status: (str(formData, "status") as MemberStatus) || "ACTIVE",
    role: str(formData, "role") || null,
  };

  if (id) {
    await prisma.member.update({ where: { id }, data });
  } else {
    await prisma.member.upsert({
      where: { email: data.email },
      create: data,
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        gradYear: data.gradYear,
        status: data.status,
        role: data.role,
      },
    });
  }

  revalidatePath("/admin/members");
}

export async function savePageContent(formData: FormData) {
  const user = await requireWriter();
  const slug = str(formData, "slug");
  const raw = str(formData, "blocks");
  let blocks: Prisma.InputJsonValue = {};
  try {
    blocks = JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    throw new Error("Invalid content JSON");
  }

  await prisma.pageContent.upsert({
    where: { slug },
    create: {
      slug,
      title: str(formData, "title"),
      path: str(formData, "path"),
      blocks,
      status: (str(formData, "status") as PageStatus) || "DRAFT",
      updatedById: user.officerId,
    },
    update: {
      title: str(formData, "title"),
      path: str(formData, "path"),
      blocks,
      status: (str(formData, "status") as PageStatus) || "DRAFT",
      updatedById: user.officerId,
    },
  });

  await prisma.activityLog.create({
    data: {
      actor: user.name ?? "officer",
      action: `Site content updated — ${slug}`,
      targetType: "PageContent",
      targetId: slug,
    },
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/meetings");
  revalidatePath("/speakers");
  revalidatePath("/team");
  revalidatePath("/get-involved");
}

export async function saveClubSettings(formData: FormData) {
  await requireWriter();
  await prisma.clubSettings.upsert({
    where: { id: "club" },
    create: {
      name: str(formData, "name"),
      shortName: str(formData, "shortName"),
      foundedYear: str(formData, "foundedYear"),
      meetingLocation: str(formData, "meetingLocation"),
      meetingTime: str(formData, "meetingTime"),
      seasonLabel: str(formData, "seasonLabel"),
    },
    update: {
      name: str(formData, "name"),
      shortName: str(formData, "shortName"),
      foundedYear: str(formData, "foundedYear"),
      meetingLocation: str(formData, "meetingLocation"),
      meetingTime: str(formData, "meetingTime"),
      seasonLabel: str(formData, "seasonLabel"),
    },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function purgeApplications() {
  await requireWriter();
  await prisma.application.deleteMany();
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}
