import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import type { OfficerRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type Actor = {
  id: string;
  name: string;
  email: string;
  role: OfficerRole;
  isSuperAdmin: boolean;
  mustChangePassword: boolean;
};

/** The signed-in officer, re-read from the database so removed or deactivated accounts lose access at once. */
export async function getActor(): Promise<Actor | null> {
  const session = await auth();
  const id = session?.user?.officerId;
  if (!id) return null;
  const officer = await prisma.officer.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isSuperAdmin: true, active: true, mustChangePassword: true },
  });
  if (!officer || !officer.active) return null;
  return {
    id: officer.id,
    name: officer.name,
    email: officer.email,
    role: officer.role,
    isSuperAdmin: officer.isSuperAdmin,
    mustChangePassword: officer.mustChangePassword,
  };
}

export function canWriteContent(actor: Pick<Actor, "role">) {
  return actor.role !== "ADVISOR";
}

/** Super admins and the club president can invite, edit and remove officers. */
export function canManageOfficers(actor: Pick<Actor, "role" | "isSuperAdmin">) {
  return actor.isSuperAdmin || actor.role === "PRESIDENT";
}

export async function requireWriter() {
  const actor = await getActor();
  if (!actor) throw new Error("Sign in required");
  if (!canWriteContent(actor)) throw new Error("Advisor accounts are read-only");
  return actor;
}

export async function requireManager() {
  const actor = await getActor();
  if (!actor) throw new Error("Sign in required");
  if (!canManageOfficers(actor)) throw new Error("Only a super admin or the president can manage officers");
  return actor;
}

export async function logActivity(actor: Pick<Actor, "name"> | string, action: string, targetType: string, targetId?: string) {
  await prisma.activityLog.create({
    data: { actor: typeof actor === "string" ? actor : actor.name, action, targetType, targetId: targetId ?? null },
  });
}

export function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** The public origin of this request, so invite links point at whichever site the admin is using. */
export async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
