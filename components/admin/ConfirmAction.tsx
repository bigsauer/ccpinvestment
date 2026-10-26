"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCanWrite } from "@/components/admin/WriteGate";
import type { FormState } from "@/lib/form-state";

type Props = {
  /** A server action already bound to its target (for example deleteSpeaker.bind(null, id)). */
  action: () => Promise<FormState>;
  children: ReactNode;
  /** Asked before anything happens. Omit for harmless actions. */
  confirm?: string;
  className?: string;
  /** Where to go after it works. Defaults to refreshing the current page. */
  redirectTo?: string;
  /** Shown after it works (when staying on the page). */
  doneLabel?: string;
};

export function ConfirmAction({ action, children, confirm, className = "btn", redirectTo, doneLabel }: Props) {
  const router = useRouter();
  const writable = useCanWrite();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!writable) return null;

  return (
    <span className="confirm-action">
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => {
            const result = await action();
            if (!result.ok) {
              setError(result.error ?? "Something went wrong");
              return;
            }
            setError(null);
            const target = result.redirectTo ?? redirectTo;
            if (target) router.push(target);
            else {
              if (doneLabel) setDone(true);
              router.refresh();
            }
          });
        }}
      >
        {pending ? "Working…" : done && doneLabel ? doneLabel : children}
      </button>
      {error ? <span className="admin-err"> {error}</span> : null}
    </span>
  );
}
