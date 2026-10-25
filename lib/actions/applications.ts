"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { safeHttpUrl } from "@/lib/safe-url";

export type FormState = {
  ok: boolean;
  error?: string;
};

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
    const why = String(formData.get("why") ?? "").trim();

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
