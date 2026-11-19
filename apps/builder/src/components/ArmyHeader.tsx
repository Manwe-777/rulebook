import type { Issue } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { INPUT } from './styles';

interface Props {
  draft: ArmyDraft;
  points: { total: number; limit: number | null };
  issues: Issue[];
  onChange: (draft: ArmyDraft) => void;
}

/** The list's name, its points against the limit, and whether it is legal. */
export default function ArmyHeader({ draft, points, issues, onChange }: Props) {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const legal = errors === 0;

  return (
    <header className="flex flex-wrap items-center gap-3">
      <input
        aria-label="List name"
        className={`${INPUT} min-w-0 flex-1 text-xl font-bold`}
        value={draft.list.name}
        onChange={(e) => onChange(draft.rename(e.target.value))}
      />
      <span className="rounded bg-panel px-3 py-1 text-xl font-extrabold">
        {points.total}
        {points.limit !== null && <span className="text-text/60"> / {points.limit} pts</span>}
      </span>
      <span
        className={`rounded px-3 py-1 text-lg font-extrabold tracking-wide text-white uppercase ${legal ? 'bg-legal' : 'bg-illegal'}`}
      >
        {legal ? 'Legal' : `${errors} problem${errors === 1 ? '' : 's'}`}
      </span>
    </header>
  );
}
