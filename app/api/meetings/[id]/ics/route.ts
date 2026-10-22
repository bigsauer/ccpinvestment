import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { escapeIcsText } from "@/lib/safe-url";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { speaker: true },
  });
  if (!meeting || !meeting.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const start = meeting.date.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const end = new Date(meeting.date.getTime() + 45 * 60 * 1000)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/, "Z");
  const title = meeting.speaker
    ? `CIC — ${meeting.speaker.firstName} ${meeting.speaker.lastName}`
    : meeting.format !== "Talk + Q&A"
      ? `CIC — ${meeting.format}`
      : "CIC meeting";
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CCP Investment Club//EN",
    "BEGIN:VEVENT",
    `UID:${meeting.id}@ccpinvestment`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(meeting.topic || "Club meeting")}`,
    `LOCATION:${escapeIcsText(meeting.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="cic-meeting.ics"`,
    },
  });
}
