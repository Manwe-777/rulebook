import { type Unit, wargearName } from '@rulebook/rules';

import { ordinal } from './ordinal';

/**
 * Cost by unit size (`10 models: 65 pts`), the surcharge for later copies (`3rd+ in your army: +10 pts`), and wargear
 * that costs extra (`Flamer: +5 pts each`).
 */
export function pointsLines(unit: Unit): string[] {
  const { points, copies, itemPoints } = unit.composition;
  const sizes = points.map(({ models, points }) => `${models} model${models === 1 ? '' : 's'}: ${points} pts`);
  const surcharge = copies ? [`${ordinal(copies.from)}+ in your army: +${copies.points} pts`] : [];
  const items = Object.entries(itemPoints).map(([id, pts]) => `${wargearName(unit, id)}: +${pts} pts each`);

  return [...sizes, ...surcharge, ...items];
}
