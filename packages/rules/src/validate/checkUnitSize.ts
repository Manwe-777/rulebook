import { issue } from './issue';
import type { Check } from './types';

/** Each entry has one of its unit's sizes. */
export const checkUnitSize: Check = (ctx) =>
  ctx.entries.flatMap(({ entry, unit }) => {
    const sizes = unit.composition.points.map((p) => p.models);

    if (sizes.includes(entry.models)) return [];

    return [
      issue('unit-size', `${unit.name} has ${entry.models} models; it can have ${sizes.join(' or ')}.`, [entry.id]),
    ];
  });
