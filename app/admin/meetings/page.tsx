import Link from "next/link";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { Topbar } from "@/components/admin/Topbar";
import { setMeetingPublished } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { displayName } from "@/lib/utils";

export default async function AdminMeetingsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show = "upcoming" } = await searchParams;
  const now = new Date();
  const meetings = await prisma.meeting.findMany({
    where: show === "past" ? { date: { lt: now } } : show === "all" ? {} : { date: { gte: now } },
    include: { speaker: true },
    orderBy: { date: show === "past" || show === "all" ? "desc" : "asc" },
  });

  return (
    <>
      <Topbar crumbs={["Admin", "Meetings"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Schedule, <span className="serif">then publish.</span>
            </h1>
            <p className="sub">Only published meetings show on the public site. Times are St. Louis time. RSVP counts are entered by hand.</p>
          </div>
          <div className="r">
            <Link href="/admin/meetings/new" className="btn red">
              + New meeting
            </Link>
          </div>
        </div>

        <div className="tab-strip">
          {[
            ["upcoming", "Upcoming"],
            ["past", "Past"],
            ["all", "All"],
          ].map(([key, label]) => (
            <Link key={key} href={`/admin/meetings?show=${key}`} className={show === key ? "t on" : "t"}>
              {label}
            </Link>
          ))}
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Session</th>
                <th>Status</th>
                <th>RSVP</th>
                <th>On site</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="row">
                  <td>
                    <Link className="tbl-link" href={`/admin/meetings/${meeting.id}`}>
                      {meeting.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" })}
                    </Link>
                    <div className="row-sub">
                      {meeting.time} · {meeting.location}
                    </div>
                  </td>
                  <td>
                    {meeting.speaker ? displayName(meeting.speaker.firstName, meeting.speaker.lastName) : meeting.topic || meeting.format}
                    {meeting.speaker && meeting.topic ? <div className="row-sub">{meeting.topic}</div> : null}
                  </td>
                  <td>
                    <span className={`pill ${meeting.status === "CONFIRMED" ? "green" : meeting.status === "TENTATIVE" ? "amber" : "gray"}`}>{meeting.status}</span>
                  </td>
                  <td>{meeting.rsvpCount}</td>
                  <td>{meeting.published ? <span className="pill green">Published</span> : <span className="pill gray">Hidden</span>}</td>
                  <td className="cell-actions">
                    <ConfirmAction action={setMeetingPublished.bind(null, meeting.id, !meeting.published)}>
                      {meeting.published ? "Unpublish" : "Publish"}
                    </ConfirmAction>{" "}
                    <Link className="btn" href={`/admin/meetings/${meeting.id}`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {meetings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-note" style={{ padding: 24 }}>
                    Nothing here. Use “New meeting” to schedule one.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
