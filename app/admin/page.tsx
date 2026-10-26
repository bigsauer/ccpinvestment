import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";
import { canManageOfficers, getActor } from "@/lib/guard";
import { getDashboardStats } from "@/lib/queries";
import { dayNumber, daysUntil, displayName, greetingForNow, monthName, relativeWhen } from "@/lib/utils";

type Todo = { href: string; text: string; ok?: boolean };

export default async function AdminDashboardPage() {
  const actor = await getActor();
  const stats = await getDashboardStats();
  const now = new Date();
  const monthOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [nextAny, unpublishedSoon, thinSpeakers, noEmailMembers, newApps, pendingRequests] = await Promise.all([
    prisma.meeting.findFirst({ where: { date: { gte: now } }, include: { speaker: true }, orderBy: { date: "asc" } }),
    prisma.meeting.findMany({ where: { date: { gte: now, lte: monthOut }, published: false }, orderBy: { date: "asc" }, take: 3 }),
    prisma.speaker.findMany({
      where: { status: "UPCOMING", OR: [{ photoUrl: null }, { bio: "" }] },
      orderBy: { sessionDate: "asc" },
      take: 4,
    }),
    prisma.member.count({ where: { email: { endsWith: ".invalid" } } }),
    prisma.application.count({ where: { status: "NEW" } }),
    actor && canManageOfficers(actor) ? prisma.accessRequest.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
  ]);

  const todos: Todo[] = [];
  if (newApps > 0) todos.push({ href: "/admin/applications", text: `${newApps} new inquir${newApps === 1 ? "y" : "ies"} waiting for a reply` });
  if (pendingRequests > 0) todos.push({ href: "/admin/officers?tab=requests", text: `${pendingRequests} officer access request${pendingRequests === 1 ? "" : "s"} to review` });
  for (const meeting of unpublishedSoon) {
    todos.push({
      href: `/admin/meetings/${meeting.id}`,
      text: `Meeting on ${meeting.date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" })} is not published yet`,
    });
  }
  if (!nextAny) todos.push({ href: "/admin/meetings/new", text: "No upcoming meeting is scheduled. Add one." });
  for (const speaker of thinSpeakers) {
    const missing = [!speaker.photoUrl && "a photo", !speaker.bio && "a bio"].filter(Boolean).join(" and ");
    todos.push({ href: `/admin/speakers/${speaker.id}`, text: `${displayName(speaker.firstName, speaker.lastName)} (upcoming) needs ${missing}` });
  }
  if (noEmailMembers > 0) todos.push({ href: "/admin/members", text: `${noEmailMembers} member${noEmailMembers === 1 ? "" : "s"} still need a real email address` });

  const greeting = greetingForNow();
  const days = nextAny ? daysUntil(nextAny.date) : null;

  return (
    <>
      <Topbar crumbs={["Admin", "Dashboard"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              {greeting}, <span className="serif">{todos.length === 0 ? "all caught up." : "here's what's open."}</span>
            </h1>
            <p className="sub">
              {stats.openApps} inquir{stats.openApps === 1 ? "y" : "ies"} open{days != null ? `, next meeting in ${days} day${days === 1 ? "" : "s"}` : ""}. Click anything to jump in.
            </p>
          </div>
        </div>

        <div className="dash-grid">
          <Link className="stat-card" href="/admin/members" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="k">Active members</div>
            <div className="v">{stats.activeMembers}</div>
            <div className="d">
              <span className="up">▲ +{stats.membersThisWeek}</span> this week
            </div>
          </Link>
          <Link className="stat-card" href="/admin/applications" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="k">Open inquiries</div>
            <div className="v">{stats.openApps}</div>
            <div className="d">
              <span className="up">▲ +{stats.appsThisWeek}</span> last 7 days
            </div>
          </Link>
          <Link className="stat-card" href="/admin/speakers?show=upcoming" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="k">Speakers booked</div>
            <div className="v">{stats.speakersBooked}</div>
            <div className="d">
              <span className="flat">— upcoming</span>
            </div>
          </Link>
          <Link className="stat-card" href="/admin/meetings?show=past" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="k">Avg. RSVPs</div>
            <div className="v">{stats.avgAttendance || "—"}</div>
            <div className="d">from past sessions with a count</div>
          </Link>
        </div>

        <div className="dash-two">
          <div className="admin-stack">
            <div className="card">
              <div className="card-head">
                <h3>Needs attention</h3>
                <div className="desc">{todos.length === 0 ? "nothing open" : `${todos.length} item${todos.length === 1 ? "" : "s"}`}</div>
              </div>
              <div className="card-body">
                <div className="admin-todo">
                  {todos.length === 0 ? <div className="admin-note">Everything looks good. New inquiries and gaps will show up here.</div> : null}
                  {todos.map((todo, i) => (
                    <Link key={i} href={todo.href}>
                      <span className={todo.ok ? "dotw ok" : "dotw"} />
                      {todo.text}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="card next-meeting">
              <div className="top">
                <div className="tag">{nextAny && days != null ? `Next meeting · in ${days} day${days === 1 ? "" : "s"}${nextAny.published ? "" : " · not published"}` : "No upcoming meeting"}</div>
                <Link href={nextAny ? `/admin/meetings/${nextAny.id}` : "/admin/meetings/new"} className="btn">
                  {nextAny ? "Edit" : "Add one"}
                </Link>
              </div>
              {nextAny ? (
                <div className="body">
                  <div className="date-box">
                    <div className="mo">{monthName(nextAny.date)}</div>
                    <div className="day">{dayNumber(nextAny.date)}</div>
                    <div className="yr">{nextAny.date.getFullYear()}</div>
                  </div>
                  <div>
                    <div className="name">{nextAny.speaker ? displayName(nextAny.speaker.firstName, nextAny.speaker.lastName) : nextAny.topic || nextAny.format}</div>
                    <div className="role">{nextAny.speaker ? `${nextAny.speaker.title} · ${nextAny.speaker.firm}` : nextAny.location}</div>
                    <div className="meta">
                      <div>
                        <div className="k">Time</div>
                        <div className="v">{nextAny.time}</div>
                      </div>
                      <div>
                        <div className="k">Where</div>
                        <div className="v">{nextAny.location}</div>
                      </div>
                      <div>
                        <div className="k">RSVPs</div>
                        <div className="v">{nextAny.rsvpCount}</div>
                      </div>
                      <div>
                        <div className="k">On site</div>
                        <div className="v">{nextAny.published ? "Published" : "Hidden"}</div>
                      </div>
                    </div>
                    <div className="ctas">
                      <Link className="btn red" href={`/admin/meetings/${nextAny.id}`}>
                        Edit details
                      </Link>
                      <Link className="btn" href="/meetings" target="_blank">
                        View public page
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-body">Schedule the next session and publish it to show it on the site.</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Recent activity</h3>
              <Link href="/admin/activity" className="desc">
                see all →
              </Link>
            </div>
            <div className="card-body" style={{ padding: "8px 20px" }}>
              <div className="activity">
                {stats.recentActivity.map((row) => (
                  <div className="row" key={row.id}>
                    <div className="t">{relativeWhen(row.createdAt)}</div>
                    <div className="dot red" />
                    <div className="desc">
                      <b>{row.action}</b>
                    </div>
                    <div className="who">{row.actor}</div>
                  </div>
                ))}
                {stats.recentActivity.length === 0 ? <div className="admin-note" style={{ padding: "14px 0" }}>Nothing yet.</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
