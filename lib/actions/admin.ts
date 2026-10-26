"use server";

import { ApplicationStatus, MeetingStatus, MemberStatus, PageStatus, Prisma, SpeakerStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { chicagoToDate, clockLabel } from "@/lib/datetime";
import type { FormState } from "@/lib/form-state";
import { logActivity, requireWriter } from "@/lib/guard";
import { safeHttpUrl } from "@/lib/safe-url";
import { EDITABLE_PAGES } from "@/lib/site-pages";
import { slotDef } from "@/lib/site-images";
import { parseHighlights } from "@/lib/speakers";
import { done, fail, localPhotoPath, revalidateAdmin, revalidatePublic, str } from "@/lib/actions/util";

/* ───────────── Applications (the inbox) ───────────── */

export async function setApplicationStatus(id: string, status: ApplicationStatus): Promise<FormState> {
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

      if (status === "APPROVED" && !promotedId) {
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

      await tx.application.update({ where: { id }, data: { status, reviewedById: user.id, promotedId } });
      await tx.activityLog.create({
        data: {
          actor: user.name,
          action: `${app.type === "SPEAKER" ? "Speaker" : "Student"} application ${status.toLowerCase()} — ${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(),
          targetType: "Application",
          targetId: id,
        },
      });
    });
    revalidateAdmin();
    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function toggleApplicationFlag(id: string): Promise<FormState> {
  try {
    await requireWriter();
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) throw new Error("Application not found");
    await prisma.application.update({ where: { id }, data: { flagged: !app.flagged } });
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function addApplicationNote(applicationId: string, body: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const text = body.trim();
    if (!text) throw new Error("Note cannot be empty");
    await prisma.note.create({ data: { applicationId, authorId: user.id, authorName: user.name, body: text } });
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteApplication(id: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) throw new Error("Application not found");
    const payload = (app.payload ?? {}) as Record<string, string>;
    await prisma.application.delete({ where: { id } });
    await logActivity(user, `Application deleted — ${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(), "Application", id);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ───────────── Speakers ───────────── */

export async function saveSpeaker(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await requireWriter();
    const id = str(formData, "id");
    const firstName = str(formData, "firstName");
    const lastName = str(formData, "lastName");
    if (!firstName || !lastName) throw new Error("First and last name are required");

    const linkedinRaw = str(formData, "linkedinUrl");
    const linkedinUrl = linkedinRaw ? safeHttpUrl(linkedinRaw) : null;
    if (linkedinRaw && !linkedinUrl) throw new Error("The LinkedIn link must start with http:// or https://");

    const dateRaw = str(formData, "sessionDate");
    const sessionDate = dateRaw ? chicagoToDate(dateRaw) : null;
    if (dateRaw && !sessionDate) throw new Error("That date is not valid");

    const storyRaw = str(formData, "highlights");
    let highlights: Prisma.InputJsonValue | typeof Prisma.DbNull = Prisma.DbNull;
    if (storyRaw) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(storyRaw);
      } catch {
        throw new Error("The career story could not be read. Re-enter it and try again.");
      }
      const clean = parseHighlights(parsed);
      if (clean) highlights = clean as unknown as Prisma.InputJsonValue;
    }

    const data = {
      firstName,
      lastName,
      firm: str(formData, "firm"),
      title: str(formData, "title"),
      bio: str(formData, "bio"),
      topic: str(formData, "topic"),
      linkedinUrl,
      photoUrl: localPhotoPath(str(formData, "photoUrl")),
      industry: str(formData, "industry") || null,
      season: str(formData, "season") || null,
      status: (str(formData, "status") as SpeakerStatus) || "UPCOMING",
      sessionDate,
      highlights,
    };

    const speaker = id ? await prisma.speaker.update({ where: { id }, data }) : await prisma.speaker.create({ data });
    await logActivity(user, `Speaker ${id ? "updated" : "added"} — ${firstName} ${lastName}`, "Speaker", speaker.id);
    revalidateAdmin();
    revalidatePublic();
    if (!id) return { ok: true, message: "Speaker added", redirectTo: `/admin/speakers/${speaker.id}` };
    return done("Speaker saved");
  } catch (error) {
    return fail(error);
  }
}

export async function deleteSpeaker(id: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const speaker = await prisma.speaker.findUnique({ where: { id } });
    if (!speaker) throw new Error("Speaker not found");
    await prisma.$transaction([
      prisma.meeting.updateMany({ where: { speakerId: id }, data: { speakerId: null } }),
      prisma.speaker.delete({ where: { id } }),
    ]);
    await logActivity(user, `Speaker deleted — ${speaker.firstName} ${speaker.lastName}`, "Speaker", id);
    revalidateAdmin();
    revalidatePublic();
    return { ok: true, redirectTo: "/admin/speakers" };
  } catch (error) {
    return fail(error);
  }
}

/* ───────────── Members ───────────── */

export async function saveMember(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await requireWriter();
    const id = str(formData, "id");
    const firstName = str(formData, "firstName");
    const lastName = str(formData, "lastName");
    const email = str(formData, "email").toLowerCase();
    if (!firstName || !lastName) throw new Error("First and last name are required");
    if (!email || !email.includes("@")) throw new Error("A valid email is required");
    const data = {
      firstName,
      lastName,
      email,
      gradYear: str(formData, "gradYear"),
      status: (str(formData, "status") as MemberStatus) || "ACTIVE",
      role: str(formData, "role") || null,
      photoUrl: localPhotoPath(str(formData, "photoUrl")),
    };
    const member = id ? await prisma.member.update({ where: { id }, data }) : await prisma.member.create({ data });
    await logActivity(user, `Member ${id ? "updated" : "added"} — ${firstName} ${lastName}`, "Member", member.id);
    revalidateAdmin();
    revalidatePublic();
    if (!id) return { ok: true, message: "Member added", redirectTo: `/admin/members/${member.id}` };
    return done("Member saved");
  } catch (error) {
    return fail(error);
  }
}

export async function deleteMember(id: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) throw new Error("Member not found");
    await prisma.member.delete({ where: { id } });
    await logActivity(user, `Member deleted — ${member.firstName} ${member.lastName}`, "Member", id);
    revalidateAdmin();
    revalidatePublic();
    return { ok: true, redirectTo: "/admin/members" };
  } catch (error) {
    return fail(error);
  }
}

