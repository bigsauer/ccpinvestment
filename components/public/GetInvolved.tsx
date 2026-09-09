"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JoinForm } from "@/components/public/JoinForm";
import { SpeakForm } from "@/components/public/SpeakForm";

type Tab = "students" | "speakers";

export function GetInvolved() {
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("students");

  useEffect(() => {
    const next = params.get("tab");
    if (next === "speakers" || next === "students") setTab(next);
  }, [params]);

  function select(next: Tab) {
    setTab(next);
    router.replace(`/get-involved?tab=${next}`, { scroll: false });
  }

  return (
    <>
      <div className="gi-doors">
        <div className="wrap">
          <div className="gi-doors-inner">
            <button
              type="button"
              className={tab === "students" ? "gi-door active" : "gi-door"}
              onClick={() => select("students")}
            >
              <div className="label">
                <span className="num">01</span> For students
              </div>
              <h3>
                Apply to <span className="serif">join the club.</span>
              </h3>
              <p>Open to all Chaminade grades. Submit one form, an officer follows up before the next meeting.</p>
              <span className="arrow-go">
                Open <span className="ar">→</span>
              </span>
            </button>
            <button
              type="button"
              className={tab === "speakers" ? "gi-door active" : "gi-door"}
              onClick={() => select("speakers")}
            >
              <div className="label">
                <span className="num">02</span> For professionals
              </div>
              <h3>
                Come <span className="serif">speak to us.</span>
              </h3>
              <p>One working professional per meeting. Conversational, 35 minutes, in-person preferred.</p>
              <span className="arrow-go">
                Open <span className="ar">→</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <section className="gi-section">
        <div className="wrap">
          {tab === "students" ? (
            <div className="gi-students-wrap">
              <div>
                <div className="gi-club-eyebrow">What the club is</div>
                <h2 className="gi-club-headline">
                  A room of <span className="serif">working professionals,</span> answering your questions.
                </h2>
                <p className="gi-club-intro">
                  The Chaminade Investment Club meets every other Friday morning. Each meeting brings in one working
                  professional — a portfolio manager, an investment banker, a hedge-fund analyst, a startup founder —
                  for an honest conversation about how their world actually operates. Not a lecture. A real conversation,
                  with real questions students prepared the week before.
                </p>
                <p className="gi-club-intro">
                  You don&apos;t need to know what an EBITDA is. You don&apos;t need to own a stock. You don&apos;t need
                  to want a finance career. What you need is curiosity about how money, decisions, and careers actually
                  work in the wild — and a willingness to show up at 7:45 AM.
                </p>
                <div
                  className="gi-rhythm-h"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: 10.5,
                    color: "var(--ink-4)",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    margin: "24px 0 4px",
                  }}
                >
                  A typical meeting
                </div>
                <div className="gi-rhythm">
                  <div className="min">7:45</div>
                  <div className="what">
                    Coffee, donuts, members filter in
                    <span className="qual">Officers introduce that day&apos;s speaker to anyone who hasn&apos;t met them.</span>
                  </div>
                </div>
                <div className="gi-rhythm">
                  <div className="min">7:50</div>
                  <div className="what">
                    Speaker opens — 10 minutes
                    <span className="qual">Their path, their firm, what they actually do on a Tuesday.</span>
                  </div>
                </div>
                <div className="gi-rhythm">
                  <div className="min">8:00</div>
                  <div className="what">
                    Q&amp;A — 25 minutes
                    <span className="qual">Officer-curated questions first, then open floor. This is the part that matters.</span>
                  </div>
                </div>
                <div className="gi-rhythm">
                  <div className="min">8:25</div>
                  <div className="what">
                    Handshakes &amp; contact swap
                    <span className="qual">Five minutes to introduce yourself before first period.</span>
                  </div>
                </div>
                <div className="gi-quickfacts">
                  <div className="h">The basics</div>
                  <div className="row">
                    <div className="k">When</div>
                    <div className="v">Every other Friday, 7:45–8:30 AM</div>
                  </div>
                  <div className="row">
                    <div className="k">Where</div>
                    <div className="v">Little Theatre, Chaminade campus</div>
                  </div>
                  <div className="row">
                    <div className="k">Who</div>
                    <div className="v">All grades, ~40–60 members</div>
                  </div>
                  <div className="row">
                    <div className="k">Cost</div>
                    <div className="v">Free — no dues, no fees</div>
                  </div>
                  <div className="row">
                    <div className="k">Prereq</div>
                    <div className="v">None. Curiosity only.</div>
                  </div>
                  <div className="row">
                    <div className="k">Commitment</div>
                    <div className="v">Show up when you can; missing weeks is fine</div>
                  </div>
                </div>
              </div>
              <JoinForm />
            </div>
          ) : (
            <div className="speak-wrap">
              <div>
                <div className="speak-eyebrow">What it looks like</div>
                <h2 className="speak-headline">
                  A real meeting, <span className="serif">not a lecture.</span>
                </h2>
                <p className="speak-intro">
                  A short opening — what you do, how you got there — then 25 minutes of student questions the officers
                  prepare in advance. Bring slides if you want, or don&apos;t. Most of our best sessions had none.
                </p>
                <div className="speak-spec">
                  <div className="speak-spec-row">
                    <div className="k">Format</div>
                    <div className="v">
                      10 min opening · 25 min Q&amp;A · 5 min handshake
                      <span className="qual">In-person preferred. Virtual fine for out-of-region speakers.</span>
                    </div>
                  </div>
                  <div className="speak-spec-row">
                    <div className="k">Audience</div>
                    <div className="v">
                      ~40–60 students, grades 9–12
                      <span className="qual">Most are members; we open select sessions to other clubs.</span>
                    </div>
                  </div>
                  <div className="speak-spec-row">
                    <div className="k">When</div>
                    <div className="v">
                      Fridays, 7:45–8:30 AM
                      <span className="qual">Before first period. Coffee provided.</span>
                    </div>
                  </div>
                  <div className="speak-spec-row">
                    <div className="k">Where</div>
                    <div className="v">
                      Little Theatre — 425 S Lindbergh Blvd, Creve Coeur MO
                      <span className="qual">Parking pass and visitor badge handled by the front office.</span>
                    </div>
                  </div>
                  <div className="speak-spec-row">
                    <div className="k">Stipend</div>
                    <div className="v">
                      None — we&apos;re a student club
                      <span className="qual">We will, however, feed you breakfast and write a thoughtful thank-you.</span>
                    </div>
                  </div>
                  <div className="speak-spec-row" style={{ borderBottom: "none" }}>
                    <div className="k">Recording</div>
                    <div className="v">
                      Off by default
                      <span className="qual">If you&apos;d like a recording for your own use, we&apos;ll arrange it.</span>
                    </div>
                  </div>
                </div>
                <div className="speak-asks">
                  <div className="h">A few asks</div>
                  <ul>
                    <li>Be specific. &quot;What I did Tuesday&quot; beats &quot;What is finance.&quot;</li>
                    <li>Honest about pay, hours, and wrong turns. Students notice when you&apos;re not.</li>
                    <li>No pitching products, funds, or services to minors.</li>
                    <li>Background check is required — the school handles it; takes about a week.</li>
                  </ul>
                </div>
              </div>
              <SpeakForm />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
