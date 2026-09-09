"use client";

import { useActionState, useState } from "react";
import { submitStudentApplication, type FormState } from "@/lib/actions/applications";

const INTERESTS = ["Curious", "Regular member", "Officer track"] as const;

export function JoinForm() {
  const [interest, setInterest] = useState<(typeof INTERESTS)[number]>("Regular member");
  const [state, action, pending] = useActionState(
    submitStudentApplication,
    { ok: false } satisfies FormState,
  );

  return (
    <form className="form" action={action}>
      <div className="form-head">
        <div className="t">Membership application</div>
        <div className="s">cic / spring-26</div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="first">First name</label>
          <input id="first" name="first" type="text" placeholder="Jack" required disabled={state.ok} />
        </div>
        <div className="field">
          <label htmlFor="last">Last name</label>
          <input id="last" name="last" type="text" placeholder="Doe" required disabled={state.ok} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="grade">Class of</label>
          <select id="grade" name="grade" required disabled={state.ok} defaultValue="">
            <option value="">Select —</option>
            <option>2026</option>
            <option>2027</option>
            <option>2028</option>
            <option>2029</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="email">School email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="jdoe@chaminade-stl.org"
            required
            disabled={state.ok}
          />
        </div>
      </div>
      <div className="field">
        <label>Interest level</label>
        <div className="chip-group">
          {INTERESTS.map((value) => (
            <button
              key={value}
              className={interest === value ? "chip on" : "chip"}
              type="button"
              disabled={state.ok}
              onClick={() => setInterest(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <input type="hidden" name="interest" value={interest} />
      </div>
      <div className="field">
        <label htmlFor="why">Why are you interested?</label>
        <textarea id="why" name="why" placeholder="One or two sentences." disabled={state.ok} />
      </div>
      <div className="form-foot">
        <div className="note">
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--green)", display: "inline-block" }} />
          Routes to officers
        </div>
        <button type="submit" className="btn red lg" disabled={pending || state.ok}>
          {state.ok ? "Submitted ✓" : pending ? "Submitting…" : "Submit application"}
          {!state.ok ? <span className="arrow">→</span> : null}
        </button>
      </div>
      {state.ok ? (
        <div className="ok-msg show">
          <span>✓</span> Received — an officer will be in touch within a few school days.
        </div>
      ) : null}
      {state.error ? (
        <div className="info-note">
          <b>Could not submit.</b> {state.error}
        </div>
      ) : null}
    </form>
  );
}
