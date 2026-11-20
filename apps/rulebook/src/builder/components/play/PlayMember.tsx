import { type Enhancement, entryLoadout, type ListEntry, type Unit } from '@rulebook/rules';

import { gearSummary } from '../../utils/gearSummary';
import CrownIcon from '../CrownIcon';
import UnitPhoto from '../photos/UnitPhoto';
import PlayStats from './PlayStats';

interface Props {
  faction: string;
  entry: ListEntry;
  unit: Unit;
  points: number;
  items: Enhancement[];
  warlord: boolean;
  /** Leader or Support, for an attached unit. */
  role?: string;
  /** Folded down to its name and cost. */
  collapsed?: boolean;
}

/** One unit on a play card: photo, name, role, points, stats and what it carries. */
export default function PlayMember({ faction, entry, unit, points, items, warlord, role, collapsed = false }: Props) {
  const tags = [role, ...items.map((i) => i.name)].filter(Boolean);

  const heading = (
    <span className="flex items-baseline justify-between gap-2">
      <span className="font-extrabold tracking-wide uppercase">
        {collapsed && warlord && (
          <span className="mr-1 text-warlord">
            <CrownIcon />
          </span>
        )}
        {entry.models > 1 && unit.composition.models.length === 1 && (
          <span className="text-text/70">{entry.models} × </span>
        )}
        {unit.name}
      </span>
      <span className="shrink-0 text-sm text-text/70">{points} pts</span>
    </span>
  );

  if (collapsed) return <span className="block px-3 py-2">{heading}</span>;

  return (
    <span className="flex gap-3 px-3 py-2">
      <UnitPhoto faction={faction} unit={unit.id} name={unit.name} size={48} readOnly />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        {heading}
        {(warlord || tags.length > 0) && (
          <span className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wide text-text/80 uppercase">
            {warlord && (
              <span className="rounded bg-warlord px-1.5 py-0.5 text-ink">
                <CrownIcon /> Warlord
              </span>
            )}
            {tags.join(' · ')}
          </span>
        )}
        <PlayStats profiles={unit.profiles} />
        <span className="block text-sm text-text/80">{gearSummary(unit, entryLoadout(unit, entry)).join(' · ')}</span>
      </span>
    </span>
  );
}
