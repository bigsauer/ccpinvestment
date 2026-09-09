"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "/admin";

  return (
    <div className="login-wrap">
      <form className="form login-card" action={action}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
        {state.error ? <div className="info-note">{state.error}</div> : null}
        <div className="form-foot">
          <div className="note">Officer accounts only</div>
          <button className="btn red lg" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
