"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageBlocks } from "@/components/public/PageBlocks";
import { uploadPhoto } from "@/components/admin/upload";
import { useCanWrite } from "@/components/admin/WriteGate";
import { BLOCK_DEFS, blockDef, newBlock, type Block, type BlockType, type FieldDef } from "@/lib/page-blocks";

type LinkOption = { href: string; label: string };

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const writable = useCanWrite();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="pb-image-input">
      <div className="pb-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt="" /> : <span>No photo</span>}
      </div>
      <div>
        <label className="btn" style={{ cursor: writable ? "pointer" : "not-allowed" }}>
          {busy ? "Uploading…" : value ? "Replace" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={!writable || busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setBusy(true);
              setError(null);
              try {
                onChange(await uploadPhoto(file, { large: true }));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>{" "}
        {value ? (
          <button type="button" className="btn" onClick={() => onChange("")}>
            Remove
          </button>
        ) : null}
        {error ? <div className="admin-err">{error}</div> : null}
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange, links }: { field: FieldDef; value: unknown; onChange: (v: string | number) => void; links: LinkOption[] }) {
  const text = typeof value === "string" || typeof value === "number" ? String(value) : "";
  return (
    <div className="field" style={{ marginBottom: 12 }}>
      <label>{field.label}</label>
      {field.kind === "textarea" ? (
        <textarea value={text} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : field.kind === "select" ? (
        <select value={text} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.kind === "image" ? (
        <ImageInput value={text} onChange={onChange} />
      ) : field.kind === "number" ? (
        <input type="number" min={field.min} max={field.max} value={text} onChange={(e) => onChange(Number(e.target.value))} />
      ) : field.kind === "url" ? (
        <>
          <input value={text} list="pb-links" placeholder={field.placeholder ?? "/meetings or https://…"} onChange={(e) => onChange(e.target.value)} />
          <datalist id="pb-links">
            {links.map((l) => (
              <option key={l.href} value={l.href}>
                {l.label}
              </option>
            ))}
          </datalist>
        </>
      ) : (
        <input value={text} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {field.help ? <div className="field-help">{field.help}</div> : null}
    </div>
  );
}

function summary(block: Block) {
  const keys = ["title", "heading", "text", "body", "label", "q", "url", "src"];
  for (const key of keys) {
    const v = block[key];
    if (typeof v === "string" && v.trim()) return v.trim().slice(0, 60);
  }
  const items = block.items;
  if (Array.isArray(items) && items.length) return `${items.length} item${items.length === 1 ? "" : "s"}`;
  return "";
}

export function PageBuilder({ initial, links }: { initial: Block[]; links: LinkOption[] }) {
  const writable = useCanWrite();
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [open, setOpen] = useState<string | null>(initial[0]?.id ?? null);
  const [picker, setPicker] = useState(initial.length === 0);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const json = useMemo(() => JSON.stringify(blocks), [blocks]);
  const frameRef = useRef<HTMLDivElement>(null);
  const [paneWidth, setPaneWidth] = useState(560);

  // Shrink the desktop preview to fit the pane, like a zoomed-out browser window.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setPaneWidth(el.clientWidth));
    observer.observe(el);
    setPaneWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);
  const DESKTOP_W = 1180;
  const zoom = device === "desktop" ? Math.min(1, Math.max(0.2, (paneWidth - 2) / DESKTOP_W)) : Math.min(1, Math.max(0.3, (paneWidth - 40) / 402));

  const patch = (id: string, change: Record<string, unknown>) => setBlocks((list) => list.map((b) => (b.id === id ? ({ ...b, ...change } as Block) : b)));

  function add(type: BlockType) {
    const block = newBlock(type);
    setBlocks((list) => [...list, block]);
    setOpen(block.id);
    setPicker(false);
  }

  return (
    <div className="builder-grid">
      <input type="hidden" name="blocks" value={json} />

      <div className="builder-left">
        <div className="builder-head">
          <div>
            <div className="group-h">Page content</div>
            <div className="field-help">Add sections and fill them in. They show top to bottom, in this order.</div>
          </div>
          <button type="button" className="btn red" disabled={!writable} onClick={() => setPicker((v) => !v)}>
            {picker ? "Close" : "+ Add a section"}
          </button>
        </div>

        {picker ? (
          <div className="pb-picker">
            {BLOCK_DEFS.map((def) => (
              <button key={def.type} type="button" className="pb-pick" onClick={() => add(def.type)}>
                <span className="ic">{def.icon}</span>
                <span>
                  <b>{def.label}</b>
                  <small>{def.description}</small>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {blocks.length === 0 && !picker ? <div className="story-empty">Nothing here yet. Add your first section.</div> : null}

        {blocks.map((block, index) => {
          const def = blockDef(block.type)!;
          const expanded = open === block.id;
          return (
            <div key={block.id} className={expanded ? "pb-block is-open" : "pb-block"}>
              <div className="pb-block-bar">
                <button type="button" className="pb-block-title" onClick={() => setOpen(expanded ? null : block.id)} aria-expanded={expanded}>
                  <span className="ic">{def.icon}</span>
                  <span className="t">
                    {def.label}
                    <small>{summary(block)}</small>
                  </span>
                  <span className="chev">{expanded ? "▾" : "▸"}</span>
                </button>
                <div className="pb-block-tools">
                  <button type="button" className="btn" disabled={index === 0} onClick={() => setBlocks((l) => move(l, index, index - 1))} aria-label="Move up">↑</button>
                  <button type="button" className="btn" disabled={index === blocks.length - 1} onClick={() => setBlocks((l) => move(l, index, index + 1))} aria-label="Move down">↓</button>
                  <button
                    type="button"
                    className="btn"
                    aria-label="Duplicate"
                    onClick={() =>
                      setBlocks((l) => {
                        const copy = { ...structuredClone(block), id: `b${Math.random().toString(36).slice(2, 10)}` } as Block;
                        const next = l.slice();
                        next.splice(index + 1, 0, copy);
                        return next;
                      })
                    }
                  >
                    ⧉
                  </button>
                  <button
                    type="button"
                    className="btn danger"
                    aria-label="Remove section"
                    onClick={() => {
                      if (window.confirm(`Remove this ${def.label.toLowerCase()} section?`)) setBlocks((l) => l.filter((b) => b.id !== block.id));
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expanded ? (
                <div className="pb-block-body">
                  {def.fields.map((field) => (
                    <FieldInput key={field.key} field={field} value={block[field.key]} links={links} onChange={(v) => patch(block.id, { [field.key]: v })} />
                  ))}
                  {def.fields.length === 0 && !def.list ? <div className="admin-note">Nothing to fill in for this one.</div> : null}

                  {def.list ? (
                    <div className="pb-list">
                      <div className="story-block-h">
                        <div className="group-h">{def.list.label}</div>
                        <button
                          type="button"
                          className="btn"
                          disabled={((block[def.list.key] as unknown[]) ?? []).length >= def.list.max}
                          onClick={() => patch(block.id, { [def.list!.key]: [...(((block[def.list!.key] as Record<string, unknown>[]) ?? [])), Object.fromEntries(def.list!.fields.map((f) => [f.key, ""]))] })}
                        >
                          + Add {def.list.itemLabel.toLowerCase()}
                        </button>
                      </div>
                      {((block[def.list.key] as Record<string, unknown>[]) ?? []).map((item, i, all) => (
                        <div className="story-row" key={i}>
                          <div className="story-row-top" style={{ gridTemplateColumns: "28px 1fr" }}>
                            <span className="story-n">{i + 1}</span>
                            <b style={{ fontSize: 13 }}>{def.list!.itemLabel}</b>
                          </div>
                          {def.list!.fields.map((field) => (
                            <FieldInput
                              key={field.key}
                              field={field}
                              value={item[field.key]}
                              links={links}
                              onChange={(v) =>
                                patch(block.id, { [def.list!.key]: all.map((it, idx) => (idx === i ? { ...it, [field.key]: v } : it)) })
                              }
                            />
                          ))}
                          <div className="story-row-tools">
                            <button type="button" className="btn" disabled={i === 0} onClick={() => patch(block.id, { [def.list!.key]: move(all, i, i - 1) })}>↑</button>
                            <button type="button" className="btn" disabled={i === all.length - 1} onClick={() => patch(block.id, { [def.list!.key]: move(all, i, i + 1) })}>↓</button>
                            <button type="button" className="btn" onClick={() => patch(block.id, { [def.list!.key]: all.filter((_, idx) => idx !== i) })}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="builder-right">
        <div className="builder-preview-bar">
          <div className="group-h">Live preview</div>
          <div className="tab-strip" style={{ margin: 0 }}>
            <button type="button" className={device === "desktop" ? "t on" : "t"} onClick={() => setDevice("desktop")}>
              Computer
            </button>
            <button type="button" className={device === "mobile" ? "t on" : "t"} onClick={() => setDevice("mobile")}>
              Phone
            </button>
          </div>
        </div>
        <div ref={frameRef} className={device === "mobile" ? "pv-frame is-mobile" : "pv-frame"}>
          <div className="pv-inner" style={device === "desktop" ? { width: DESKTOP_W, zoom } : { width: 390, zoom }}>
            {blocks.length === 0 ? <div className="blk-ph" style={{ margin: 40 }}>Your page will appear here as you add sections.</div> : <PageBlocks blocks={blocks} preview />}
          </div>
        </div>
        <div className="field-help" style={{ marginTop: 8 }}>
          This is how the sections will look. Speakers show up on the real page from your Speakers list.
        </div>
      </div>
    </div>
  );
}
