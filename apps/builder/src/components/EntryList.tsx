import type { Issue, Library } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import EntryCard from './EntryCard';

interface Props {
  draft: ArmyDraft;
  library: Library;
  points: Record<string, number>;
  issues: Issue[];
  onChange: (draft: ArmyDraft) => void;
}

/** One card per unit in the army, in the order they were added. */
export default function EntryList({ draft, library, points, issues, onChange }: Props) {
  if (!draft.list.units.length) {
    return <p className="text-text/70">No units yet. Add some from the list on the left.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {draft.list.units.map((entry) => (
        <EntryCard
          key={entry.id}
          draft={draft}
          library={library}
          entry={entry}
          points={points[entry.id] ?? 0}
          issues={issues.filter((i) => i.entries.includes(entry.id))}
          onChange={onChange}
        />
      ))}
    </ul>
  );
}
