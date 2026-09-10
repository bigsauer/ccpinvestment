import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { auth } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <Suspense
      fallback={
        <div className="login-wrap">
          <div className="form login-card">Loading…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
