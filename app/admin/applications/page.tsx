import { Inbox } from "@/components/admin/Inbox";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    orderBy: { submittedAt: "desc" },
    include: { notes: { include: { author: true }, orderBy: { createdAt: "asc" } } },
  });

  return (
    <>
      <Topbar crumbs={["Admin", "Applications"]} searchPlaceholder="Search by name..." />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Applications, <span className="serif">all in one place.</span>
            </h1>
            <p className="sub">Student and speaker forms from the public site land here. Approve promotes to the roster or speaker archive.</p>
          </div>
        </div>
        <Inbox
          applications={applications.map((app) => ({
            id: app.id,
            type: app.type,
            status: app.status,
            flagged: app.flagged,
            submittedAt: app.submittedAt.toISOString(),
            payload: (app.payload ?? {}) as Record<string, string>,
            notes: app.notes.map((note) => ({
              id: note.id,
              body: note.body,
              createdAt: note.createdAt.toISOString(),
              author: note.author.name,
            })),
          }))}
        />
      </div>
    </>
  );
}
