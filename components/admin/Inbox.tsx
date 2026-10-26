"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addApplicationNote, deleteApplication, setApplicationStatus, toggleApplicationFlag } from "@/lib/actions/admin";
import type { FormState } from "@/lib/form-state";
import { useCanWrite } from "@/components/admin/WriteGate";
import { avatarTone, initials, relativeWhen } from "@/lib/utils";

type AppRow = {
  id: string;
  type: "STUDENT" | "SPEAKER";
  status: "NEW" | "REVIEWING" | "APPROVED" | "REJECTED" | "ARCHIVED";
  flagged: boolean;
  promotedId: string | null;
  submittedAt: string;
  payload: Record<string, string>;
  notes: { id: string; body: string; createdAt: string; author: string }[];
};

type Tab = "all" | "students" | "speakers" | "archived";
type Filter = "all" | "unread" | "flagged" | "approved";

const LABELS: Record<string, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  phone: "Phone",
  gradYear: "Class of",
  interest: "Interest",
  linkedin: "LinkedIn",
  city: "City",
  firm: "Firm",
  title: "Title",
  industry: "Industry",
  years: "Years in industry",
  connection: "Connection to the club",
  topics: "Topics",
  sessionTitle: "Working title",
  dates: "Dates that work",
  format: "Format",
  notes: "Notes",
  why: "Why interested",
  abstract: "What they'd cover",
};
const HIDDEN_FROM_LIST = new Set(["abstract", "why"]);

