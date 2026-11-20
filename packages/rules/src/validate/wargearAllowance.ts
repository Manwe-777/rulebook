import type { ListEntry, Unit, WargearOption } from '../types';
import { entrySize } from '../utils/entrySize';

/** How many models of a unit of this size can be of the option's model type. */
function modelsOfType(unit: Unit, size: number, type: string | undefined): number {
  if (!type) return size;

  const model = unit.composition.models.find((m) => m.name === type);

  if (!model) return 0;
  if (model.min === model.max) return model.max;

  const others = unit.composition.models.filter((m) => m !== model).reduce((sum, m) => sum + m.min, 0);

  return Math.min(model.max, size - others);
}

/**
 * How many models of the option's type an entry can have: exactly those of its size when the datasheet names them,
 * otherwise as many as a unit of its size could have.
 */
function eligibleModels(unit: Unit, entry: Pick<ListEntry, 'models' | 'counts'>, type: string | undefined): number {
  const size = entrySize(unit, entry);

  if (!type || !size?.byType) return modelsOfType(unit, entry.models, type);

  return size.counts.find((c) => c.type === type)?.count ?? 0;
}

/** The most models of a list entry that can take a wargear option. */
export function wargearAllowance(
  unit: Unit,
  entry: Pick<ListEntry, 'models' | 'counts'>,
  option: WargearOption,
): number {
  const size = entry.models;
  const eligible = eligibleModels(unit, entry, option.models);

  if (option.per === 'all') return eligible;
  if (typeof option.per === 'number') return Math.min(option.per, eligible);

  return Math.min(Math.floor(size / option.per.every) * option.per.count, eligible);
}
