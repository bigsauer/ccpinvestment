import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { getDashboardStats } from "@/lib/queries";
import { dayNumber, daysUntil, displayName, greetingForNow, monthName, relativeWhen } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const greeting = greetingForNow();
  const next = stats.nextMeeting;
  const days = next ? daysUntil(next.date) : null;

  return (
    <>
      <Topbar crumbs={["Admin", "Dashboard"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              {greeting}, <span className="serif">all systems green.</span>
            </h1>
            <p className="sub">
              {stats.openApps} applications waiting
              {days != null ? `, next meeting in ${days} days` : ""}. Snapshot below — click anything to drill in.
            </p>
          </div>
        </div>

        <div className="dash-grid">
          <div className="stat-card">
            <div className="k">Active members</div>
            <div className="v">{stats.activeMembers}</div>
            <div className="d">
              <span className="up">▲ +{stats.membersThisWeek}</span> this week
            </div>
          </div>
          <div className="stat-card">
            <div className="k">Open applications</div>
            <div className="v">{stats.openApps}</div>
            <div className="d">
              <span className="up">▲ +{stats.appsThisWeek}</span> last 7 days
            </div>
          </div>
          <div className="stat-card">
            <div className="k">Speakers booked</div>
            <div className="v">{stats.speakersBooked}</div>
            <div className="d">
              <span className="flat">— upcoming</span> spring lineup
            </div>
          </div>
          <div className="stat-card">
            <div className="k">Avg. attendance</div>
            <div className="v">{stats.avgAttendance || "—"}</div>
            <div className="d">from published past sessions</div>
          </div>
        </div>

        <div className="dash-two">
          <div className="card next-meeting">
            <div className="top">
              <div className="tag">
                {next && days != null ? `Next meeting · in ${days} days` : "No upcoming meeting"}
              </div>
              <Link href="/admin/meetings" className="btn">
                Edit
              </Link>
            </div>
            {next ? (
              <div className="body">
                <div className="date-box">
                  <div className="mo">{monthName(next.date)}</div>
                  <div className="day">{dayNumber(next.date)}</div>
                  <div className="yr">{next.date.getFullYear()}</div>
                </div>
                <div>
                  <div className="name">
                    {next.speaker ? displayName(next.speaker.firstName, next.speaker.lastName) : "Speaker TBA"}
                  </div>
                  <div className="role">
                    {next.speaker ? `${next.speaker.title} · ${next.speaker.firm}` : next.location}
                  </div>
                  <div className="meta">
                    <div>
                      <div className="k">Time</div>
                      <div className="v">{next.time}</div>
                    </div>
                    <div>
                      <div className="k">Where</div>
                      <div className="v">{next.location}</div>
                    </div>
                    <div>
                      <div className="k">RSVPs</div>
                      <div className="v">{next.rsvpCount} confirmed</div>
                    </div>
                    <div>
                      <div className="k">Topic</div>
                      <div className="v">{next.topic || "—"}</div>
                    </div>
                  </div>
                  <div className="ctas">
                    <Link className="btn red" href="/admin/meetings">
                      Edit details
                    </Link>
                    <Link className="btn" href="/meetings">
                      View public page
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-body">Publish a meeting to see it here.</div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Recent activity</h3>
              <div className="desc">latest</div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
