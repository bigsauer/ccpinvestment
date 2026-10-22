"use client";

import { useEffect, useState } from "react";

function partsUntil(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return { days, hours, mins };
}

type Parts = ReturnType<typeof partsUntil>;

/**
 * The clock depends on "now", so the server HTML can never match the browser.
 * Render placeholders on the server and the first client render, then fill in after mount.
 */
export function Countdown({ target }: { target: string }) {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const next = new Date(target);
    const tick = () => setParts(partsUntil(next));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [target]);

  const show = (n: number | undefined) => (n === undefined ? "--" : String(n).padStart(2, "0"));

  return (
    <div className="cd" role="timer" aria-label="Time until the next session">
      <div className="cd-box">
        <div className="n">{show(parts?.days)}</div>
        <div className="l">Days</div>
      </div>
      <div className="cd-box">
        <div className="n">{show(parts?.hours)}</div>
        <div className="l">Hrs</div>
      </div>
      <div className="cd-box">
        <div className="n">{show(parts?.mins)}</div>
        <div className="l">Min</div>
      </div>
    </div>
  );
}
