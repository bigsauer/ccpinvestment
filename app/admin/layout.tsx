import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canManageOfficers, canWriteContent, getActor } from "@/lib/guard";
import { roleLabel } from "@/lib/utils";

// Officer tools: never index, never follow.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    // Login, setup, sign-up and invitation pages (middleware keeps everything else out).
    return <>{children}</>;
  }

  // Removed or deactivated officers lose access immediately, even with a valid session cookie.
  const actor = await getActor();
  if (!actor) redirect("/admin/session-ended");

  const path = (await headers()).get("x-admin-path") ?? "";
  if (actor.mustChangePassword && path !== "/admin/account") redirect("/admin/account?force=1");

  const cookieStore = await cookies();
  const collapsed = cookieStore.get("admin-sidebar")?.value === "1";
  const manager = canManageOfficers(actor);

  const [openApps, pendingRequests, officer] = await Promise.all([
    prisma.application.count({ where: { status: { in: ["NEW", "REVIEWING"] } } }),
    manager ? prisma.accessRequest.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
    prisma.officer.findUnique({ where: { id: actor.id }, select: { name: true, classYear: true } }),
  ]);

  return (
    <AdminShell
      collapsed={collapsed}
      openApps={openApps}
      pendingRequests={pendingRequests}
      writable={canWriteContent(actor)}
      user={{
        name: officer?.name ?? actor.name,
        role: roleLabel(actor.role),
        badge: actor.isSuperAdmin ? "Super admin" : undefined,
        classYear: officer?.classYear,
      }}
    >
      {children}
    </AdminShell>
  );
}
