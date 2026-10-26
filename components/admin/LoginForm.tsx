"use client";

import { BrandMark } from "@/components/admin/BrandMark";
import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/admin";
  const notice = params.get("welcome")
    ? "Your account is ready. Sign in below."
    : params.get("reason") === "ended"
      ? "That account was removed or switched off, so you were signed out."
      : null;

  return (
    <div className="login-wrap">
      <form className="form login-card" action={action}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <BrandMark />
          <div className="form-head">
          <div className="t">Officer login</div>
          <div className="s">cic / admin</div>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {notice ? <div className="ok-msg show"><span>✓</span> {notice}</div> : null}
        {state.error ? <div className="info-note">{state.error}</div> : null}
        <div className="form-foot">
          <div className="note">
            Officer accounts only · <Link href="/admin/signup">Request access</Link>
          </div>
          <button className="btn red lg" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </div>
        <p className="field-help" style={{ marginTop: 12 }}>After five wrong passwords an account locks for 15 minutes.</p>
      </form>
    </div>
  );
}
