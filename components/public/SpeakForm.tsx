"use client";

import { useActionState, useState } from "react";
import { submitSpeakerApplication, type FormState } from "@/lib/actions/applications";

const TOPICS = [
  "Career path",
  "A specific deal",
  "Markets & macro",
  "Portfolio construction",
  "Day in the life",
  "Starting a firm",
  "Ethics & risk",
  "Other",
];

const FORMATS = ["In-person", "Virtual", "Either"] as const;

const DATES = [
  { value: "2026-09-11", mo: "Sep", day: "11", dow: "Friday" },
  { value: "2026-09-25", mo: "Sep", day: "25", dow: "Friday" },
  { value: "2026-10-09", mo: "Oct", day: "09", dow: "Friday" },
  { value: "2026-10-23", mo: "Oct", day: "23", dow: "Friday" },
  { value: "2026-11-06", mo: "Nov", day: "06", dow: "Friday" },
  { value: "2026-11-20", mo: "Nov", day: "20", dow: "Friday" },
  { value: "flexible", mo: "Open", day: "—", dow: "I'm flexible" },
];

export function SpeakForm() {
  const [topics, setTopics] = useState<string[]>([]);
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("In-person");
  const [dates, setDates] = useState<string[]>([]);
  const [state, action, pending] = useActionState(
    submitSpeakerApplication,
    { ok: false } satisfies FormState,
  );

  return (
    <form className="form speak-form" action={action}>
      <div className="form-head">
        <div className="t">Speaker application</div>
        <div className="s">cic / speaker-2026</div>
      </div>

      <div className="form-section">
        <div className="form-section-h">
          <span className="num">01</span> · About you
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="spk-first">First name</label>
            <input id="spk-first" name="first" required placeholder="Alex" disabled={state.ok} />
          </div>
          <div className="field">
            <label htmlFor="spk-last">Last name</label>
            <input id="spk-last" name="last" required placeholder="Patel" disabled={state.ok} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="spk-email">Email</label>
            <input id="spk-email" name="email" type="email" required placeholder="alex@firm.com" disabled={state.ok} />
          </div>
          <div className="field">
            <label htmlFor="spk-phone">
              Phone <span style={{ color: "var(--ink-4)" }}>(optional)</span>
            </label>
            <input id="spk-phone" name="phone" type="tel" placeholder="(314) 555-0142" disabled={state.ok} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="spk-linkedin">
              LinkedIn URL <span style={{ color: "var(--ink-4)" }}>(optional, but helpful)</span>
            </label>
            <input
              id="spk-linkedin"
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/your-handle"
              disabled={state.ok}
            />
          </div>
          <div className="field">
            <label htmlFor="spk-city">City & state</label>
            <input id="spk-city" name="city" required placeholder="St. Louis, MO" disabled={state.ok} />
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-h">
          <span className="num">02</span> · Where you work
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="spk-firm">Firm / company</label>
            <input id="spk-firm" name="firm" required placeholder="Edward Jones" disabled={state.ok} />
          </div>
          <div className="field">
            <label htmlFor="spk-title">Title</label>
            <input id="spk-title" name="title" required placeholder="Senior Portfolio Manager" disabled={state.ok} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="spk-industry">Industry</label>
            <select id="spk-industry" name="industry" required defaultValue="" disabled={state.ok}>
              <option value="">Select —</option>
              <option>Asset management</option>
              <option>Investment banking</option>
              <option>Private equity / VC</option>
              <option>Hedge fund / trading</option>
              <option>Wealth management</option>
              <option>Equity research</option>
              <option>Corporate finance</option>
              <option>Accounting / audit</option>
              <option>Fintech / startup</option>
              <option>Insurance / risk</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="spk-years">Years in industry</label>
            <select id="spk-years" name="years" required defaultValue="" disabled={state.ok}>
              <option value="">Select —</option>
              <option>0–2</option>
              <option>3–5</option>
              <option>6–10</option>
              <option>11–20</option>
              <option>20+</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="spk-connection">
            Connection to the club <span style={{ color: "var(--ink-4)" }}>(optional)</span>
          </label>
          <input
            id="spk-connection"
            name="connection"
            placeholder="Alum, parent, friend of an officer, cold inbound, etc."
            disabled={state.ok}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-h">
          <span className="num">03</span> · The talk
        </div>
        <div className="field">
          <label>Topics you&apos;d want to discuss</label>
          <div className="topic-chips">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                className={topics.includes(topic) ? "topic-chip on" : "topic-chip"}
                disabled={state.ok}
                onClick={() =>
                  setTopics((current) =>
                    current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic],
                  )
                }
              >
                {topic}
              </button>
            ))}
          </div>
          <input type="hidden" name="topics" value={topics.join(", ")} />
          <div className="field-help">Pick one or two — students prefer focused sessions.</div>
        </div>
        <div className="field">
          <label htmlFor="spk-session">Working title for the session</label>
          <input
            id="spk-session"
            name="sessionTitle"
            required
            placeholder="e.g. How a deal actually closes"
            disabled={state.ok}
          />
        </div>
        <div className="field">
          <label htmlFor="spk-abstract">One paragraph — what you&apos;d cover</label>
          <textarea
            id="spk-abstract"
            name="abstract"
            required
            placeholder="A few sentences. We'll write the polished version with you."
            disabled={state.ok}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-h">
          <span className="num">04</span> · Logistics
        </div>
        <div className="field">
          <label>Format preference</label>
          <div className="topic-chips">
            {FORMATS.map((value) => (
              <button
                key={value}
                type="button"
                className={format === value ? "topic-chip on" : "topic-chip"}
                disabled={state.ok}
                onClick={() => setFormat(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <input type="hidden" name="format" value={format} />
        </div>
        <div className="field">
          <label>
            Suggested dates <span style={{ color: "var(--ink-4)" }}>(pick any that work — we&apos;ll confirm one)</span>
          </label>
          <div className="date-pills">
            {DATES.map((date) => (
              <button
                key={date.value}
                type="button"
                className={dates.includes(date.value) ? "date-pill on" : "date-pill"}
                disabled={state.ok}
                onClick={() =>
                  setDates((current) =>
                    current.includes(date.value)
                      ? current.filter((item) => item !== date.value)
                      : [...current, date.value],
                  )
                }
              >
                <div className="mo">{date.mo}</div>
                <div className="day">{date.day}</div>
                <div className="dow">{date.dow}</div>
              </button>
            ))}
          </div>
          <input type="hidden" name="dates" value={dates.join(", ")} />
        </div>
        <div className="field">
          <label htmlFor="spk-notes">
            Anything else we should know? <span style={{ color: "var(--ink-4)" }}>(optional)</span>
          </label>
          <textarea
            id="spk-notes"
            name="notes"
            placeholder="Travel constraints, AV needs, dietary restrictions, etc."
            disabled={state.ok}
          />
        </div>
      </div>

      <div className="form-foot">
        <div className="note">
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--green)", display: "inline-block" }} />
          Routes to officers + faculty advisor
        </div>
        <button type="submit" className="btn red lg" disabled={pending || state.ok}>
          {state.ok ? "Submitted ✓" : pending ? "Submitting…" : "Submit application"}
          {!state.ok ? <span className="arrow">→</span> : null}
        </button>
      </div>
      {state.ok ? (
        <div className="ok-msg show">
          <span>✓</span> Thank you — an officer will be in touch within 5 school days to confirm a date.
        </div>
      ) : null}
      {state.error ? (
        <div className="info-note">
          <b>Could not submit.</b> {state.error}
        </div>
      ) : null}
    </form>
  );
}
