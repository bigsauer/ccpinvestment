"use client";

import { useState } from "react";

/** Copies the finished email (logo, button and all) so it can be pasted into a new message in any mail app. */
export function CopyStyledEmail({ html, text }: { html: string; text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <div>
      <button
        type="button"
        className="btn red"
        onClick={async () => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "text/html": new Blob([html], { type: "text/html" }),
                "text/plain": new Blob([text], { type: "text/plain" }),
              }),
            ]);
            setState("copied");
          } catch {
            setState("failed");
          }
        }}
      >
        {state === "copied" ? "Copied ✓" : "Copy styled email"}
      </button>
      <div className="field-help" style={{ marginTop: 6 }}>
        {state === "failed"
          ? "Your browser blocked copying. Copy the link and send it yourself."
          : "Open a new message, then paste. The logo, button and wording come with it."}
      </div>
    </div>
  );
}
