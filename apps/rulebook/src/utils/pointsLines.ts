import type { Unit } from '@rulebook/rules';

import { ordinal } from './ordinal';

/** Cost by unit size (`10 models: 65 pts`), then the surcharge for later copies (`3rd+ in your army: +10 pts`). */
export function pointsLines(unit: Unit): string[] {
  const { points, copies } = unit.composition;
  const sizes = points.map(({ models, points }) => `${models} model${models === 1 ? '' : 's'}: ${points} pts`);

  return copies ? [...sizes, `${ordinal(copies.from)}+ in your army: +${copies.points} pts`] : sizes;
}
