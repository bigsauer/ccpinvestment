"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Final value, e.g. "60+", "12", 2024. Non-numeric values render as-is. */
  value: string | number;
  /** Where the count starts. Use e.g. 2000 for a year so it doesn't spin up from 0. */
  from?: number;
  duration?: number;
  /** Minimum digits, zero-padded (e.g. 2 for a day-of-month like "04"). */
  pad?: number;
  /** Stagger start (ms) after the element scrolls into view. */
  delay?: number;
  className?: string;
};

const NUMBER = /^(\D*)(\d[\d,]*)(.*)$/;

export function CountUp({ value, from = 0, duration = 1700, delay = 0, pad = 0, className }: Props) {
  const text = String(value);
  const match = NUMBER.exec(text);
  const prefix = match?.[1] ?? "";
  const suffix = match?.[3] ?? "";
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const grouped = match ? match[2].includes(",") : false;

  const ref = useRef<HTMLSpanElement>(null);
  // null = show the real value (server render, no JS, reduced motion).
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!match || !el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    setCurrent(from);

    const run = () => {
      const start = performance.now() + delay;
      const tick = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        // easeOutExpo: fast start, long gentle landing
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setCurrent(Math.round(from + (target - from) * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, from, duration, delay]);

  const shown = current ?? target;
  const digits = grouped ? shown.toLocaleString("en-US") : String(shown).padStart(pad, "0");
  const display = match ? `${prefix}${digits}${suffix}` : text;

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
