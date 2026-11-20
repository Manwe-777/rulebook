import type { Condition } from '../types';
import { selectEntries } from './selectEntries';
import type { ValidationContext } from './types';

/** Whether every field of a condition holds for this army: detachment chosen, battle size, faction, a selected entry. */
export function conditionHolds(ctx: ValidationContext, condition: Condition): boolean {
  return (
    (!condition.detachment || ctx.detachments.some((d) => d.id === condition.detachment)) &&
    (!condition.battleSize || ctx.battleSize.id === condition.battleSize) &&
    (!condition.faction || ctx.faction.id === condition.faction) &&
    (!condition.has || selectEntries(ctx, condition.has).length > 0)
  );
}
