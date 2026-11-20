import { type Enhancement, entryLoadout, type ListEntry, type Unit } from '@rulebook/rules';

import { gearSummary } from '../../utils/gearSummary';
import UnitPhoto from '../photos/UnitPhoto';
import CompactStats from './CompactStats';

interface Props {
  faction: string;
  entry: ListEntry;
  unit: Unit;
  points: number;
  items: Enhancement[];
  warlord: boolean;
  /** Leader or Support, for an attached unit. */
  role?: string;
}

/** One unit on a play card: photo, name, role, points, stats and what it carries. */
export default function PlayMember({ faction, entry, unit, points, items, warlord, role }: Props) {
  const tags = [role, warlord && 'Warlord', ...items.map((i) => i.name)].filter(Boolean);

  return (
    <span className="flex gap-3 px-3 py-2">
      <UnitPhoto faction={faction} unit={unit.id} name={unit.name} size={48} readOnly />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-extrabold tracking-wide uppercase">
            {entry.models > 1 && unit.composition.models.length === 1 && (
              <span className="text-text/70">{entry.models} × </span>
            )}
            {unit.name}
          </span>
          <span className="shrink-0 text-sm text-text/70">{points} pts</span>
        </span>
        {tags.length > 0 && (
          <span className="block text-xs font-bold tracking-wide text-text/80 uppercase">{tags.join(' · ')}</span>
        )}
        <CompactStats profiles={unit.profiles} />
        <span className="block text-sm text-text/80">{gearSummary(unit, entryLoadout(unit, entry)).join(' · ')}</span>
      </span>
    </span>
  );
}
