import { entryLoadout } from '../utils/entryLoadout';
import { findEnhancement } from './findEnhancement';
import type { Resolved, ValidationContext } from './types';

/**
 * What one list entry costs: its unit size (plus the datasheet's surcharge when it is a later copy), paid wargear
 * options, wargear that costs extra for each one carried, and its enhancement or upgrade.
 */
export function entryPoints(ctx: ValidationContext, { entry, unit, copy }: Resolved): number {
  const { points, copies } = unit.composition;
  const surcharge = copies && copy >= copies.from ? copies.points : 0;
  const size = (points.find((p) => p.models === entry.models)?.points ?? 0) + surcharge;

  const wargear = entry.wargear.reduce((sum, w) => {
    const option = unit.wargearOptions.find((o) => o.id === w.option);

    return sum + (option ? option.points * w.models : 0);
  }, 0);

  const carried = entryLoadout(unit, entry)
    .flatMap((l) => l.items)
    .reduce((sum, item) => sum + (unit.composition.itemPoints[item.id] ?? 0) * item.count, 0);

  const items = [entry.enhancement, entry.upgrade].reduce(
    (sum, id) => sum + (id ? (findEnhancement(ctx, id)?.points ?? 0) : 0),
    0,
  );

  return size + wargear + carried + items;
}
