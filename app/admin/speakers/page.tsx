import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";
import { speakerSlug } from "@/lib/site";
import { displayName } from "@/lib/utils";

export default async function AdminSpeakersPage({ searchParams }: { searchParams: Promise<{ q?: string; show?: string }> }) {
  const { q = "", show = "all" } = await searchParams;
  const term = q.trim();
  const speakers = await prisma.speaker.findMany({
    where: {
      ...(show === "upcoming" ? { status: "UPCOMING" as const } : show === "past" ? { status: "PAST" as const } : {}),
      ...(term
        ? {
            OR: [
              { firstName: { contains: term, mode: "insensitive" as const } },
              { lastName: { contains: term, mode: "insensitive" as const } },
              { firm: { contains: term, mode: "insensitive" as const } },
              { title: { contains: term, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: [{ status: "asc" }, { sessionDate: { sort: "desc", nulls: "last" } }, { lastName: "asc" }],
  });

  return (
    <>
      <Topbar crumbs={["Admin", "Speakers"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              The people <span className="serif">in the archive.</span>
            </h1>
            <p className="sub">Every guest, with photo, bio and career story. Approving a speaker inquiry adds them here automatically.</p>
          </div>
          <div className="r">
            <Link href="/admin/speakers/new" className="btn red">
              + Add speaker
            </Link>
          </div>
        </div>

        <form className="admin-toolbar" method="get">
          <input className="admin-search" name="q" defaultValue={term} placeholder="Search name, firm, title…" />
          <select name="show" defaultValue={show} className="admin-search" style={{ minWidth: 0 }}>
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <button className="btn" type="submit">
            Filter
          </button>
          <span className="admin-note grow">{speakers.length} speakers</span>
        </form>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Speaker</th>
                <th>Role</th>
                <th>Session</th>
                <th>Profile</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {speakers.map((speaker) => {
                const missing = [!speaker.photoUrl && "photo", !speaker.bio && "bio", !speaker.highlights && "story"].filter(Boolean) as string[];
                return (
                  <tr key={speaker.id} className="row">
                    <td>
                      <Link className="tbl-link" href={`/admin/speakers/${speaker.id}`}>
                        {displayName(speaker.firstName, speaker.lastName)}
                      </Link>
                      <div className="row-sub">{speaker.status === "UPCOMING" ? "Upcoming" : "Past"}</div>
                    </td>
                    <td>
                      {speaker.title || "—"}
                      <div className="row-sub">{speaker.firm}</div>
                    </td>
                    <td>
                      {speaker.sessionDate
                        ? speaker.sessionDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" })
                        : speaker.season ?? "—"}
                    </td>
                    <td>
                      {missing.length === 0 ? <span className="pill green">Complete</span> : <span className="pill amber">Needs {missing.join(", ")}</span>}
                    </td>
                    <td className="cell-actions">
                      <Link className="btn" href={`/admin/speakers/${speaker.id}`}>
                        Edit
                      </Link>{" "}
                      <Link className="btn" href={`/speakers/${speakerSlug(speaker.firstName, speaker.lastName)}`} target="_blank">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {speakers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-note" style={{ padding: 24 }}>
                    No speakers match.
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
