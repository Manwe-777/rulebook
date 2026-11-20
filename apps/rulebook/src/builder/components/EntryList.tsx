import { grantedUnits, groupEntries, type Issue, type Library, type ListEntry } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import CombinedUnit from './CombinedUnit';
import EntryCard from './EntryCard';

interface Props {
  draft: ArmyDraft;
  library: Library;
  points: Record<string, number>;
  issues: Issue[];
  /** Cards folded down to their title. */
  collapsed: ReadonlySet<string>;
  onToggle: (entry: string) => void;
  onChange: (draft: ArmyDraft) => void;
}

/**
 * One card per unit in the army, in the order they were added; leaders and support units sit framed together with the
 * unit they are attached to.
 */
export default function EntryList({ draft, library, points, issues, collapsed, onToggle, onChange }: Props) {
  if (!draft.list.units.length) {
    return <p className="text-text/70">No units yet. Add some from the list on the left.</p>;
  }

  // Datasheets as the army uses them: a detachment can make a unit a character or battleline.
  const units = grantedUnits(draft.list, library);

  const card = (entry: ListEntry) => (
    <EntryCard
      key={entry.id}
      draft={draft}
      library={library}
      entry={entry}
      unit={units.get(entry.id) ?? library.unit(draft.list.faction, entry.unit)?.unit}
      points={points[entry.id] ?? 0}
      issues={issues.filter((i) => i.entries.includes(entry.id))}
      collapsed={collapsed.has(entry.id)}
      onToggle={() => onToggle(entry.id)}
      onChange={onChange}
    />
  );

  return (
    <ul className="flex flex-col gap-3">
      {groupEntries(draft.list).map(({ unit, attached }) =>
        attached.length ? (
          <CombinedUnit
            key={unit.id}
            points={[unit, ...attached].reduce((sum, e) => sum + (points[e.id] ?? 0), 0)}
            attached={attached.map(card)}
            unit={card(unit)}
          />
        ) : (
          card(unit)
        ),
      )}
    </ul>
  );
}
