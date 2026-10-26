"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { safeHttpUrl } from "@/lib/safe-url";

export type FormState = {
  ok: boolean;
  error?: string;
};

/**
 * Light spam protection for the public forms, with no captcha to bother real people.
 * Returns "skip" for bots and repeat sends (shown as success so they learn nothing), or "go" to save it.
 */
async function screen(formData: FormData, type: "STUDENT" | "SPEAKER", email: string): Promise<"go" | "skip"> {
  if (String(formData.get("website") ?? "").trim()) return "skip"; // honeypot field real people never see
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new Error("Please enter a valid email address.");
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  if ((await prisma.application.count({ where: { submittedAt: { gte: tenMinutesAgo } } })) >= 25) {
    throw new Error("We are getting a lot of submissions right now. Please try again in a few minutes.");
  }
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.application.findMany({ where: { type, submittedAt: { gte: dayAgo } }, select: { payload: true } });
  const duplicate = recent.some((app) => String(((app.payload ?? {}) as Record<string, unknown>).email ?? "").toLowerCase() === email);
  return duplicate ? "skip" : "go";
}

function required(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${label} is required`);
  return text;
}

export async function submitStudentApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const firstName = required(formData.get("first"), "First name");
    const lastName = required(formData.get("last"), "Last name");
    const email = required(formData.get("email"), "School email").toLowerCase();
    const gradYear = required(formData.get("grade"), "Class of");
    const interest = String(formData.get("interest") ?? "Regular member");
    const why = String(formData.get("why") ?? "").trim().slice(0, 3000);
    if ((await screen(formData, "STUDENT", email)) === "skip") return { ok: true };

    await prisma.application.create({
      data: {
        type: "STUDENT",
        payload: { firstName, lastName, email, gradYear, interest, why },
      },
    });

    await prisma.activityLog.create({
      data: {
        actor: "web",
        action: `New student application from ${firstName} ${lastName}`,
        targetType: "Application",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/applications");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not submit." };
  }
}

export async function submitSpeakerApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const firstName = required(formData.get("first"), "First name");
    const lastName = required(formData.get("last"), "Last name");
    const email = required(formData.get("email"), "Email").toLowerCase();
    const phone = String(formData.get("phone") ?? "").trim();
    const linkedinRaw = String(formData.get("linkedin") ?? "").trim();
    const linkedin = linkedinRaw ? safeHttpUrl(linkedinRaw) : null;
    if (linkedinRaw && !linkedin) {
      throw new Error("LinkedIn URL must start with http:// or https://");
    }
    const city = required(formData.get("city"), "City & state");
    const firm = required(formData.get("firm"), "Firm / company");
    const title = required(formData.get("title"), "Title");
    const industry = required(formData.get("industry"), "Industry");
    const years = required(formData.get("years"), "Years in industry");
    const connection = String(formData.get("connection") ?? "").trim();
    const topics = String(formData.get("topics") ?? "").trim();
    const sessionTitle = required(formData.get("sessionTitle"), "Working title");
    const abstract = required(formData.get("abstract"), "What you'd cover");
    const dates = String(formData.get("dates") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    if ((await screen(formData, "SPEAKER", email)) === "skip") return { ok: true };

    await prisma.application.create({
      data: {
        type: "SPEAKER",
        payload: {
          firstName,
          lastName,
          email,
          phone,
          linkedin,
          city,
          firm,
          title,
          industry,
          years,
          connection,
          topics,
          sessionTitle,
          abstract,
          dates,
          notes,
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        actor: "web",
        action: `New speaker application from ${firstName} ${lastName} — ${title} at ${firm}`,
        targetType: "Application",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/applications");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not submit." };
  }
}
