import { applyWargear } from '../utils/applyWargear';
import { wargearName } from '../utils/wargearName';
import { issue } from './issue';
import type { Check } from './types';

/** Each swap finds enough models still carrying what it replaces, after the choices before it. */
export const checkSwaps: Check = (ctx) =>
  ctx.entries.flatMap(({ entry, unit }) =>
    applyWargear(unit, entry).shortfalls.map((s) => {
      const option = unit.wargearOptions.find((o) => o.id === s.option)!;
      const replaced = option.replace.map((id) => wargearName(unit, id)).join(' and ');

      return issue(
        'wargear-replace',
        `${unit.name}: ${s.missing} more models take ${s.choice.map((id) => wargearName(unit, id)).join(' and ')} than still carry ${replaced}.`,
        [entry.id],
      );
    }),
  );
