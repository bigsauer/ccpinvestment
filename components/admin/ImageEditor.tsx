"use client";

import { useRef, useState, type CSSProperties } from "react";
import { uploadPhoto } from "@/components/admin/upload";
import { useCanWrite } from "@/components/admin/WriteGate";

type Props = {
  kind: "hero" | "banner" | "pitch";
  sample: { eyebrow: string; title: string };
  /** What the site shows today (an officer's photo, or the original). */
  current: { src: string; x: number; y: number; alt: string };
  /** The original image the site shipped with. */
  original: { src: string; x: number; y: number };
};

// Shapes the photo is cropped to on the real pages (desktop width ~1440px, phone ~390px).
const FRAMES: Record<Props["kind"], { desktop: string; mobile: string }> = {
  hero: { desktop: "2.3 / 1", mobile: "0.7 / 1" },
  banner: { desktop: "2.6 / 1", mobile: "0.9 / 1" },
  pitch: { desktop: "4 / 3", mobile: "4 / 3" },
};

const OVERLAY: Record<Props["kind"], string | null> = {
  hero:
    "linear-gradient(180deg, rgba(10,10,12,0.35) 0%, rgba(10,10,12,0.1) 40%, rgba(10,10,12,0.85) 100%), linear-gradient(90deg, rgba(10,10,12,0.55) 0%, rgba(10,10,12,0.1) 55%, rgba(10,10,12,0) 100%)",
  banner:
    "linear-gradient(180deg, rgba(10,10,12,0.5) 0%, rgba(10,10,12,0.25) 45%, rgba(10,10,12,0.9) 100%), linear-gradient(90deg, rgba(10,10,12,0.65) 0%, rgba(10,10,12,0.2) 55%, rgba(10,10,12,0.05) 100%)",
  pitch: null,
};

/**
 * Pick a photo, set where it is cropped, and see it the way the page will show it (desktop and phone,
 * with the real darkening and a sample headline) before anything goes live. Posts hidden fields to the form around it.
 */
export function ImageEditor({ kind, sample, current, original }: Props) {
  const writable = useCanWrite();
  const [src, setSrc] = useState(current.src);
  const [x, setX] = useState(current.x);
  const [y, setY] = useState(current.y);
  const [alt, setAlt] = useState(current.alt);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [showCurrent, setShowCurrent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const changed = src !== current.src || x !== current.x || y !== current.y;
  const shown = showCurrent ? { src: current.src, x: current.x, y: current.y } : { src, x, y };
  const frame: CSSProperties = {
    aspectRatio: FRAMES[kind][device],
    width: device === "mobile" ? 260 : "100%",
    maxWidth: "100%",
  };
  const withText = kind !== "pitch";

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const url = await uploadPhoto(file, { large: true });
      setSrc(url);
      setX(50);
      setY(kind === "banner" ? 30 : 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="img-editor">
      <input type="hidden" name="photoUrl" value={src} />
      <input type="hidden" name="focusX" value={x} />
      <input type="hidden" name="focusY" value={y} />
      <input type="hidden" name="alt" value={alt} />

      <div className="img-editor-bar">
        <div className="tab-strip" style={{ margin: 0 }}>
          <button type="button" className={device === "desktop" ? "t on" : "t"} onClick={() => setDevice("desktop")}>
            Computer
          </button>
          <button type="button" className={device === "mobile" ? "t on" : "t"} onClick={() => setDevice("mobile")}>
            Phone
          </button>
        </div>
        {changed ? (
          <button
            type="button"
            className="btn"
            onPointerDown={() => setShowCurrent(true)}
            onPointerUp={() => setShowCurrent(false)}
            onPointerLeave={() => setShowCurrent(false)}
            onClick={(e) => e.preventDefault()}
          >
            Hold to see what’s live now
          </button>
        ) : (
          <span className="admin-note">This is what the site shows now.</span>
        )}
      </div>

      <div className="img-frame-wrap">
        <div className="img-frame" style={frame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown.src} alt="" style={{ objectPosition: `${shown.x}% ${shown.y}%` }} />
          {OVERLAY[kind] ? <div className="img-overlay" style={{ background: OVERLAY[kind]! }} /> : null}
          {withText ? (
            <div className="img-sample">
              <div className="e">{sample.eyebrow}</div>
              <div className="t">{sample.title}</div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="field-help" style={{ marginTop: 8 }}>
        The preview uses the same crop and darkening as the page. {device === "mobile" ? "Phones show a tall, narrow slice of the photo." : "Wide screens show a wide, short slice."}
      </div>

      <div className="img-controls">
        <div className="field">
          <label>Move the crop left or right</label>
          <input type="range" min={0} max={100} value={x} onChange={(e) => setX(Number(e.target.value))} disabled={!writable} />
        </div>
        <div className="field">
          <label>Move the crop up or down</label>
          <input type="range" min={0} max={100} value={y} onChange={(e) => setY(Number(e.target.value))} disabled={!writable} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
          <button type="button" className="btn red" disabled={!writable || busy} onClick={() => input.current?.click()}>
            {busy ? "Uploading…" : "Choose a new photo"}
          </button>
          <button
            type="button"
            className="btn"
            disabled={!writable}
            onClick={() => {
              setSrc(original.src);
              setX(original.x);
              setY(original.y);
            }}
          >
            Use the original photo
          </button>
          <button
            type="button"
            className="btn"
            disabled={!writable}
            onClick={() => {
              setX(original.x);
              setY(original.y);
            }}
          >
            Re-centre
          </button>
        </div>
        {error ? <div className="admin-err" style={{ marginBottom: 10 }}>{error}</div> : null}
        <div className="field">
          <label>Description for screen readers and search</label>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Students listening to a guest speaker" />
        </div>
      </div>
    </div>
  );
}
