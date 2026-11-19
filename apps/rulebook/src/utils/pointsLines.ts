import type { Unit } from '@rulebook/rules';

/** Cost by unit size: `10 models: 65 pts`. */
export function pointsLines(unit: Unit): string[] {
  return unit.composition.points.map(
    ({ models, points }) => `${models} model${models === 1 ? '' : 's'}: ${points} pts`,
  );
}
