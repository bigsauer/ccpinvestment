"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { safeHttpUrl } from "@/lib/safe-url";
import { localPhoto, tagLabel, type PublicSpeaker } from "@/lib/speakers";
import { speakerSlug } from "@/lib/site";
import { linkedinHandle } from "@/lib/utils";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EXIT_MS = 200;

function longDate(speaker: PublicSpeaker) {
  if (!speaker.sessionDate) return speaker.season ?? "Date to be announced";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(speaker.sessionDate));
}

function step(n: number): CSSProperties {
  return { "--d": n } as CSSProperties;
}

type Props = {
  speakers: PublicSpeaker[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function SpeakerProfile({ speakers, activeId, onSelect, onClose }: Props) {
  const index = Math.max(0, speakers.findIndex((s) => s.id === activeId));
  const speaker = speakers[index];

  const [closing, setClosing] = useState(false);
  const [dir, setDir] = useState<"next" | "prev" | "none">("none");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef(0);

  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closeTimer.current = window.setTimeout(onClose, reduce ? 0 : EXIT_MS);
  }, [closing, onClose]);

  const go = useCallback(
    (delta: 1 | -1) => {
      if (speakers.length < 2) return;
      setDir(delta === 1 ? "next" : "prev");
      onSelect(speakers[(index + delta + speakers.length) % speakers.length].id);
    },
    [index, onSelect, speakers],
  );

  // Lock page scroll, move focus into the dialog, and give focus back afterwards.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      window.clearTimeout(closeTimer.current);
      previous?.focus?.();
    };
  }, []);

  // Escape closes, arrows browse, Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      } else if (e.key === "ArrowRight") {
        go(1);
      } else if (e.key === "ArrowLeft") {
        go(-1);
      } else if (e.key === "Tab" && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, requestClose]);

  if (!speaker) return null;

  const photo = localPhoto(speaker.photoUrl);
  const linkedin = safeHttpUrl(speaker.linkedinUrl);
  const role = [speaker.title, speaker.firm].filter(Boolean).join(", ");
  const fullName = `${speaker.firstName} ${speaker.lastName}`;
  const upcoming = speaker.status === "UPCOMING";

  const facts: Array<[string, string]> = [[upcoming ? "Speaking" : "Spoke at the club", longDate(speaker)]];
  if (speaker.industry) facts.push(["Industry", speaker.industry]);
  if (speaker.season && speaker.sessionDate) facts.push(["Season", speaker.season]);

  return createPortal(
    <div className="spm" data-state={closing ? "closing" : "open"} data-dir={dir}>
      <div className="spm-backdrop" onClick={requestClose} />
      <div className="spm-panel" role="dialog" aria-modal="true" aria-labelledby="spm-name" ref={panelRef}>
        <button ref={closeRef} type="button" className="spm-close" aria-label="Close profile" onClick={requestClose}>
          <span aria-hidden="true">×</span>
        </button>

        <div className="spm-photo" key={`photo-${speaker.id}`}>
          {photo ? (
            <Image src={photo} alt={fullName} fill priority sizes="(max-width: 720px) 100vw, 400px" />
          ) : (
            <div className="spkr-fallback">{`${speaker.firstName[0] ?? ""}${speaker.lastName[0] ?? ""}`}</div>
          )}
          <div className={upcoming ? "tag up" : "tag"}>{tagLabel(speaker)}</div>
        </div>

        <div className="spm-body" key={`body-${speaker.id}`}>
          <div className="spm-eyebrow" style={step(0)}>
            {speaker.season ?? (upcoming ? "Upcoming guest" : "Past guest")}
          </div>
          <h3 className="spm-name" id="spm-name" style={step(1)}>
            {fullName}
          </h3>
          {role ? (
            <div className="spm-role" style={step(2)}>
              {role}
            </div>
          ) : null}

          <dl className="spm-facts" style={step(3)}>
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          {speaker.topic ? (
            <div className="spm-block" style={step(4)}>
              <div className="spm-label">Topic</div>
              <p>{speaker.topic}</p>
            </div>
          ) : null}

          {speaker.bio ? (
            <div className="spm-block" style={step(5)}>
              <div className="spm-label">About</div>
              <p>{speaker.bio}</p>
            </div>
          ) : null}

          {linkedin ? (
            <a className="spm-li" href={linkedin} target="_blank" rel="noopener noreferrer" style={step(6)}>
              <span className="li-ico">in</span>
              <span className="handle">{linkedinHandle(linkedin)}</span>
              <span className="arrow">↗</span>
            </a>
          ) : null}

          <Link className="spm-full" href={`/speakers/${speakerSlug(speaker.firstName, speaker.lastName)}`} style={step(7)}>
            Open full page <span aria-hidden="true">→</span>
          </Link>

          {speakers.length > 1 ? (
            <div className="spm-nav" style={step(8)}>
              <button type="button" onClick={() => go(-1)} aria-label="Previous speaker">
                <span aria-hidden="true">←</span> Prev
              </button>
              <span className="count" aria-live="polite">
                {index + 1} / {speakers.length}
              </span>
              <button type="button" onClick={() => go(1)} aria-label="Next speaker">
                Next <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
