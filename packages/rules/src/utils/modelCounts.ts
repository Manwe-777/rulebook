import type { Unit } from '../types';

/**
 * How many models of each type a unit of this size has: every type's minimum, then the rest given to the types that can
 * grow, in datasheet order, each up to its maximum.
 */
export function modelCounts(unit: Unit, size: number): { type: string; count: number }[] {
  const models = unit.composition.models;
  let left = size - models.reduce((sum, m) => sum + m.min, 0);

  return models.map((m) => {
    const extra = Math.max(0, Math.min(m.max - m.min, left));

    left -= extra;

    return { type: m.name, count: m.min + extra };
  });
}
