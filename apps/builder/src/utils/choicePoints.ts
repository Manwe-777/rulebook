import type { Unit } from '@rulebook/rules';

/** What a wargear choice adds per model taking it, from the datasheet's prices for wargear that costs extra. */
export function choicePoints(unit: Unit, choice: string[]): number {
  return choice.reduce((sum, id) => sum + (unit.composition.itemPoints[id] ?? 0), 0);
}
