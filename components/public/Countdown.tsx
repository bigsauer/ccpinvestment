"use client";

import { useEffect, useState } from "react";

function partsUntil(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return { days, hours, mins };
}

export function Countdown({ target }: { target: string }) {
  const date = new Date(target);
  const [parts, setParts] = useState(() => partsUntil(date));

  useEffect(() => {
    const next = new Date(target);
    const id = window.setInterval(() => setParts(partsUntil(next)), 30000);
    return () => window.clearInterval(id);
  }, [target]);

  return (
    <div className="cd">
      <div className="cd-box">
        <div className="n">{String(parts.days).padStart(2, "0")}</div>
        <div className="l">Days</div>
      </div>
      <div className="cd-box">
        <div className="n">{String(parts.hours).padStart(2, "0")}</div>
        <div className="l">Hrs</div>
      </div>
      <div className="cd-box">
        <div className="n">{String(parts.mins).padStart(2, "0")}</div>
        <div className="l">Min</div>
      </div>
    </div>
  );
}
