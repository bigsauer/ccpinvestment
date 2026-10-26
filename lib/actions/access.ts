"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import { hashToken, logActivity } from "@/lib/guard";
import { checkPassword, fail, revalidateAdmin, str } from "@/lib/actions/util";

/* Public (not signed in) officer flows: first-time setup, accepting an invitation, requesting access. */

/** Creates the very first super admin. Works only while there are no officers AND a setup token is configured. */
export async function setupFirstAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const expected = process.env.ADMIN_SETUP_TOKEN?.trim();
    if (!expected) throw new Error("Setup is not enabled on this server.");
    if ((await prisma.officer.count()) > 0) throw new Error("An admin already exists. Sign in instead.");
    if (str(formData, "token") !== expected) throw new Error("That setup code is not right.");

    const name = str(formData, "name");
    const email = str(formData, "email").toLowerCase();
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (!name) throw new Error("Enter your name");
    if (!email.includes("@")) throw new Error("Enter a valid email");
    if (password !== confirm) throw new Error("The passwords do not match.");
    checkPassword(password, email);

    const officer = await prisma.officer.create({
      data: {
        name,
        email,
        passwordHash: await hash(password, 12),
        role: "PRESIDENT",
        isSuperAdmin: true,
        classYear: str(formData, "classYear") || null,
      },
    });
    await logActivity(name, "First super admin created", "Officer", officer.id);
    revalidateAdmin();
    redirect("/admin/login?welcome=1");
  } catch (error) {
    return fail(error);
  }
}

export async function acceptInvitation(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const token = str(formData, "token");
    const invite = await prisma.invitation.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt < new Date()) {
      throw new Error("This invitation has expired or was already used. Ask for a new one.");
    }
    if (await prisma.officer.findUnique({ where: { email: invite.email }, select: { id: true } })) {
      throw new Error("An account with this email already exists. Sign in instead.");
    }
    const name = str(formData, "name") || invite.name;
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (!name) throw new Error("Enter your name");
    if (password !== confirm) throw new Error("The passwords do not match.");
    checkPassword(password, invite.email);

    const officer = await prisma.$transaction(async (tx) => {
      const claimed = await tx.invitation.updateMany({ where: { id: invite.id, acceptedAt: null, revokedAt: null }, data: { acceptedAt: new Date() } });
      if (claimed.count !== 1) throw new Error("This invitation was already used.");
      return tx.officer.create({
        data: {
          name,
          email: invite.email,
          passwordHash: await hash(password, 12),
          role: invite.role,
          classYear: str(formData, "classYear") || invite.classYear,
        },
      });
    });
    await logActivity(name, `Accepted invitation as ${invite.role.toLowerCase()}`, "Officer", officer.id);
    revalidateAdmin();
    redirect("/admin/login?welcome=1");
  } catch (error) {
    return fail(error);
  }
}

/** Someone asks for officer access. Nothing is created until a super admin approves. */
export async function requestOfficerAccess(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    // Honeypot: real people leave this empty.
    if (str(formData, "website")) return { ok: true, message: "Request received." };

    const name = str(formData, "name");
    const email = str(formData, "email").toLowerCase();
    if (!name) throw new Error("Enter your name");
    if (!email.includes("@") || email.length > 200) throw new Error("Enter a valid email");

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if ((await prisma.accessRequest.count({ where: { createdAt: { gte: hourAgo } } })) >= 15) {
      throw new Error("Too many requests right now. Please try again later.");
    }
    // Never reveal whether an email already has an account.
    const existingOfficer = await prisma.officer.findUnique({ where: { email }, select: { id: true } });
    const pending = await prisma.accessRequest.findFirst({ where: { email, status: "PENDING" }, select: { id: true } });
    if (!existingOfficer && !pending) {
      await prisma.accessRequest.create({
        data: {
          name: name.slice(0, 120),
          email,
          classYear: str(formData, "classYear").slice(0, 20) || null,
          roleWanted: str(formData, "roleWanted").slice(0, 60),
          message: str(formData, "message").slice(0, 1000),
        },
      });
      await logActivity("web", `Officer access requested — ${name}`, "AccessRequest");
      revalidateAdmin();
    }
    return { ok: true, message: "Request received. A club administrator will review it and send you an invitation." };
  } catch (error) {
    return fail(error);
  }
}
