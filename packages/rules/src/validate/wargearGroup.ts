import type { ListEntry, Unit, WargearOption } from '../types';
import { wargearAllowance } from './wargearAllowance';

/** The options in an option's group (just itself when it has none), and how many models the group allows together. */
export function wargearGroup(unit: Unit, entry: Pick<ListEntry, 'models' | 'counts'>, option: WargearOption) {
  const options = option.group ? unit.wargearOptions.filter((o) => o.group === option.group) : [option];

  return { options, allowed: Math.max(...options.map((o) => wargearAllowance(unit, entry, o))) };
}
