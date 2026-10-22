"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Fades/slides content in as it scrolls into view.
 * Progressive: content is fully visible in the server HTML (SEO, no-JS, reduced motion);
 * only below-the-fold items are hidden and revealed once JavaScript runs.
 */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      el.classList.add("is-in"); // already on screen: play the entrance, don't hide first
      return;
    }
    el.setAttribute("data-armed", "");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`.trim()} style={{ "--rd": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}
