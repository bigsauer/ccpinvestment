"use client";

import { useRef, useState } from "react";
import { uploadPhoto } from "@/components/admin/upload";
import { useCanWrite } from "@/components/admin/WriteGate";

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
      setUrl(await uploadPhoto(file));
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
