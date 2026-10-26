"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { WriteFieldset } from "@/components/admin/WriteGate";
import { CopyField } from "@/components/admin/CopyField";
import { CopyStyledEmail } from "@/components/admin/CopyStyledEmail";
import type { FormState } from "@/lib/form-state";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel?: string;
  pendingLabel?: string;
  className?: string;
  /** Clear the fields after a successful save (for "add" forms). */
  resetOnSuccess?: boolean;
  /** Extra buttons next to the submit button. */
  extra?: ReactNode;
  /** Re-read the page after a save. Turn off when the result (a one-time link) must stay on screen. */
  refresh?: boolean;
};

export function AdminForm({ action, children, submitLabel = "Save", pendingLabel = "Saving…", className, resetOnSuccess, extra, refresh = true }: Props) {
  const [state, formAction, pending] = useActionState(action, { ok: false } as FormState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      if (state.redirectTo) {
        router.push(state.redirectTo);
        return;
      }
      if (resetOnSuccess) formRef.current?.reset();
      if (refresh) router.refresh();
    }
  }, [state, resetOnSuccess, refresh, router]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      <WriteFieldset>
        {children}
        <div className="admin-form-foot">
          <button className="btn red" type="submit" disabled={pending}>
            {pending ? pendingLabel : submitLabel}
          </button>
          {extra}
          <div aria-live="polite" className="admin-form-msg">
            {state.error ? <span className="admin-err">{state.error}</span> : null}
            {state.ok && state.message ? <span className="admin-ok">✓ {state.message}</span> : null}
          </div>
        </div>
        {state.ok && state.link && !state.emailed ? (
          <div className="admin-link-box">
            {state.email ? (
              <div style={{ flexBasis: "100%" }}>
                <div className="admin-note" style={{ marginBottom: 8 }}>
                  The site can&apos;t send email yet. Copy the styled invitation, paste it into a new message to <b>{state.email.to}</b>, and send it.
                </div>
                <CopyStyledEmail html={state.email.html} text={state.email.text} />
              </div>
            ) : null}
            <CopyField value={state.link} label="Or just send this link (it works once)" />
            {state.mailto ? (
              <a className="btn" href={state.mailto}>
                Plain-text email
              </a>
            ) : null}
          </div>
        ) : null}
      </WriteFieldset>
    </form>
  );
}
