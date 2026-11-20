import type { Unit } from '../types';
import { modelCounts } from './modelCounts';

/** One size a unit can be taken at, with how many models of each type it has. */
export interface UnitSize {
  models: number;
  points: number;
  counts: { type: string; count: number }[];
  /** Whether the datasheet names the model types of this size (another size may have as many models). */
  byType: boolean;
}

/** Every size a unit can be taken at, in datasheet order. */
export function unitSizes(unit: Unit): UnitSize[] {
  return unit.composition.points.map(({ models, points, counts }) => ({
    models,
    points,
    counts: counts
      ? unit.composition.models.map((m) => ({ type: m.name, count: counts[m.name] ?? 0 }))
      : modelCounts(unit, models),
    byType: counts !== undefined,
  }));
}
