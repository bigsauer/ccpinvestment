"use server";

import { compare, hash } from "bcryptjs";
import type { OfficerRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import { getActor, logActivity, newToken, requestOrigin, requireManager } from "@/lib/guard";
import { checkPassword, done, fail, localPhotoPath, revalidateAdmin, revalidatePublic, str } from "@/lib/actions/util";
import { inviteEmail } from "@/lib/email-templates";
import { mailConfigured, sendEmail } from "@/lib/mail";
import { roleLabel } from "@/lib/utils";

const ROLES: OfficerRole[] = ["PRESIDENT", "VP", "PORTFOLIO_MANAGER", "SECRETARY", "TREASURER", "ADVISOR"];
const INVITE_DAYS = 7;

function parseRole(raw: string): OfficerRole {
  if (!ROLES.includes(raw as OfficerRole)) throw new Error("Choose a role");
  return raw as OfficerRole;
}

/** True if removing `target` from the active super admins would leave nobody able to manage the team. */
async function wouldOrphanAdmins(targetId: string) {
  const others = await prisma.officer.count({ where: { isSuperAdmin: true, active: true, id: { not: targetId } } });
  return others === 0;
}

async function createInvitation(opts: { email: string; name: string; role: OfficerRole; classYear: string | null; invitedById: string }) {
  const email = opts.email.toLowerCase();
  if (await prisma.officer.findUnique({ where: { email }, select: { id: true } })) {
    throw new Error("An officer with that email already exists.");
  }
  // One live invitation per email: older ones stop working.
  await prisma.invitation.updateMany({ where: { email, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
  const { token, hash: tokenHash } = newToken();
  const invitation = await prisma.invitation.create({
    data: {
      email,
      name: opts.name,
      role: opts.role,
      classYear: opts.classYear,
      tokenHash,
      invitedById: opts.invitedById,
      expiresAt: new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000),
    },
  });
  const link = `${await requestOrigin()}/admin/invite/${token}`;
  return { invitation, link };
}

/** Builds the branded invitation email and sends it if email is set up; otherwise hands it back to copy. */
async function deliverInvite(opts: { to: string; name: string; role: OfficerRole; link: string; inviter: string; headline: string }): Promise<FormState> {
  const mail = inviteEmail({ name: opts.name, roleLabel: roleLabel(opts.role), link: opts.link, inviterName: opts.inviter, days: INVITE_DAYS });
  const plainMailto = `mailto:${encodeURIComponent(opts.to)}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.text)}`;
  if (mailConfigured()) {
    const sent = await sendEmail({ to: opts.to, subject: mail.subject, html: mail.html, text: mail.text });
    if (sent.ok) return done(`${opts.headline}. The invitation email was sent to ${opts.to}.`, { emailed: true, link: opts.link });
    return done(`${opts.headline}. The site could not send the email (${sent.error}), so use the options below.`, {
      link: opts.link,
      mailto: plainMailto,
      email: { ...mail, to: opts.to },
    });
  }
  return done(`${opts.headline}.`, { link: opts.link, mailto: plainMailto, email: { ...mail, to: opts.to } });
}

/* ───────────── Invitations and access requests (managers) ───────────── */

export async function inviteOfficer(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const actor = await requireManager();
    const email = str(formData, "email").toLowerCase();
    if (!email.includes("@")) throw new Error("Enter the email address to invite");
    const name = str(formData, "name");
    const role = parseRole(str(formData, "role"));
    const { link } = await createInvitation({ email, name, role, classYear: str(formData, "classYear") || null, invitedById: actor.id });
    await logActivity(actor, `Invited ${email} as ${roleLabel(role)}`, "Invitation");
    revalidateAdmin();
    return deliverInvite({ to: email, name, role, link, inviter: actor.name, headline: `Invitation ready for ${email}` });
  } catch (error) {
    return fail(error);
  }
}

/** A fresh link for a pending invitation (the old link stops working). */
export async function renewInvitation(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const actor = await requireManager();
    const old = await prisma.invitation.findUnique({ where: { id: str(formData, "id") } });
    if (!old || old.acceptedAt) throw new Error("That invitation is no longer open");
    const { link } = await createInvitation({ email: old.email, name: old.name, role: old.role, classYear: old.classYear, invitedById: actor.id });
    await logActivity(actor, `New invitation link for ${old.email}`, "Invitation");
    // No revalidation here: re-rendering the page would replace this card and drop the one-time link on screen.
    return deliverInvite({ to: old.email, name: old.name, role: old.role, link, inviter: actor.name, headline: "New link ready" });
  } catch (error) {
    return fail(error);
  }
}

export async function revokeInvitation(id: string): Promise<FormState> {
  try {
    const actor = await requireManager();
    const invite = await prisma.invitation.update({ where: { id }, data: { revokedAt: new Date() } });
    await logActivity(actor, `Invitation cancelled — ${invite.email}`, "Invitation", id);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function approveAccessRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const actor = await requireManager();
    const request = await prisma.accessRequest.findUnique({ where: { id: str(formData, "id") } });
    if (!request || request.status !== "PENDING") throw new Error("That request was already handled");
    const role = parseRole(str(formData, "role"));
    const { link } = await createInvitation({ email: request.email, name: request.name, role, classYear: request.classYear, invitedById: actor.id });
    await prisma.accessRequest.update({ where: { id: request.id }, data: { status: "APPROVED", decidedBy: actor.name, decidedAt: new Date() } });
    await logActivity(actor, `Access approved — ${request.name} as ${roleLabel(role)}`, "AccessRequest", request.id);
    // No revalidation here (see renewInvitation): the link must stay on screen. The lists update on the next visit.
    return deliverInvite({ to: request.email, name: request.name, role, link, inviter: actor.name, headline: `Approved ${request.name}` });
  } catch (error) {
    return fail(error);
  }
}

export async function denyAccessRequest(id: string): Promise<FormState> {
  try {
    const actor = await requireManager();
    const request = await prisma.accessRequest.update({ where: { id }, data: { status: "DENIED", decidedBy: actor.name, decidedAt: new Date() } });
    await logActivity(actor, `Access denied — ${request.name}`, "AccessRequest", id);
    revalidateAdmin();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/* ───────────── Managing officers ───────────── */

export async function saveOfficer(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const actor = await requireManager();
    const id = str(formData, "id");
    const target = await prisma.officer.findUnique({ where: { id } });
    if (!target) throw new Error("Officer not found");

    const name = str(formData, "name");
    const email = str(formData, "email").toLowerCase();
    if (!name) throw new Error("Name is required");
    if (!email.includes("@")) throw new Error("A valid email is required");
    const role = parseRole(str(formData, "role"));
    const active = formData.get("active") === "on";
    // Only a super admin can grant or remove super admin.
    const isSuperAdmin = actor.isSuperAdmin ? formData.get("isSuperAdmin") === "on" : target.isSuperAdmin;

    if (target.isSuperAdmin && !actor.isSuperAdmin) throw new Error("Only a super admin can change another super admin.");
    if (target.id === actor.id && !active) throw new Error("You cannot deactivate your own account.");
    if (target.isSuperAdmin && (!isSuperAdmin || !active) && (await wouldOrphanAdmins(target.id))) {
      throw new Error("That would leave no active super admin. Make someone else a super admin first.");
    }

    await prisma.officer.update({
      where: { id },
      data: {
        name,
        email,
        role,
        active,
        isSuperAdmin,
        classYear: str(formData, "classYear") || null,
        bio: str(formData, "bio") || null,
        photoUrl: localPhotoPath(str(formData, "photoUrl")),
      },
    });
    await logActivity(actor, `Officer updated — ${name}`, "Officer", id);
    revalidateAdmin();
    revalidatePublic();
    return done("Officer saved");
  } catch (error) {
    return fail(error);
  }
}

/** A manager sets a temporary password for someone who is locked out. They must change it when they sign in. */
export async function setOfficerPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const actor = await requireManager();
    const target = await prisma.officer.findUnique({ where: { id: str(formData, "id") } });
    if (!target) throw new Error("Officer not found");
    if (target.isSuperAdmin && !actor.isSuperAdmin) throw new Error("Only a super admin can reset a super admin's password.");
    const password = String(formData.get("password") ?? "");
    checkPassword(password, target.email);
    await prisma.officer.update({
      where: { id: target.id },
      data: { passwordHash: await hash(password, 12), mustChangePassword: target.id !== actor.id, failedLogins: 0, lockedUntil: null },
    });
    await logActivity(actor, `Temporary password set for ${target.name}`, "Officer", target.id);
    revalidateAdmin();
    return done(target.id === actor.id ? "Password changed" : `Temporary password set. ${target.name.split(" ")[0]} will be asked to choose a new one at sign-in.`);
  } catch (error) {
    return fail(error);
  }
}

