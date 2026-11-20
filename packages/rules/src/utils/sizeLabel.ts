import type { UnitSize } from './unitSizes';

/** A size in words: `10`, or its models by type when the datasheet names them (`3 Headtaker, 3 Hunting Wolf`). */
export function sizeLabel(size: UnitSize): string {
  if (!size.byType) return String(size.models);

  return size.counts
    .filter((c) => c.count > 0)
    .map((c) => `${c.count} ${c.type}`)
    .join(', ');
}
