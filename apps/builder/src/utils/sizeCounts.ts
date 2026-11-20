import type { UnitSize } from '@rulebook/rules';

/** The model counts a list entry records for a size: only when the datasheet names them. */
export function sizeCounts(size: UnitSize): Record<string, number> | undefined {
  return size.byType ? Object.fromEntries(size.counts.map((c) => [c.type, c.count])) : undefined;
}
