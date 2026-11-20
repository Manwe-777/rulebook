import type { Issue, Library, ListEntry, Unit } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import EntryFields from './EntryFields';
import EntryHeader from './EntryHeader';

interface Props {
  draft: ArmyDraft;
  library: Library;
  entry: ListEntry;
  /** The datasheet as the army uses it (with what its detachments grant); undefined when the rules don't have it. */
  unit: Unit | undefined;
  points: number;
  issues: Issue[];
  /** Folded down to its title bar. */
  collapsed: boolean;
  onToggle: () => void;
  onChange: (draft: ArmyDraft) => void;
}

/** One unit in the army: size, wargear, enhancement or upgrade, attachment and warlord, with its own problems. */
export default function EntryCard({
  draft,
  library,
  entry,
  unit,
  points,
  issues,
  collapsed,
  onToggle,
  onChange,
}: Props) {
  const remove = () => onChange(draft.removeUnit(entry.id));
  const broken = issues.some((i) => i.severity === 'error');
  const warlord = draft.list.warlord === entry.id;
  const ring = broken ? 'ring-2 ring-illegal' : warlord ? 'ring-2 ring-warlord' : '';

  return (
    <li id={`entry-${entry.id}`} className={`overflow-hidden rounded-lg bg-panel shadow-lg ${ring}`}>
      <EntryHeader
        faction={draft.list.faction}
        entryId={entry.id}
        unit={unit}
        unitId={entry.unit}
        points={points}
        warlord={warlord}
        collapsed={collapsed}
        onToggle={onToggle}
        onRemove={remove}
      />
      {/* A folded card keeps its problems in view. */}
      <div className={`flex flex-col gap-3 p-3 ${collapsed && !issues.length ? 'hidden' : ''}`}>
        {unit && !collapsed && (
          <EntryFields
            draft={draft}
            library={library}
            entry={entry}
            unit={unit}
            warlord={warlord}
            onChange={onChange}
          />
        )}
        {issues.length > 0 && (
          <ul className="list-[square] pl-5 text-sm text-red-300">
            {issues.map((i) => (
              <li key={`${i.code}-${i.message}`}>{i.message}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
