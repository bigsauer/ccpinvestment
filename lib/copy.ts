export function pageText(blocks: Record<string, string>, key: string, fallback: string) {
  const value = blocks[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function asStringBlocks(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}
