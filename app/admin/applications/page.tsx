import { Inbox } from "@/components/admin/Inbox";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const applications = await prisma.application.findMany({
    orderBy: { submittedAt: "desc" },
    include: { notes: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <>
      <Topbar crumbs={["Admin", "Inquiries"]} searchPlaceholder="Search speakers, members, inquiries, meetings…" />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Inquiries, <span className="serif">all in one place.</span>
            </h1>
            <p className="sub">
              Student and speaker forms from the public site land here. Reply by email, add notes, then approve: that adds the student to Members or the speaker to Speakers, ready to finish.
            </p>
          </div>
          <div className="r">
            {/* A file download, so a plain link is right. */}
            <a href="/admin/export/applications" className="btn" download>
              Export CSV
            </a>
          </div>
        </div>
        <Inbox
          initialId={id}
          applications={applications.map((app) => ({
            id: app.id,
            type: app.type,
            status: app.status,
            flagged: app.flagged,
            promotedId: app.promotedId,
            submittedAt: app.submittedAt.toISOString(),
            payload: Object.fromEntries(Object.entries((app.payload ?? {}) as Record<string, unknown>).map(([k, v]) => [k, v == null ? "" : String(v)])),
            notes: app.notes.map((note) => ({
              id: note.id,
              body: note.body,
              createdAt: note.createdAt.toISOString(),
              author: note.authorName || "Former officer",
            })),
          }))}
        />
      </div>
    </>
  );
}