function replyLink(app: AppRow) {
  const email = app.payload.email;
  if (!email) return null;
  const first = app.payload.firstName || "there";
  const subject = app.type === "SPEAKER" ? "Speaking to the Chaminade Investment Club" : "Your Chaminade Investment Club application";
  const body = `Hi ${first},\n\n`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function Inbox({ applications, initialId }: { applications: AppRow[]; initialId?: string }) {
  const router = useRouter();
  const writable = useCanWrite();
  const [tab, setTab] = useState<Tab>("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState(applications.find((a) => a.id === initialId)?.id ?? applications[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const counts = useMemo(
    () => ({
      all: applications.filter((app) => app.status !== "ARCHIVED").length,
      students: applications.filter((app) => app.type === "STUDENT" && app.status !== "ARCHIVED").length,
      speakers: applications.filter((app) => app.type === "SPEAKER" && app.status !== "ARCHIVED").length,
      archived: applications.filter((app) => app.status === "ARCHIVED").length,
    }),
    [applications],
  );

  const needle = query.trim().toLowerCase();
  const list = applications.filter((app) => {
    if (needle && !Object.values(app.payload).join(" ").toLowerCase().includes(needle)) return false;
    if (tab === "archived") return app.status === "ARCHIVED";
    if (app.status === "ARCHIVED") return false;
    if (tab === "students") return app.type === "STUDENT";
    if (tab === "speakers") return app.type === "SPEAKER";
    if (filter === "unread") return app.status === "NEW";
    if (filter === "flagged") return app.flagged;
    if (filter === "approved") return app.status === "APPROVED";
    return true;
  });

  const selected = applications.find((app) => app.id === selectedId) ?? list[0] ?? null;

  const run = (fn: () => Promise<FormState>) => {
    start(async () => {
      const result = await fn();
      if (result.ok) {
        setError(null);
        router.refresh();
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <>
      <div className="tab-strip">
        {(
          [
            ["all", "All", counts.all],
            ["students", "Students", counts.students],
            ["speakers", "Speakers", counts.speakers],
            ["archived", "Archived", counts.archived],
          ] as const
        ).map(([key, label, count]) => (
          <button key={key} type="button" className={tab === key ? "t on" : "t"} onClick={() => setTab(key)}>
            {label} <span className="count">{count}</span>
          </button>
        ))}
      </div>

      <div className="inbox-grid">
        <div className="inbox-list">
          <div className="inbox-list-head">
            <div className="h">{list.length} applications</div>
            <div className="desc">Newest</div>
          </div>
          <div style={{ padding: "0 14px 10px" }}>
            <input
              className="admin-search"
              style={{ width: "100%", minWidth: 0 }}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search these inquiries…"
              aria-label="Search inquiries"
            />
          </div>
          <div className="inbox-filter">
            {(["all", "unread", "flagged", "approved"] as const).map((key) => (
              <button key={key} type="button" className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
                {key[0]!.toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <div className="inbox-items">
            {list.map((app) => {
              const name = `${app.payload.firstName ?? ""} ${app.payload.lastName ?? ""}`.trim() || "Untitled";
              const sub =
                app.type === "SPEAKER"
                  ? `${app.payload.title ?? ""} · ${app.payload.firm ?? ""}`
                  : `${app.payload.interest ?? "Student"} · ${app.payload.gradYear ?? ""}`;
              return (
                <button
                  key={app.id}
                  type="button"
                  className={selected?.id === app.id ? "inbox-item on" : "inbox-item"}
                  onClick={() => setSelectedId(app.id)}
                >
                  <div className={`av ${avatarTone(name)}`}>{initials(name)}</div>
                  <div className="meta">
                    <div className="nm">{name}</div>
                    <div className="sub">{sub}</div>
                  </div>
                  <div className="right">
                    <div className="when">{relativeWhen(new Date(app.submittedAt))}</div>
                    <div className={app.type === "SPEAKER" ? "kind spk" : "kind stu"}>
                      {app.type === "SPEAKER" ? "Speaker" : "Student"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selected ? (
          <div className="inbox-detail">
            <div className="inbox-detail-head">
              <div className="who">
                <div className={`av ${avatarTone(selected.id)}`}>
                  {initials(`${selected.payload.firstName ?? ""} ${selected.payload.lastName ?? ""}`)}
                </div>
                <div>
                  <h2>
                    {selected.payload.firstName} {selected.payload.lastName}
                  </h2>
                  <div className="meta">
                    {selected.type === "SPEAKER" ? "SPEAKER APPLICATION" : "STUDENT APPLICATION"} · {selected.status}
                  </div>
                </div>
              </div>
              {writable ? (
                <div className="actions">
                  {replyLink(selected) ? (
                    <a className="btn" href={replyLink(selected)!}>
                      Reply by email
                    </a>
                  ) : null}
                  <button className="btn" disabled={pending} onClick={() => run(() => toggleApplicationFlag(selected.id))}>
                    {selected.flagged ? "Unflag" : "Flag"}
                  </button>
                  {selected.status === "NEW" ? (
                    <button className="btn" disabled={pending} onClick={() => run(() => setApplicationStatus(selected.id, "REVIEWING"))}>
                      Mark reviewing
                    </button>
                  ) : null}
                  {selected.status === "ARCHIVED" || selected.status === "REJECTED" ? (
                    <button className="btn" disabled={pending} onClick={() => run(() => setApplicationStatus(selected.id, "NEW"))}>
                      Reopen
                    </button>
                  ) : null}
                  {selected.status !== "ARCHIVED" ? (
                    <button className="btn" disabled={pending} onClick={() => run(() => setApplicationStatus(selected.id, "ARCHIVED"))}>
                      Archive
                    </button>
                  ) : null}
                  {selected.status !== "REJECTED" && selected.status !== "APPROVED" ? (
                    <button className="btn" disabled={pending} onClick={() => run(() => setApplicationStatus(selected.id, "REJECTED"))}>
                      Decline
                    </button>
                  ) : null}
                  {selected.status !== "APPROVED" ? (
                    <button className="btn red" disabled={pending} onClick={() => run(() => setApplicationStatus(selected.id, "APPROVED"))}>
                      Approve
                    </button>
                  ) : null}
                  <button
                    className="btn danger"
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm("Delete this inquiry for good? Notes go with it.")) return;
                      run(() => deleteApplication(selected.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="actions">
                  <div className="info-note">Advisor view is read-only</div>
                </div>
              )}
            </div>
            <div className="inbox-detail-body">
              {error ? <div className="info-note">{error}</div> : null}
              {selected.status === "APPROVED" && selected.promotedId ? (
                <div className="ok-msg show" style={{ marginBottom: 14 }}>
                  <span>✓</span>
                  <span>
                    Approved and added.{" "}
                    <Link href={selected.type === "SPEAKER" ? `/admin/speakers/${selected.promotedId}` : `/admin/members/${selected.promotedId}`}>
                      {selected.type === "SPEAKER" ? "Finish their speaker profile →" : "Open their member record →"}
                    </Link>
                  </span>
                </div>
              ) : null}
              <div className="inbox-detail-section">
                <div className="h">About</div>
                <div className="kv-grid">
                  {Object.entries(selected.payload)
                    .filter(([key, value]) => !HIDDEN_FROM_LIST.has(key) && key !== "firstName" && key !== "lastName" && value !== "")
                    .sort(([a], [b]) => {
                      const order = Object.keys(LABELS);
                      const ai = order.indexOf(a);
                      const bi = order.indexOf(b);
                      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                    })
                    .map(([key, value]) => (
                      <div key={key} style={{ display: "contents" }}>
                        <div className="k">{LABELS[key] ?? key}</div>
                        <div className="v">
                          {key === "email" ? (
                            <a href={`mailto:${value}`}>{value}</a>
                          ) : key === "linkedin" && /^https?:\/\//.test(value) ? (
                            <a href={value} target="_blank" rel="noopener noreferrer">
                              {value.replace(/^https?:\/\/(www\.)?/, "")}
                            </a>
                          ) : (
                            value
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              {selected.payload.abstract || selected.payload.why ? (
                <div className="inbox-detail-section">
                  <div className="h">{selected.payload.abstract ? "What they would cover" : "Why they want to join"}</div>
                  <div className="quote">{selected.payload.abstract || selected.payload.why}</div>
                </div>
              ) : null}
              <div className="inbox-detail-section">
                <div className="h">Internal notes</div>
                <div className="note-thread">
                  {selected.notes.map((item) => (
                    <div className="note" key={item.id}>
                      <div className="meta">
                        <b>{item.author}</b> · {relativeWhen(new Date(item.createdAt))}
                      </div>
                      <div className="body">{item.body}</div>
                    </div>
                  ))}
                  {writable ? (
                    <form
                      className="note-input"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const body = note;
                        setNote("");
                        run(() => addApplicationNote(selected.id, body));
                      }}
                    >
                      <input
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Add a note…"
                      />
                      <button className="btn" type="submit" disabled={pending}>
                        Post
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="inbox-detail">
            <div className="card-body">No applications in this view.</div>
          </div>
        )}
      </div>
    </>
  );
}
