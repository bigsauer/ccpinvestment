"use client";

import { useMemo, useState } from "react";
import { safeHttpUrl } from "@/lib/safe-url";
import { linkedinHandle } from "@/lib/utils";

export type PublicSpeaker = {
  id: string;
  firstName: string;
  lastName: string;
  firm: string;
  title: string;
  topic: string;
  season: string | null;
  status: "UPCOMING" | "PAST";
  sessionDate: string | null;
  linkedinUrl: string | null;
};

function tagLabel(speaker: PublicSpeaker) {
  if (!speaker.sessionDate) return speaker.status === "UPCOMING" ? "Upcoming" : "Past";
  const date = new Date(speaker.sessionDate);
  const label = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "America/Chicago",
  }).format(date);
  return speaker.status === "UPCOMING" ? `Upcoming · ${label}` : `Past · ${label}`;
}

export function SpeakerArchive({ speakers }: { speakers: PublicSpeaker[] }) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const visible = useMemo(
    () =>
      speakers.filter((speaker) => {
        if (filter === "all") return true;
        return speaker.status.toLowerCase() === filter;
      }),
    [filter, speakers],
  );

  return (
    <>
      <div className="filters">
        {(["all", "upcoming", "past"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={filter === key ? "filter on" : "filter"}
            onClick={() => setFilter(key)}
          >
            {key === "all" ? "All" : key === "upcoming" ? "Upcoming" : "Past"}
          </button>
        ))}
      </div>

      <div className="speakers-grid">
        {visible.map((speaker) => {
          const linkedin = safeHttpUrl(speaker.linkedinUrl);
          return (
          <article key={speaker.id} className="spkr" data-type={speaker.status.toLowerCase()}>
            <div className="spkr-photo">
              <div className={speaker.status === "UPCOMING" ? "tag up" : "tag"}>{tagLabel(speaker)}</div>
              <div className="spkr-fallback">{`${speaker.firstName[0] ?? ""}${speaker.lastName[0] ?? ""}`}</div>
            </div>
            <div className="spkr-body">
              <div className="spkr-date">{speaker.season ?? "Season TBA"}</div>
              <div className="spkr-name">
                {speaker.firstName} {speaker.lastName}
              </div>
              <div className="spkr-role">
                {speaker.title}
                {speaker.firm ? `, ${speaker.firm}` : ""}
              </div>
              {speaker.topic ? <p className="spkr-topic">{speaker.topic}</p> : null}
              {linkedin ? (
                <a className="spkr-linkedin" href={linkedin} target="_blank" rel="noopener noreferrer">
                  <span className="li-ico">in</span>
                  <span className="handle">{linkedinHandle(linkedin)}</span>
                  <span className="arrow">↗</span>
                </a>
              ) : null}
            </div>
          </article>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="empty-note">
          <span className="em">No speakers in this filter</span>
          Officers add guests from the admin archive as sessions lock in.
        </div>
      ) : (
        <div className="empty-note">
          <span className="em">Seed / demo archive</span>
          Replace names, roles, and photos with confirmed guests before a public launch.
        </div>
      )}
    </>
  );
}
