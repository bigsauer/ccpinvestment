import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { auth, canWrite } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { roleLabel } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cookieStore = await cookies();
  const collapsed = cookieStore.get("admin-sidebar")?.value === "1";

  if (!session?.user) {
    return <>{children}</>;
  }

  const [openApps, officer] = await Promise.all([
    prisma.application.count({
      where: { status: { in: ["NEW", "REVIEWING"] } },
    }),
    prisma.officer.findUnique({
      where: { id: session.user.officerId },
      select: { name: true, role: true, classYear: true },
    }),
  ]);

  const role = officer?.role ?? session.user.role;

  return (
    <AdminShell
      collapsed={collapsed}
      openApps={openApps}
      writable={canWrite(role)}
      user={{
        name: officer?.name ?? session.user.name ?? "Officer",
        role: roleLabel(role),
        classYear: officer?.classYear ?? session.user.classYear,
      }}
    >
      {children}
    </AdminShell>
  );
}
