/** Folds or unfolds one unit card of an army; armies left with nothing folded are dropped. */
export function toggleCollapsed(
  stored: Record<string, string[]>,
  army: string,
  entry: string,
): Record<string, string[]> {
  const current = stored[army] ?? [];
  const next = current.includes(entry) ? current.filter((id) => id !== entry) : [...current, entry];
  const { [army]: _, ...others } = stored;

  return next.length ? { ...others, [army]: next } : others;
}
