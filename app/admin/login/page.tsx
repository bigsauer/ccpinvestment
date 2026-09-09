import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
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
