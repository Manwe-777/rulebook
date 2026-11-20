import type { ListEntry, Unit, WargearOption } from '../types';
import { wargearAllowance } from './wargearAllowance';
import { wargearGroup } from './wargearGroup';

type Entry = Pick<ListEntry, 'models' | 'counts' | 'wargear'>;

const taken = (entry: Entry, options: WargearOption[]) =>
  entry.wargear.filter((w) => options.some((o) => o.id === w.option)).reduce((sum, w) => sum + w.models, 0);

/** How many more models of a list entry can take a wargear option, within its own limit and its group's. */
export function wargearRoom(unit: Unit, entry: Entry, option: WargearOption): number {
  const group = wargearGroup(unit, entry, option);
  const own = wargearAllowance(unit, entry, option) - taken(entry, [option]);

  return Math.max(0, Math.min(own, group.allowed - taken(entry, group.options)));
}
