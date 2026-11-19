import type { Issue, Library, ListEntry } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import EntryChoices from './EntryChoices';
import EntryHeader from './EntryHeader';
import WargearFields from './WargearFields';

interface Props {
  draft: ArmyDraft;
  library: Library;
  entry: ListEntry;
  points: number;
  issues: Issue[];
  onChange: (draft: ArmyDraft) => void;
}

/** One unit in the army: size, wargear, enhancement or upgrade, attachment and warlord, with its own problems. */
export default function EntryCard({ draft, library, entry, points, issues, onChange }: Props) {
  const unit = library.unit(draft.list.faction, entry.unit)?.unit;
  const remove = () => onChange(draft.removeUnit(entry.id));
  const broken = issues.some((i) => i.severity === 'error');

  return (
    <li className={`overflow-hidden rounded-lg bg-panel shadow-lg ${broken ? 'ring-2 ring-illegal' : ''}`}>
      <EntryHeader faction={draft.list.faction} unit={unit} unitId={entry.unit} points={points} onRemove={remove} />
      <div className="flex flex-col gap-3 p-3">
        {unit && <EntryChoices draft={draft} library={library} entry={entry} unit={unit} onChange={onChange} />}
        {unit && <WargearFields draft={draft} entry={entry} unit={unit} onChange={onChange} />}
        {unit?.roles.includes('character') && (
          <label className="flex items-center gap-2 font-semibold">
            <input
              type="radio"
              name="warlord"
              checked={draft.list.warlord === entry.id}
              onChange={() => onChange(draft.setWarlord(entry.id))}
            />
            Warlord
          </label>
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
