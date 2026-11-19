import { findEnhancement } from './findEnhancement';
import type { Resolved, ValidationContext } from './types';

/** What one list entry costs: its unit size, paid wargear, and its enhancement or upgrade. */
export function entryPoints(ctx: ValidationContext, { entry, unit }: Resolved): number {
  const size = unit.composition.points.find((p) => p.models === entry.models)?.points ?? 0;

  const wargear = entry.wargear.reduce((sum, w) => {
    const option = unit.wargearOptions.find((o) => o.id === w.option);

    return sum + (option ? option.points * w.models : 0);
  }, 0);

  const items = [entry.enhancement, entry.upgrade].reduce(
    (sum, id) => sum + (id ? (findEnhancement(ctx, id)?.points ?? 0) : 0),
    0,
  );

  return size + wargear + items;
}
