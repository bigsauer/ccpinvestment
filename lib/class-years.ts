/** The class years offered on the join form: first to last, inclusive. */
export function classYearList(from: number, to: number): string[] {
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  return Array.from({ length: Math.min(end - start + 1, 20) }, (_, i) => String(start + i));
}
