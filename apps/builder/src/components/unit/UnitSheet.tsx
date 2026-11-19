import type { Library, ListEntry } from '@rulebook/rules';
import { useState } from 'react';

import type { ArmyDraft } from '../../army/ArmyDraft';
import { combinedUnit } from '../../utils/combinedUnit';
import { BUTTON_QUIET } from '../styles';
import UnitPanel from './UnitPanel';

interface Props {
  draft: ArmyDraft;
  library: Library;
  entryId: string;
  points: Record<string, number>;
  onClose: () => void;
}

/**
 * The play view of a unit: the unit as built, with the leaders and support units attached to it, showing only the
 * weapons and wargear rules it has unless "show all" is on.
 */
export default function UnitSheet({ draft, library, entryId, points, onClose }: Props) {
  const [showAll, setShowAll] = useState(false);
  const group = combinedUnit(draft.list, entryId);
  const unitOf = (e: ListEntry) => library.unit(draft.list.faction, e.unit)?.unit;

  if (!group) return null;

  const members = [group.bodyguard, ...group.attached];
  const total = members.reduce((sum, e) => sum + (points[e.id] ?? 0), 0);

  const panel = (entry: ListEntry, role?: string) => {
    const unit = unitOf(entry);

    return unit ? (
      <UnitPanel
        key={entry.id}
        library={library}
        list={draft.list}
        entry={entry}
        unit={unit}
        showAll={showAll}
        role={role}
      />
    ) : null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className={BUTTON_QUIET} onClick={onClose}>
          ← {draft.list.name}
        </button>
        <span className="font-bold">
          {group.attached.length ? 'Combined unit · ' : ''}
          {total} pts
        </span>
        <label className="flex items-center gap-2 font-semibold">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Show all wargear
        </label>
      </div>
      {panel(group.bodyguard)}
      {group.attached.length > 0 && <h2 className="text-xl font-extrabold uppercase">Attached units</h2>}
      {group.attached.map((e) => panel(e, unitOf(e)?.leader ? 'Leader' : 'Support'))}
    </div>
  );
}