/* ───────────── Meetings ───────────── */

export async function saveMeeting(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await requireWriter();
    const id = str(formData, "id");
    const date = chicagoToDate(str(formData, "date"));
    if (!date) throw new Error("Pick the meeting date and time");
    const settings = await prisma.clubSettings.findUnique({ where: { id: "club" } });
    const data = {
      date,
      time: str(formData, "time") || clockLabel(date),
      location: str(formData, "location") || settings?.meetingLocation || "ISC",
      topic: str(formData, "topic"),
      format: str(formData, "format") || "Talk + Q&A",
      duration: str(formData, "duration") || "~45 min",
      status: (str(formData, "status") as MeetingStatus) || "TENTATIVE",
      published: formData.get("published") === "on",
      rsvpCount: Math.max(0, Number(str(formData, "rsvpCount") || 0) || 0),
      speakerId: str(formData, "speakerId") || null,
      photoUrl: localPhotoPath(str(formData, "photoUrl")),
    };
    const meeting = id ? await prisma.meeting.update({ where: { id }, data }) : await prisma.meeting.create({ data });
    await logActivity(user, `Meeting ${id ? "updated" : "created"} — ${data.topic || data.format}`, "Meeting", meeting.id);
    revalidateAdmin();
    revalidatePublic();
    if (!id) return { ok: true, message: "Meeting added", redirectTo: `/admin/meetings/${meeting.id}` };
    return done("Meeting saved");
  } catch (error) {
    return fail(error);
  }
}

