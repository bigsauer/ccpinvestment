import { prisma } from "@/lib/db";
import { getActor } from "@/lib/guard";

export const runtime = "nodejs";

function cell(value: unknown) {
  const text = value == null ? "" : value instanceof Date ? value.toISOString() : String(value);
  // Spreadsheet apps run text that starts with = + - @ as a formula. Defuse it.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function csv(rows: unknown[][]) {
  return rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const actor = await getActor();
  if (!actor) return new Response("Sign in required", { status: 401 });
  const { kind } = await params;

  let rows: unknown[][];
  if (kind === "members") {
    const members = await prisma.member.findMany({ orderBy: [{ gradYear: "asc" }, { lastName: "asc" }] });
    rows = [["First name", "Last name", "Email", "Class of", "Status", "Note", "Joined"], ...members.map((m) => [m.firstName, m.lastName, m.email, m.gradYear, m.status, m.role, m.joinedAt])];
  } else if (kind === "applications") {
    const apps = await prisma.application.findMany({ orderBy: { submittedAt: "desc" } });
    const keys = [...new Set(apps.flatMap((a) => Object.keys((a.payload ?? {}) as object)))];
    rows = [["Type", "Status", "Submitted", ...keys], ...apps.map((a) => [a.type, a.status, a.submittedAt, ...keys.map((k) => ((a.payload ?? {}) as Record<string, unknown>)[k] ?? "")])];
  } else if (kind === "speakers") {
    const speakers = await prisma.speaker.findMany({ orderBy: [{ sessionDate: "desc" }] });
    rows = [["First name", "Last name", "Title", "Firm", "Status", "Session", "Season", "LinkedIn"], ...speakers.map((s) => [s.firstName, s.lastName, s.title, s.firm, s.status, s.sessionDate, s.season, s.linkedinUrl])];
  } else {
    return new Response("Unknown export", { status: 404 });
  }

  return new Response("﻿" + csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cic-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
