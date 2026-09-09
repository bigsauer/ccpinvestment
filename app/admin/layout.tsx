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

  const openApps = await prisma.application.count({
    where: { status: { in: ["NEW", "REVIEWING"] } },
  });

  return (
    <AdminShell
      collapsed={collapsed}
      openApps={openApps}
      writable={canWrite(session.user.role)}
      user={{
        name: session.user.name ?? "Officer",
        role: roleLabel(session.user.role),
        classYear: session.user.classYear,
      }}
    >
      {children}
    </AdminShell>
  );
}
