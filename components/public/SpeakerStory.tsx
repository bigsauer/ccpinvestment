"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { SpeakerHighlights } from "@/lib/speakers";

const STEP_MS = 520;

function StoryBody({ highlights, firstName }: { highlights: SpeakerHighlights; firstName: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { timeline, pillars } = highlights;

  // Progressive: visible in the server HTML; animation starts once it is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-playing");
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      el.classList.add("is-playing");
      return;
    }
    el.setAttribute("data-armed", "");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          el.classList.add("is-playing");
          io.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pillarStart = timeline.length * STEP_MS + 450;

  return (
    <div className="st" ref={ref}>
      {timeline.length > 0 ? (
        <ol className="st-timeline" style={{ "--total": `${timeline.length * STEP_MS + 450}ms` } as CSSProperties}>
          <span className="st-line" aria-hidden="true" />
          {timeline.map((step, i) => (
            <li
              key={`${step.title}-${i}`}
              className={i === timeline.length - 1 ? "st-step last" : "st-step"}
              style={{ "--sd": `${i * STEP_MS + 250}ms` } as CSSProperties}
            >
              <span className="st-dot" aria-hidden="true" />
              <div className="st-card">
                {step.when ? <span className="st-when">{step.when}</span> : null}
                <h4 className="st-title">{step.title}</h4>
                {step.org ? <div className="st-org">{step.org}</div> : null}
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      {pillars.length > 0 ? (
        <>
          <div className="st-eyebrow">What {firstName} is known for</div>
          <div className="st-pillars">
            {pillars.map((p, i) => (
              <div key={p.title} className="st-pillar" style={{ "--pd": `${pillarStart + i * 160}ms` } as CSSProperties}>
                <span className="st-num">{String(i + 1).padStart(2, "0")}</span>
                <h4>{p.title}</h4>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function SpeakerStory({ highlights, firstName }: { highlights: SpeakerHighlights; firstName: string }) {
  const [run, setRun] = useState(0);
  return (
    <section className="st-wrap" aria-label={`${firstName}'s career story`}>
      <div className="st-head">
        <span className="st-eyebrow">The path so far</span>
        <button type="button" className="st-replay" onClick={() => setRun((r) => r + 1)}>
          <span aria-hidden="true">↻</span> Replay
        </button>
      </div>
      <StoryBody key={run} highlights={highlights} firstName={firstName} />
    </section>
  );
}
