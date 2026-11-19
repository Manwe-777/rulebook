/** Each distinct id with how often it appears, in order of first appearance: `[a, b, a]` → `a ×2, b ×1`. */
export function tally(ids: string[]): { id: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);

  return [...counts].map(([id, count]) => ({ id, count }));
}
