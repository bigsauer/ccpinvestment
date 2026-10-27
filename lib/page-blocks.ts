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
  | "spacer"
  // Site sections: the building blocks the built-in pages are made of.
  | "pageBanner"
  | "homeHero"
  | "logoBand"
  | "homeStats"
  | "featureGrid"
  | "pitch"
  | "ctaBand"
  | "teamPeople"
  | "meetingsSchedule"
  | "speakerArchive"
  | "joinForms";

export type BlockDef = {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  fields: FieldDef[];
  list?: ListDef;
  defaults: Record<string, unknown>;
  /** Part of how the club's own pages are built. Shown under "Site sections" in the picker. */
  site?: boolean;
  /** Pulls live data (meetings, speakers, people), so the editor preview shows a placeholder. */
  dynamic?: boolean;
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

  /* ───── Site sections ───── */
  {
    type: "pageBanner",
    label: "Page title banner",
    description: "The big title at the top of a page, over a photo.",
    icon: "▭",
    site: true,
    fields: [
      { key: "crumbs", label: "Small line above the title", kind: "text", help: "Type {season} to show the current season label." },
      { key: "headline", label: "Title", kind: "text", help: "Put *stars* around the words you want in italics." },
      { key: "lede", label: "Intro paragraph", kind: "textarea" },
      { key: "caption", label: "Small caption, bottom right (optional)", kind: "text" },
      {
        key: "imageSlot",
        label: "Photo",
        kind: "select",
        help: "These photos are changed under Site images. Choose “Plain” for no photo, or upload one below.",
        options: [
          { value: "", label: "Plain (no photo)" },
          { value: "meetings-banner", label: "Meetings banner photo" },
          { value: "speakers-banner", label: "Speakers banner photo" },
          { value: "team-banner", label: "Team banner photo" },
        ],
      },
      { key: "image", label: "Or use a different photo", kind: "image" },
    ],
    defaults: { crumbs: "", headline: "A page title", lede: "", caption: "", imageSlot: "", image: "" },
  },
  {
    type: "homeHero",
    label: "Home page opening",
    description: "The large photo, headline and buttons that open the home page.",
    icon: "◩",
    site: true,
    fields: [
      { key: "headline", label: "Headline", kind: "textarea", help: "A new line starts a new row. *Stars* make italic words; **double stars** make red words." },
      { key: "lede", label: "Intro paragraph", kind: "textarea" },
      { key: "primaryLabel", label: "First button text", kind: "text" },
      { key: "primaryHref", label: "First button goes to", kind: "url" },
      { key: "secondaryLabel", label: "Second button text", kind: "text" },
      { key: "secondaryHref", label: "Second button goes to", kind: "url" },
    ],
    defaults: {
      headline: "Where the next generation\nof *investors* **meets the market.**",
      lede: "A student-run club at Chaminade College Preparatory School bringing working professionals — portfolio managers, bankers, founders — into the room with students who are serious about finance.",
      primaryLabel: "Apply to join",
      primaryHref: "/get-involved?tab=students",
      secondaryLabel: "View schedule",
      secondaryHref: "/meetings",
    },
  },
  {
    type: "logoBand",
    label: "Club and school logos",
    description: "The strip with the club badge and the school seal.",
    icon: "◎",
    site: true,
    fields: [],
    defaults: {},
  },
  {
    type: "homeStats",
    label: "Club numbers (home page)",
    description: "Members, speakers, sessions and year founded, counting up. The numbers are set in Settings.",
    icon: "№",
    site: true,
    fields: [],
    defaults: {},
  },
  {
    type: "featureGrid",
    label: "Headline with three points",
    description: "A section heading and intro with a row of numbered points.",
    icon: "▦",
    site: true,
    fields: [
      { key: "label", label: "Small label", kind: "text" },
      { key: "heading", label: "Heading", kind: "text", help: "Put *stars* around italic words." },
      { key: "intro", label: "Intro paragraph", kind: "textarea" },
    ],
    list: {
      key: "items",
      label: "Points",
      itemLabel: "Point",
      max: 6,
      fields: [
        { key: "num", label: "Small label (e.g. 01 / GUESTS)", kind: "text" },
        { key: "title", label: "Title", kind: "text" },
        { key: "text", label: "Text", kind: "textarea" },
      ],
    },
    defaults: {
      label: "What we do",
      heading: "Not a finance class.\n*A working room.*",
      intro: "Every session runs like a real meeting: a guest speaker, a prepared discussion, student-led market commentary, and a mock portfolio members pitch into and track.",
      items: [
        { num: "01 / GUESTS", title: "Real professionals.", text: "Portfolio managers, analysts, founders, and bankers walk members through how decisions actually get made." },
        { num: "02 / PORTFOLIO", title: "A book you run.", text: "Members pitch ideas into a paper portfolio, defend them, and track performance against the benchmark." },
        { num: "03 / NETWORK", title: "People who return calls.", text: "Chaminade alumni work across every major bank, fund, and consulting firm. The club is the fastest way in." },
      ],
    },
  },
  {
    type: "pitch",
    label: "Photo with message and button",
    description: "A framed photo beside a heading, two paragraphs and a button (home page style).",
    icon: "◫",
    site: true,
    fields: [
      { key: "label", label: "Small label", kind: "text" },
      { key: "heading", label: "Heading", kind: "text", help: "Put *stars* around italic words." },
      { key: "body1", label: "First paragraph", kind: "textarea" },
      { key: "body2", label: "Second paragraph", kind: "textarea" },
      { key: "buttonLabel", label: "Button text", kind: "text" },
      { key: "buttonHref", label: "Button goes to", kind: "url" },
    ],
    defaults: {
      label: "Inside the club",
      heading: "Run by students, *built for real work.*",
      body1: "Members share the work of outreach, programming, and the portfolio. Everyone comes prepared — with reading done, questions ready, and pitches that can be defended.",
      body2: "No busywork. The goal is reps: the kind of reps that make it obvious, five years from now, who took this seriously in high school.",
      buttonLabel: "Meet the team",
      buttonHref: "/team",
    },
  },
  {
    type: "ctaBand",
    label: "Closing call to action",
    description: "The band near the bottom of a page with two buttons.",
    icon: "▬",
    site: true,
    fields: [
      { key: "heading", label: "Headline", kind: "text" },
      { key: "primaryLabel", label: "First button text", kind: "text" },
      { key: "primaryHref", label: "First button goes to", kind: "url" },
      { key: "secondaryLabel", label: "Second button text", kind: "text" },
      { key: "secondaryHref", label: "Second button goes to", kind: "url" },
    ],
    defaults: {
      heading: "Join us for the next session.",
      primaryLabel: "Apply",
      primaryHref: "/get-involved?tab=students",
      secondaryLabel: "See schedule",
      secondaryHref: "/meetings",
    },
  },
  {
    type: "teamPeople",
    label: "People: officers, members, advisor",
    description: "Officers, members with photos and the faculty advisor, with the three values underneath. People come from the admin.",
    icon: "☺",
    site: true,
    dynamic: true,
    fields: [
      { key: "label", label: "Small label", kind: "text" },
      { key: "heading", label: "Heading", kind: "text", help: "Put *stars* around italic words." },
      { key: "intro", label: "Intro paragraph", kind: "textarea" },
    ],
    list: {
      key: "values",
      label: "Values (shown under the people)",
      itemLabel: "Value",
      max: 6,
      fields: [
        { key: "k", label: "Small label (e.g. 01 / CULTURE)", kind: "text" },
        { key: "title", label: "Title", kind: "text" },
        { key: "text", label: "Text", kind: "textarea" },
      ],
    },
    defaults: {
      label: "The team",
      heading: "The people *behind it.*",
      intro: "Student-run end to end. The work is shared, with a faculty advisor behind us.",
      values: [
        { k: "01 / CULTURE", title: "Preparation matters.", text: "Members show up having read the brief, with questions. Guests notice." },
        { k: "02 / OWNERSHIP", title: "Members do the work.", text: "Every event, contact, and meeting agenda is owned by students working together. No hand-holding." },
        { k: "03 / STANDARD", title: "Professional bar.", text: "What's good enough for finance professionals is what's good enough for us." },
      ],
    },
  },
  {
    type: "meetingsSchedule",
    label: "Meetings: next session, schedule and past sessions",
    description: "The whole meetings body. Everything comes from the Meetings and Speakers sections.",
    icon: "▤",
    site: true,
    dynamic: true,
    fields: [],
    defaults: {},
  },
  {
    type: "speakerArchive",
    label: "Speakers: archive with filters",
    description: "Every speaker, with filters, profile pop-ups and career stories. Comes from the Speakers section.",
    icon: "☰",
    site: true,
    dynamic: true,
    fields: [],
    defaults: {},
  },
  {
    type: "joinForms",
    label: "Join and speak forms",
    description: "The two doors and their application forms.",
    icon: "✎",
    site: true,
    dynamic: true,
    fields: [],
    defaults: {},
  },
];

/** Types that bring their own full-width layout, so they are not wrapped like ordinary content blocks. */
export const SITE_SECTION_TYPES = new Set<string>(BLOCK_DEFS.filter((d) => d.site).map((d) => d.type));
export const DYNAMIC_SECTION_TYPES = new Set<string>(BLOCK_DEFS.filter((d) => d.dynamic).map((d) => d.type));

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
