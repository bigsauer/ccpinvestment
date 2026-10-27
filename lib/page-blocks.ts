/**
 * The building blocks officers can put on a page (see /admin/pages).
 *
 * One definition drives three things: the editor's fields, the cleanup that runs on every save,
 * and the public renderer (components/public/PageBlocks.tsx). To add a block type: add it here,
 * then add a renderer case there. Nothing else needs to change.
 */

export type FieldKind = "text" | "textarea" | "url" | "image" | "select" | "number";

export type FieldDef = {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
};

export type ListDef = {
  key: string;
  label: string;
  itemLabel: string;
  max: number;
  fields: FieldDef[];
};

export type BlockType =
  | "hero"
  | "heading"
  | "text"
  | "image"
  | "imageText"
  | "button"
  | "callout"
  | "cards"
  | "faq"
  | "stats"
  | "quote"
  | "video"
  | "speakers"
  | "divider"
  | "spacer";

export type BlockDef = {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  fields: FieldDef[];
  list?: ListDef;
  defaults: Record<string, unknown>;
};

export type Block = { id: string; type: BlockType } & Record<string, unknown>;

const SIDE = [
  { value: "left", label: "Photo on the left" },
  { value: "right", label: "Photo on the right" },
];
const ALIGN = [
  { value: "left", label: "Left" },
  { value: "center", label: "Centered" },
];

