"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Share sheet title, e.g. the club name. */
  title: string;
  /** One-line description of what is being shared (what, when, where). */
  text: string;
  /** Absolute URL to share. */
  url: string;
  className?: string;
};

/**
 * Opens the device's native share sheet (iOS, Android, Safari, Edge).
 * Where that isn't available, copies the link instead and says so.
 */
export function ShareButton({ title, text, url, className = "btn" }: Props) {
  const [note, setNote] = useState<"" | "copied" | "failed">("");
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (value: "copied" | "failed") => {
    setNote(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNote(""), 2200);
  };

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // Closing the sheet is not an error; any other failure falls through to copying.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("copied");
    } catch {
      flash("failed");
    }
  };

  return (
    <button type="button" className={`${className} share-btn`} onClick={share} aria-label={`Share: ${text}`}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12" />
        <path d="m7 8 5-5 5 5" />
        <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      </svg>
      <span aria-live="polite">{note === "copied" ? "Link copied" : note === "failed" ? "Copy the address bar link" : "Share"}</span>
    </button>
  );
}