export async function deleteOfficer(id: string): Promise<FormState> {
  try {
    const actor = await requireManager();
    const target = await prisma.officer.findUnique({ where: { id } });
    if (!target) throw new Error("Officer not found");
    if (target.id === actor.id) throw new Error("You cannot delete your own account.");
    if (target.isSuperAdmin && !actor.isSuperAdmin) throw new Error("Only a super admin can delete a super admin.");
    if (target.isSuperAdmin && (await wouldOrphanAdmins(target.id))) {
      throw new Error("That is the only super admin. Make someone else a super admin first.");
    }
    await prisma.officer.delete({ where: { id } });
    await logActivity(actor, `Officer deleted — ${target.name} (${roleLabel(target.role)})`, "Officer", id);
    revalidateAdmin();
    revalidatePublic();
    return { ok: true, redirectTo: "/admin/officers" };
  } catch (error) {
    return fail(error);
  }
}

/* ───────────── My account ───────────── */

export async function saveMyProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const actor = await getActor();
    if (!actor) throw new Error("Sign in required");
    const name = str(formData, "name");
    if (!name) throw new Error("Name is required");
    await prisma.officer.update({
      where: { id: actor.id },
      data: {
        name,
        classYear: str(formData, "classYear") || null,
        bio: str(formData, "bio") || null,
        photoUrl: localPhotoPath(str(formData, "photoUrl")),
      },
    });
    revalidateAdmin();
    revalidatePublic();
    return done("Profile saved");
  } catch (error) {
    return fail(error);
  }
}

export async function changeMyPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    const actor = await getActor();
    if (!actor) throw new Error("Sign in required");
    const officer = await prisma.officer.findUnique({ where: { id: actor.id } });
    if (!officer) throw new Error("Sign in required");
    const current = String(formData.get("current") ?? "");
    const next = String(formData.get("next") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (!(await compare(current, officer.passwordHash))) throw new Error("Your current password is not right.");
    if (next !== confirm) throw new Error("The new passwords do not match.");
    if (next === current) throw new Error("Choose a password you have not used just now.");
    checkPassword(next, officer.email);
    await prisma.officer.update({ where: { id: officer.id }, data: { passwordHash: await hash(next, 12), mustChangePassword: false } });
    await logActivity(actor, "Changed own password", "Officer", officer.id);
    revalidateAdmin();
    return done("Password changed", { redirectTo: actor.mustChangePassword ? "/admin" : undefined });
  } catch (error) {
    return fail(error);
  }
}