export const BLOCK_DEFS: BlockDef[] = [
  {
    type: "hero",
    label: "Big photo banner",
    description: "A full-width photo with a headline and a button.",
    icon: "▣",
    fields: [
      { key: "eyebrow", label: "Small line above", kind: "text", placeholder: "FALL 2026" },
      { key: "title", label: "Headline", kind: "text" },
      { key: "text", label: "Short paragraph", kind: "textarea" },
      { key: "image", label: "Photo", kind: "image" },
      { key: "buttonLabel", label: "Button text", kind: "text", placeholder: "Learn more" },
      { key: "buttonHref", label: "Button goes to", kind: "url", placeholder: "/get-involved" },
    ],
    defaults: { eyebrow: "", title: "A big headline", text: "", image: "", buttonLabel: "", buttonHref: "" },
  },
  {
    type: "heading",
    label: "Heading",
    description: "A section title.",
    icon: "H",
    fields: [
      { key: "text", label: "Heading", kind: "text" },
      { key: "level", label: "Size", kind: "select", options: [{ value: "2", label: "Large" }, { value: "3", label: "Medium" }] },
      { key: "align", label: "Alignment", kind: "select", options: ALIGN },
    ],
    defaults: { text: "A heading", level: "2", align: "left" },
  },
  {
    type: "text",
    label: "Text",
    description: "Paragraphs, bullet lists, bold, italic and links.",
    icon: "¶",
    fields: [
      {
        key: "body",
        label: "Text",
        kind: "textarea",
        help: "Leave a blank line between paragraphs. Start a line with “- ” for a bullet. Use **bold**, *italic* and [link text](https://example.com).",
      },
      { key: "align", label: "Alignment", kind: "select", options: ALIGN },
    ],
    defaults: { body: "Write something here.", align: "left" },
  },
  {
    type: "image",
    label: "Photo",
    description: "One photo with an optional caption.",
    icon: "▤",
    fields: [
      { key: "src", label: "Photo", kind: "image" },
      { key: "alt", label: "Describe the photo", kind: "text", help: "For screen readers and search." },
      { key: "caption", label: "Caption (optional)", kind: "text" },
      {
        key: "size",
        label: "Size",
        kind: "select",
        options: [
          { value: "wide", label: "Wide" },
          { value: "narrow", label: "Narrow" },
          { value: "full", label: "Full width" },
        ],
      },
    ],
    defaults: { src: "", alt: "", caption: "", size: "wide" },
  },
  {
    type: "imageText",
    label: "Photo and text",
    description: "A photo beside a heading, paragraph and optional button.",
    icon: "◫",
    fields: [
      { key: "image", label: "Photo", kind: "image" },
      { key: "alt", label: "Describe the photo", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "body", label: "Text", kind: "textarea" },
      { key: "side", label: "Layout", kind: "select", options: SIDE },
      { key: "buttonLabel", label: "Button text (optional)", kind: "text" },
      { key: "buttonHref", label: "Button goes to", kind: "url" },
    ],
    defaults: { image: "", alt: "", heading: "A heading", body: "A few sentences.", side: "left", buttonLabel: "", buttonHref: "" },
  },
  {
    type: "button",
    label: "Button",
    description: "A single link styled as a button.",
    icon: "◉",
    fields: [
      { key: "label", label: "Button text", kind: "text" },
      { key: "href", label: "Goes to", kind: "url", placeholder: "/get-involved?tab=students" },
      { key: "style", label: "Style", kind: "select", options: [{ value: "red", label: "Red" }, { value: "outline", label: "Outline" }] },
      { key: "align", label: "Alignment", kind: "select", options: ALIGN },
    ],
    defaults: { label: "Apply to join", href: "/get-involved?tab=students", style: "red", align: "left" },
  },
  {
    type: "callout",
    label: "Call-to-action band",
    description: "A bold red band with a message and a button.",
    icon: "▬",
    fields: [
      { key: "heading", label: "Headline", kind: "text" },
      { key: "body", label: "Text", kind: "textarea" },
      { key: "buttonLabel", label: "Button text", kind: "text" },
      { key: "buttonHref", label: "Button goes to", kind: "url" },
    ],
    defaults: { heading: "Join us for the next session.", body: "", buttonLabel: "Apply", buttonHref: "/get-involved?tab=students" },
  },
  {
    type: "cards",
    label: "Cards",
    description: "A grid of short cards, each with an optional photo and link.",
    icon: "▦",
    fields: [
      { key: "heading", label: "Section heading (optional)", kind: "text" },
      {
        key: "columns",
        label: "Cards per row",
        kind: "select",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
        ],
      },
    ],
    list: {
      key: "items",
      label: "Cards",
      itemLabel: "Card",
      max: 12,
      fields: [
        { key: "image", label: "Photo (optional)", kind: "image" },
        { key: "title", label: "Title", kind: "text" },
        { key: "text", label: "Text", kind: "textarea" },
        { key: "href", label: "Link (optional)", kind: "url" },
      ],
    },
    defaults: { heading: "", columns: "3", items: [{ image: "", title: "First card", text: "A sentence or two.", href: "" }] },
  },
  {
    type: "faq",
    label: "Questions and answers",
    description: "Click-to-open questions.",
    icon: "?",
    fields: [{ key: "heading", label: "Section heading (optional)", kind: "text" }],
    list: {
      key: "items",
      label: "Questions",
      itemLabel: "Question",
      max: 20,
      fields: [
        { key: "q", label: "Question", kind: "text" },
        { key: "a", label: "Answer", kind: "textarea" },
      ],
    },
    defaults: { heading: "Questions", items: [{ q: "A question?", a: "The answer." }] },
  },
  {
    type: "stats",
    label: "Numbers",
    description: "Big counting-up numbers with labels.",
    icon: "№",
    fields: [],
    list: {
      key: "items",
      label: "Numbers",
      itemLabel: "Number",
      max: 6,
      fields: [
        { key: "value", label: "Number (e.g. 60+)", kind: "text" },
        { key: "label", label: "Label", kind: "text" },
      ],
    },
    defaults: { items: [{ value: "60+", label: "Members" }, { value: "12+", label: "Guest speakers" }] },
  },
  {
    type: "quote",
    label: "Quote",
    description: "A highlighted quotation.",
    icon: "“",
    fields: [
      { key: "text", label: "Quote", kind: "textarea" },
      { key: "by", label: "Who said it", kind: "text" },
    ],
    defaults: { text: "A memorable line.", by: "" },
  },
  {
    type: "video",
    label: "Video",
    description: "A YouTube or Vimeo video.",
    icon: "▶",
    fields: [
      { key: "url", label: "YouTube or Vimeo link", kind: "url", placeholder: "https://www.youtube.com/watch?v=…" },
      { key: "caption", label: "Caption (optional)", kind: "text" },
    ],
    defaults: { url: "", caption: "" },
  },
  {
    type: "speakers",
    label: "Speakers",
    description: "Shows speakers from the Speakers list, always up to date.",
    icon: "☺",
    fields: [
      { key: "heading", label: "Section heading (optional)", kind: "text" },
      {
        key: "which",
        label: "Which speakers",
        kind: "select",
        options: [
          { value: "upcoming", label: "Upcoming" },
          { value: "past", label: "Past" },
          { value: "all", label: "All" },
        ],
      },
      { key: "limit", label: "How many (most recent first)", kind: "number", min: 1, max: 24 },
    ],
    defaults: { heading: "Our speakers", which: "all", limit: 6 },
  },
  {
    type: "divider",
    label: "Divider line",
    description: "A thin line between sections.",
    icon: "—",
    fields: [],
    defaults: {},
  },
  {
    type: "spacer",
    label: "Space",
    description: "Empty room between sections.",
    icon: "↕",
    fields: [
      {
        key: "size",
        label: "Amount",
        kind: "select",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
    ],
    defaults: { size: "medium" },
  },
];