export async function setMeetingPublished(id: string, published: boolean): Promise<FormState> {
  try {
    const user = await requireWriter();
    const meeting = await prisma.meeting.update({ where: { id }, data: { published } });
    await logActivity(user, `Meeting ${published ? "published" : "unpublished"} — ${meeting.topic || meeting.format}`, "Meeting", id);
    revalidateAdmin();
    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function duplicateMeeting(id: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const source = await prisma.meeting.findUnique({ where: { id } });
    if (!source) throw new Error("Meeting not found");
    const copy = await prisma.meeting.create({
      data: {
        date: new Date(source.date.getTime() + 14 * 24 * 60 * 60 * 1000),
        time: source.time,
        location: source.location,
        topic: source.topic,
        format: source.format,
        duration: source.duration,
        status: "TENTATIVE",
        published: false,
        rsvpCount: 0,
        speakerId: null,
      },
    });
    await logActivity(user, `Meeting duplicated — ${source.topic || source.format}`, "Meeting", copy.id);
    revalidateAdmin();
    return { ok: true, redirectTo: `/admin/meetings/${copy.id}` };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteMeeting(id: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw new Error("Meeting not found");
    await prisma.meeting.delete({ where: { id } });
    await logActivity(user, `Meeting deleted — ${meeting.topic || meeting.format}`, "Meeting", id);
    revalidateAdmin();
    revalidatePublic();
    return { ok: true, redirectTo: "/admin/meetings" };
  } catch (error) {
    return fail(error);
  }
}

/* ───────────── Site copy and settings ───────────── */

export async function savePageCopy(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await requireWriter();
    const slug = str(formData, "slug");
    const page = EDITABLE_PAGES.find((p) => p.slug === slug);
    if (!page) throw new Error("Unknown page");

    const existing = await prisma.pageContent.findUnique({ where: { slug } });
    const blocks: Record<string, unknown> = { ...((existing?.blocks as Record<string, unknown>) ?? {}) };
    for (const key of ["crumbs", "headline", "serif", "lede"] as const) {
      const value = str(formData, key);
      if (value) blocks[key] = value;
      else delete blocks[key];
    }
    const status = (str(formData, "status") as PageStatus) || "LIVE";
    await prisma.pageContent.upsert({
      where: { slug },
      create: { slug, title: page.title, path: page.path, blocks: blocks as Prisma.InputJsonValue, status, updatedById: user.id },
      update: { blocks: blocks as Prisma.InputJsonValue, status, updatedById: user.id },
    });
    await logActivity(user, `Page copy updated — ${page.title}`, "PageContent", slug);
    revalidateAdmin();
    revalidatePublic();
    return done("Page saved");
  } catch (error) {
    return fail(error);
  }
}

export async function resetPageCopy(slug: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const page = EDITABLE_PAGES.find((p) => p.slug === slug);
    if (!page) throw new Error("Unknown page");
    await prisma.pageContent.deleteMany({ where: { slug } });
    await logActivity(user, `Page copy reset to the designed wording — ${page.title}`, "PageContent", slug);
    revalidateAdmin();
    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function saveClubSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await requireWriter();
    const instagramRaw = str(formData, "instagramUrl");
    const instagramUrl = instagramRaw ? safeHttpUrl(instagramRaw) : null;
    if (instagramRaw && !instagramUrl) throw new Error("The Instagram link must start with http:// or https://");
    const contactEmail = str(formData, "contactEmail");
    if (contactEmail && !contactEmail.includes("@")) throw new Error("That contact email does not look right");
    const classYearFrom = Number(str(formData, "classYearFrom") || 2027);
    const classYearTo = Number(str(formData, "classYearTo") || 2035);
    if (![classYearFrom, classYearTo].every((y) => Number.isInteger(y) && y >= 2000 && y <= 2100)) {
      throw new Error("Class years must be four-digit years, like 2027.");
    }
    if (classYearFrom > classYearTo) throw new Error("The first class year must not be after the last one.");
    if (classYearTo - classYearFrom > 14) throw new Error("Offer at most 15 class years.");
    const data = {
      classYearFrom,
      classYearTo,
      name: str(formData, "name") || "Chaminade Investment Club",
      shortName: str(formData, "shortName") || "CIC",
      foundedYear: str(formData, "foundedYear") || "2024",
      meetingLocation: str(formData, "meetingLocation") || "ISC",
      meetingTime: str(formData, "meetingTime") || "6:45 AM",
      seasonLabel: str(formData, "seasonLabel") || "Fall 2026",
      statMembers: str(formData, "statMembers") || "60+",
      statSpeakers: str(formData, "statSpeakers") || "12+",
      statSessions: str(formData, "statSessions") || "24+",
      heroCaption: str(formData, "heroCaption"),
      contactEmail: contactEmail || null,
      instagramUrl,
    };
    await prisma.clubSettings.upsert({ where: { id: "club" }, create: { id: "club", ...data }, update: data });
    await logActivity(user, "Club settings updated", "ClubSettings", "club");
    revalidateAdmin();
    revalidatePublic();
    return done("Settings saved");
  } catch (error) {
    return fail(error);
  }
}

