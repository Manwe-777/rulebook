import type { Unit } from '@rulebook/rules';

/** One line per model type: `1 × Sergeant`, `9–19 × Trooper`. */
export function compositionLines(unit: Unit): string[] {
  return unit.composition.models.map(({ name, min, max }) => `${min === max ? min : `${min}–${max}`} × ${name}`);
}