export function blockDef(type: string) {
  return BLOCK_DEFS.find((d) => d.type === type) ?? null;
}

/* ───────────── Cleaning what gets saved ───────────── */

const MAX_BLOCKS = 60;

/** Links may point inside the site, to an anchor, to http(s), email or phone. Anything else is dropped. */
export function cleanHref(raw: unknown): string {
  const value = typeof raw === "string" ? raw.trim().slice(0, 500) : "";
  if (!value) return "";
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  if (value.startsWith("#")) return value;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  return "";
}

/** Photos must be ones uploaded through the admin (or shipped with the site), never someone else's address. */
export function cleanImagePath(raw: unknown): string {
  const value = typeof raw === "string" ? raw.trim().slice(0, 300) : "";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("..") || value.includes("\\")) return "";
  return value;
}

/** A YouTube or Vimeo watch link -> the privacy-friendly embed address. Anything else -> null. */
export function videoEmbedUrl(raw: unknown): string | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  const yt = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i.exec(value);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = /^https?:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d{6,12})/i.exec(value);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function cleanField(field: FieldDef, raw: unknown): string | number {
  if (field.kind === "number") {
    const n = Math.round(Number(raw));
    const min = field.min ?? 0;
    const max = field.max ?? 100;
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
  }
  if (field.kind === "image") return cleanImagePath(raw);
  if (field.kind === "url") return cleanHref(raw);
  if (field.kind === "select") {
    const value = typeof raw === "string" ? raw : String(raw ?? "");
    return field.options?.some((o) => o.value === value) ? value : (field.options?.[0]?.value ?? "");
  }
  const value = typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
  return value.slice(0, field.kind === "textarea" ? 4000 : 300);
}

function cleanFields(fields: FieldDef[], source: Record<string, unknown>) {
  const out: Record<string, string | number> = {};
  for (const field of fields) out[field.key] = cleanField(field, source[field.key]);
  return out;
}

/** Turns anything the browser sent into a safe, known-shape list of blocks. */
export function sanitizeBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];
  const blocks: Block[] = [];
  for (const entry of raw.slice(0, MAX_BLOCKS)) {
    if (!entry || typeof entry !== "object") continue;
    const source = entry as Record<string, unknown>;
    const def = blockDef(String(source.type ?? ""));
    if (!def) continue;
    const block: Block = {
      id: typeof source.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(source.id) ? source.id : `b${blocks.length}${Math.random().toString(36).slice(2, 8)}`,
      type: def.type,
      ...cleanFields(def.fields, source),
    };
    if (def.list) {
      const items = Array.isArray(source[def.list.key]) ? (source[def.list.key] as unknown[]) : [];
      block[def.list.key] = items
        .slice(0, def.list.max)
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => cleanFields(def.list!.fields, item))
        // An item with nothing in it is just noise.
        .filter((item) => Object.values(item).some((v) => v !== "" && v !== 0));
    }
    blocks.push(block);
  }
  return blocks;
}

export function newBlock(type: BlockType): Block {
  const def = blockDef(type)!;
  return { id: `b${Math.random().toString(36).slice(2, 10)}`, type, ...structuredClone(def.defaults) } as Block;
}

/* ───────────── Page addresses ───────────── */

/** Addresses the site already uses (or that browsers and search engines expect). */
export const RESERVED_SLUGS = new Set([
  "admin", "api", "meetings", "speakers", "team", "get-involved", "sitemap", "sitemap.xml", "robots", "robots.txt",
  "manifest", "manifest.webmanifest", "favicon", "favicon.ico", "icon", "apple-icon", "opengraph-image", "twitter-image",
  "brand", "photos", "members", "_next", "static", "public", "home", "index", "login", "logout", "apply", "join",
]);

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function checkSlug(slug: string) {
  if (!/^[a-z0-9][a-z0-9-]{0,59}$/.test(slug)) return "The address can use only lowercase letters, numbers and dashes.";
  if (RESERVED_SLUGS.has(slug)) return `“${slug}” is already used by the site. Pick a different address.`;
  return null;
}
