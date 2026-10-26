"use client";

import { BrandMark } from "@/components/admin/BrandMark";
import Link from "next/link";
import { useActionState } from "react";
import { acceptInvitation, requestOfficerAccess, setupFirstAdmin } from "@/lib/actions/access";
import type { FormState } from "@/lib/form-state";

const initial: FormState = { ok: false };

function Messages({ state }: { state: FormState }) {
  return (
    <>
      {state.error ? <div className="info-note">{state.error}</div> : null}
      {state.ok && state.message ? <div className="ok-msg show"><span>✓</span> {state.message}</div> : null}
    </>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(setupFirstAdmin, initial);
  return (
    <div className="login-wrap">
      <form className="form login-card" action={action}>
        <BrandMark />
          <div className="form-head">
          <div className="t">Create the first admin</div>
          <div className="s">cic / setup</div>
        </div>
        <p className="admin-note" style={{ marginBottom: 16 }}>
          This page works once. It makes the first super admin, who can then invite everyone else from the Officers page.
        </p>
        <div className="field">
          <label htmlFor="token">Setup code</label>
          <input id="token" name="token" type="password" required autoComplete="off" />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="classYear">Class of</label>
            <input id="classYear" name="classYear" placeholder="2027" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="confirm">Repeat password</label>
            <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" />
          </div>
        </div>
        <div className="field-help">At least 10 characters.</div>
        <Messages state={state} />
        <div className="form-foot">
          <div className="note">First account only</div>
          <button className="btn red lg" type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create admin"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function AcceptInviteForm({ token, email, name, roleLabel, classYear }: { token: string; email: string; name: string; roleLabel: string; classYear: string }) {
  const [state, action, pending] = useActionState(acceptInvitation, initial);
  return (
    <div className="login-wrap">
      <form className="form login-card" action={action}>
        <input type="hidden" name="token" value={token} />
        <BrandMark />
          <div className="form-head">
          <div className="t">Create your officer account</div>
          <div className="s">cic / invite</div>
        </div>
        <p className="admin-note" style={{ marginBottom: 16 }}>
          You have been invited as <b>{roleLabel}</b> for <b>{email}</b>. Choose a password to finish.
        </p>
        <div className="field-row">
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" defaultValue={name} required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="classYear">Class of</label>
            <input id="classYear" name="classYear" defaultValue={classYear} placeholder="2027" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="confirm">Repeat password</label>
            <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" />
          </div>
        </div>
        <div className="field-help">At least 10 characters.</div>
        <Messages state={state} />
        <div className="form-foot">
          <div className="note">This link works once</div>
          <button className="btn red lg" type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function RequestAccessForm() {
  const [state, action, pending] = useActionState(requestOfficerAccess, initial);
  return (
    <div className="login-wrap">
      <form className="form login-card" action={action}>
        <BrandMark />
          <div className="form-head">
          <div className="t">Request officer access</div>
          <div className="s">cic / sign-up</div>
        </div>
        <p className="admin-note" style={{ marginBottom: 16 }}>
          Officers run the club site. Tell us who you are and a club administrator will review your request and send an invitation.
          Looking to join the club as a member? <Link href="/get-involved?tab=students">Apply here instead.</Link>
        </p>
        <div className="field-row">
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="classYear">Class of</label>
            <input id="classYear" name="classYear" placeholder="2027" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="email">School email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="roleWanted">Role you hold or want</label>
          <input id="roleWanted" name="roleWanted" placeholder="e.g. Treasurer, Faculty advisor" />
        </div>
        <div className="field">
          <label htmlFor="message">Anything we should know? (optional)</label>
          <textarea id="message" name="message" />
        </div>
        {/* Honeypot: hidden from people, tempting to bots. */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
          <label htmlFor="website">Leave this empty</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <Messages state={state} />
        <div className="form-foot">
          <div className="note">No account is created until it is approved</div>
          <button className="btn red lg" type="submit" disabled={pending || state.ok}>
            {pending ? "Sending…" : state.ok ? "Sent ✓" : "Send request"}
          </button>
        </div>
      </form>
    </div>
  );
}
