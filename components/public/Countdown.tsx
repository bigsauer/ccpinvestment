"use client";

import { useEffect, useState } from "react";

const COUNT_MS = 1500;

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
 * Render placeholders on the server and the first client render, then fill in after mount,
 * counting up from zero once so the numbers land with a bit of motion.
 */
export function Countdown({ target }: { target: string }) {
  const [parts, setParts] = useState<Parts | null>(null);
  // 0..1 while the intro count-up runs; 1 once it has landed (or when motion is reduced).
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const next = new Date(target);
    const tick = () => setParts(partsUntil(next));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [target]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      setProgress(t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const show = (n: number | undefined) =>
    n === undefined ? "--" : String(Math.round(n * progress)).padStart(2, "0");

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
