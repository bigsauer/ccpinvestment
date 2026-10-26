"use client";

import { useRef, useState } from "react";
import { useCanWrite } from "@/components/admin/WriteGate";

const MAX_EDGE = 1600;

/** Shrinks a big phone photo in the browser first, so uploads stay quick and under host body limits. */
async function downscale(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    return blob ?? file;
  } catch {
    return file; // e.g. HEIC the browser cannot decode: the server converts it
  }
}

export function PhotoField({ name = "photoUrl", defaultValue, label = "Photo" }: { name?: string; defaultValue?: string | null; label?: string }) {
  const writable = useCanWrite();
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const blob = await downscale(file);
      const body = new FormData();
      body.set("file", blob, file.name.replace(/\.[^.]+$/, "") + ".jpg");
      const res = await fetch("/api/admin/photo", { method: "POST", body });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed. Try again.");
      setUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="field photo-field">
      <label>{label}</label>
      <div className="photo-field-row">
        <div className="photo-field-preview">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" />
          ) : (
            <span>No photo</span>
          )}
        </div>
        <div className="photo-field-actions">
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <button type="button" className="btn" disabled={!writable || busy} onClick={() => input.current?.click()}>
            {busy ? "Uploading…" : url ? "Replace photo" : "Upload photo"}
          </button>
          {url ? (
            <button type="button" className="btn" disabled={!writable || busy} onClick={() => setUrl("")}>
              Remove
            </button>
          ) : null}
          <div className="field-help">JPG, PNG, WebP or HEIC. Head and shoulders work best.</div>
          {error ? <div className="admin-err">{error}</div> : null}
        </div>
      </div>
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
