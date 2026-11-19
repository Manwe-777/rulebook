import type { Unit, WargearOption } from '../types';

/** How many models of a unit of this size can be of the option's model type. */
function modelsOfType(unit: Unit, size: number, type: string | undefined): number {
  if (!type) return size;

  const model = unit.composition.models.find((m) => m.name === type);

  if (!model) return 0;
  if (model.min === model.max) return model.max;

  const others = unit.composition.models.filter((m) => m !== model).reduce((sum, m) => sum + m.min, 0);

  return Math.min(model.max, size - others);
}

/** The most models of a unit of this size that can take a wargear option. */
export function wargearAllowance(unit: Unit, size: number, option: WargearOption): number {
  const eligible = modelsOfType(unit, size, option.models);

  if (option.per === 'all') return eligible;
  if (typeof option.per === 'number') return Math.min(option.per, eligible);

  return Math.min(Math.floor(size / option.per.every), eligible);
}
