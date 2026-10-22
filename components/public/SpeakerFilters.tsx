"use client";

import Image from "next/image";
import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { SpeakerProfile } from "@/components/public/SpeakerProfile";
import { safeHttpUrl } from "@/lib/safe-url";
import { localPhoto, tagLabel, type PublicSpeaker } from "@/lib/speakers";
import { linkedinHandle } from "@/lib/utils";

export function SpeakerArchive({ speakers }: { speakers: PublicSpeaker[] }) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeProfile = useCallback(() => setActiveId(null), []);

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
        {visible.map((speaker, i) => {
          const linkedin = safeHttpUrl(speaker.linkedinUrl);
          const photo = localPhoto(speaker.photoUrl);
          return (
            <article
              key={speaker.id}
              className="spkr"
              data-type={speaker.status.toLowerCase()}
              style={{ "--i": i % 9 } as CSSProperties}
              onClick={() => setActiveId(speaker.id)}
            >
              <div className="spkr-photo">
                {photo ? (
                  <Image
                    className="spkr-img"
                    src={photo}
                    alt={`${speaker.firstName} ${speaker.lastName}`}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                  />
                ) : (
                  <div className="spkr-fallback">{`${speaker.firstName[0] ?? ""}${speaker.lastName[0] ?? ""}`}</div>
                )}
                <div className={speaker.status === "UPCOMING" ? "tag up" : "tag"}>{tagLabel(speaker)}</div>
              </div>
              <div className="spkr-body">
                <div className="spkr-date">{speaker.season ?? "Season TBA"}</div>
                <div className="spkr-name">
                  {speaker.firstName} {speaker.lastName}
                </div>
                <div className="spkr-role">{[speaker.title, speaker.firm].filter(Boolean).join(", ")}</div>
                {speaker.topic ? <p className="spkr-topic">{speaker.topic}</p> : null}
                {linkedin ? (
                  <a
                    className="spkr-linkedin"
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="li-ico">in</span>
                    <span className="handle">{linkedinHandle(linkedin)}</span>
                    <span className="arrow">↗</span>
                  </a>
                ) : null}
                <button
                  type="button"
                  className="spkr-more"
                  aria-haspopup="dialog"
                  aria-label={`View profile: ${speaker.firstName} ${speaker.lastName}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveId(speaker.id);
                  }}
                >
                  View profile <span className="ar">→</span>
                </button>
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
      ) : null}

      {activeId ? (
        <SpeakerProfile speakers={visible} activeId={activeId} onSelect={setActiveId} onClose={closeProfile} />
      ) : null}
    </>
  );
}
