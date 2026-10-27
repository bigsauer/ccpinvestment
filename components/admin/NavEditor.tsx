"use client";

import { useMemo, useState } from "react";
import { useCanWrite } from "@/components/admin/WriteGate";
import { MAX_NAV_ITEMS } from "@/lib/nav";

type Item = { label: string; href: string; visible: boolean };
type Option = { href: string; label: string; group: string };

const CUSTOM = "__custom";

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/** Edit the site menu: rename, reorder, hide, add pages or outside links. Posts the list as JSON in a hidden field. */
export function NavEditor({ initial, options }: { initial: Item[]; options: Option[] }) {
  const writable = useCanWrite();
  const [items, setItems] = useState<Item[]>(initial);
  const json = useMemo(() => JSON.stringify(items), [items]);
  const set = (i: number, patch: Partial<Item>) => setItems((list) => list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const known = new Set(options.map((o) => o.href));
  const groups = [...new Set(options.map((o) => o.group))];

  return (
    <div>
      <input type="hidden" name="items" value={json} />
      <div className="nav-editor">
        {items.map((item, i) => {
          const isCustom = !known.has(item.href);
          return (
            <div key={i} className={item.visible ? "ne-row" : "ne-row is-hidden"}>
              <span className="story-n">{i + 1}</span>
              <input value={item.label} maxLength={30} aria-label="Menu text" placeholder="Menu text" onChange={(e) => set(i, { label: e.target.value })} disabled={!writable} />
              <div className="ne-dest">
                <select
                  aria-label="Goes to"
                  value={isCustom ? CUSTOM : item.href}
                  disabled={!writable}
                  onChange={(e) => {
                    if (e.target.value === CUSTOM) set(i, { href: "https://" });
                    else {
                      const opt = options.find((o) => o.href === e.target.value);
                      set(i, { href: e.target.value, label: item.label || opt?.label || "" });
                    }
                  }}
                >
                  {groups.map((group) => (
                    <optgroup key={group} label={group}>
                      {options
                        .filter((o) => o.group === group)
                        .map((o) => (
                          <option key={o.href} value={o.href}>
                            {o.label}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                  <option value={CUSTOM}>Another web address…</option>
                </select>
                {isCustom ? <input value={item.href} aria-label="Web address" placeholder="https://…" onChange={(e) => set(i, { href: e.target.value })} disabled={!writable} /> : null}
              </div>
              <label className="ne-show">
                <input type="checkbox" checked={item.visible} disabled={!writable} onChange={(e) => set(i, { visible: e.target.checked })} /> Show
              </label>
              <div className="ne-tools">
                <button type="button" className="btn" disabled={!writable || i === 0} onClick={() => setItems((l) => move(l, i, i - 1))} aria-label="Move up">↑</button>
                <button type="button" className="btn" disabled={!writable || i === items.length - 1} onClick={() => setItems((l) => move(l, i, i + 1))} aria-label="Move down">↓</button>
                <button type="button" className="btn danger" disabled={!writable} onClick={() => setItems((l) => l.filter((_, idx) => idx !== i))} aria-label="Remove">✕</button>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="btn"
        style={{ marginTop: 10 }}
        disabled={!writable || items.length >= MAX_NAV_ITEMS}
        onClick={() => setItems((l) => [...l, { label: "New link", href: "/", visible: true }])}
      >
        + Add a menu link
      </button>
      <div className="field-help" style={{ marginTop: 8 }}>
        Up to {MAX_NAV_ITEMS} links. The menu at the top and the footer both use this list. The red “Apply” button is separate and always stays.
      </div>
    </div>
  );
}
