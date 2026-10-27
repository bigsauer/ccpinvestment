// Prints SQL that stores the club's own pages (home, meetings, ...) as editable pages in the database.
// Safe to re-run: existing rows are left alone. Usage: npx tsx scripts/print-system-seed.ts
import { SYSTEM_PAGES } from "../lib/default-pages";

const q = (text: string) => `$q$${text}$q$`;
const lines = SYSTEM_PAGES.map(
  (page) =>
    `insert into "CustomPage" (id, slug, title, description, blocks, status, "updatedBy", "updatedAt")\n` +
    `values ('system-${page.slug}', '${page.slug}', ${q(page.title)}, ${q(page.description)}, ${q(JSON.stringify(page.blocks))}::jsonb, 'LIVE', 'Original design', now())\n` +
    `on conflict (slug) do nothing;`,
);
console.log(lines.join("\n"));
