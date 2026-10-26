"use client";

import { useMemo, useState } from "react";
import type { SpeakerHighlights, StoryPillar, StoryStep } from "@/lib/speakers";

const MAX_STEPS = 12;
const MAX_PILLARS = 8;

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/** Edits the animated "career story" (timeline + pillars) with plain fields. Saves as JSON in a hidden input. */
export function StoryEditor({ name = "highlights", defaultValue }: { name?: string; defaultValue?: SpeakerHighlights | null }) {
  const [steps, setSteps] = useState<StoryStep[]>(defaultValue?.timeline ?? []);
  const [pillars, setPillars] = useState<StoryPillar[]>(defaultValue?.pillars ?? []);

  const json = useMemo(() => {
    const timeline = steps
      .map((s) => ({ when: s.when?.trim() ?? "", title: s.title.trim(), org: s.org?.trim() ?? "", detail: s.detail.trim() }))
      .filter((s) => s.title && s.detail);
    const cleanPillars = pillars.map((p) => ({ title: p.title.trim(), text: p.text.trim() })).filter((p) => p.title && p.text);
    return timeline.length === 0 && cleanPillars.length === 0 ? "" : JSON.stringify({ timeline, pillars: cleanPillars });
  }, [steps, pillars]);

  const setStep = (i: number, patch: Partial<StoryStep>) => setSteps((list) => list.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const setPillar = (i: number, patch: Partial<StoryPillar>) => setPillars((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  return (
    <div className="story-editor">
      <input type="hidden" name={name} value={json} />

      <div className="story-block">
        <div className="story-block-h">
          <div>
            <div className="group-h">Timeline</div>
            <div className="field-help">One step per row, oldest first. A step needs a title and a sentence of detail.</div>
          </div>
          <button type="button" className="btn" disabled={steps.length >= MAX_STEPS} onClick={() => setSteps((l) => [...l, { when: "", title: "", org: "", detail: "" }])}>
            + Add step
          </button>
        </div>
        {steps.map((step, i) => (
          <div className="story-row" key={i}>
            <div className="story-row-top">
              <span className="story-n">{i + 1}</span>
              <input placeholder="When (e.g. 2019 – 2021)" value={step.when ?? ""} onChange={(e) => setStep(i, { when: e.target.value })} />
              <input placeholder="Title (e.g. Senior Associate)" value={step.title} onChange={(e) => setStep(i, { title: e.target.value })} />
              <input placeholder="Organization" value={step.org ?? ""} onChange={(e) => setStep(i, { org: e.target.value })} />
            </div>
            <textarea placeholder="One or two sentences about this step" value={step.detail} onChange={(e) => setStep(i, { detail: e.target.value })} />
            <div className="story-row-tools">
              <button type="button" className="btn" onClick={() => setSteps((l) => move(l, i, i - 1))} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" className="btn" onClick={() => setSteps((l) => move(l, i, i + 1))} disabled={i === steps.length - 1} aria-label="Move down">↓</button>
              <button type="button" className="btn" onClick={() => setSteps((l) => l.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          </div>
        ))}
        {steps.length === 0 ? <div className="story-empty">No timeline yet.</div> : null}
      </div>

      <div className="story-block">
        <div className="story-block-h">
          <div>
            <div className="group-h">Highlights</div>
            <div className="field-help">Up to four short cards that sum up what they are known for.</div>
          </div>
          <button type="button" className="btn" disabled={pillars.length >= MAX_PILLARS} onClick={() => setPillars((l) => [...l, { title: "", text: "" }])}>
            + Add highlight
          </button>
        </div>
        {pillars.map((pillar, i) => (
          <div className="story-row" key={i}>
            <div className="story-row-top">
              <span className="story-n">{i + 1}</span>
              <input placeholder="Title (e.g. Founder-Operator)" value={pillar.title} onChange={(e) => setPillar(i, { title: e.target.value })} />
            </div>
            <textarea placeholder="One sentence" value={pillar.text} onChange={(e) => setPillar(i, { text: e.target.value })} />
            <div className="story-row-tools">
              <button type="button" className="btn" onClick={() => setPillars((l) => move(l, i, i - 1))} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" className="btn" onClick={() => setPillars((l) => move(l, i, i + 1))} disabled={i === pillars.length - 1} aria-label="Move down">↓</button>
              <button type="button" className="btn" onClick={() => setPillars((l) => l.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          </div>
        ))}
        {pillars.length === 0 ? <div className="story-empty">No highlights yet.</div> : null}
      </div>
    </div>
  );
}