/* ───────────── Website photos ───────────── */

export async function saveSiteImage(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await requireWriter();
    const def = slotDef(str(formData, "slot"));
    if (!def) throw new Error("Unknown photo");
    const photoUrl = localPhotoPath(str(formData, "photoUrl"));
    if (!photoUrl) throw new Error("Choose a photo first.");
    const clamp = (raw: string, fallback: number) => {
      const n = Math.round(Number(raw));
      return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
    };
    const data = {
      photoUrl,
      focusX: clamp(str(formData, "focusX"), 50),
      focusY: clamp(str(formData, "focusY"), 50),
      alt: str(formData, "alt").slice(0, 200),
      updatedBy: user.name,
    };
    await prisma.siteImage.upsert({ where: { slot: def.slot }, create: { slot: def.slot, ...data }, update: data });
    await logActivity(user, `Website photo updated — ${def.label}`, "SiteImage", def.slot);
    revalidateAdmin();
    revalidatePublic();
    return done("Published. It shows on the site within a minute.");
  } catch (error) {
    return fail(error);
  }
}

export async function resetSiteImage(slot: string): Promise<FormState> {
  try {
    const user = await requireWriter();
    const def = slotDef(slot);
    if (!def) throw new Error("Unknown photo");
    await prisma.siteImage.deleteMany({ where: { slot } });
    await logActivity(user, `Website photo put back to the original — ${def.label}`, "SiteImage", slot);
    revalidateAdmin();
    revalidatePublic();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ───────────── Maintenance ───────────── */

export async function purgeApplications(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const user = await requireWriter();
    if (str(formData, "confirm") !== "DELETE") throw new Error('Type DELETE (in capitals) to confirm.');
    const { count } = await prisma.application.deleteMany();
    await logActivity(user, `All applications deleted (${count})`, "Application");
    revalidateAdmin();
    return done(`Deleted ${count} application${count === 1 ? "" : "s"}`);
  } catch (error) {
    return fail(error);
  }
}

/** Removes uploaded photos that nothing points at any more (replaced or removed photos). */
export async function cleanupPhotos(): Promise<FormState> {
  try {
    const user = await requireWriter();
    const [speakers, members, officers, meetings, siteImages] = await Promise.all([
      prisma.speaker.findMany({ select: { photoUrl: true } }),
      prisma.member.findMany({ select: { photoUrl: true } }),
      prisma.officer.findMany({ select: { photoUrl: true } }),
      prisma.meeting.findMany({ select: { photoUrl: true } }),
      prisma.siteImage.findMany({ select: { photoUrl: true } }),
    ]);
    const used = new Set<string>();
    for (const row of [...speakers, ...members, ...officers, ...meetings, ...siteImages]) {
      const match = row.photoUrl?.match(/^\/api\/photo\/([A-Za-z0-9]+)$/);
      if (match) used.add(match[1]!);
    }
    const { count } = await prisma.photo.deleteMany({
      where: { id: { notIn: [...used] }, createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    await logActivity(user, `Unused photos removed (${count})`, "Photo");
    return done(`Removed ${count} unused photo${count === 1 ? "" : "s"}`);
  } catch (error) {
    return fail(error);
  }
}
