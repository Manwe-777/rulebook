import { encodeListLink, type Issue } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { RULEBOOK_URL } from '../constants';
import FactionIcon from './FactionIcon';
import { INPUT } from './styles';

interface Props {
  draft: ArmyDraft;
  points: { total: number; limit: number | null };
  issues: Issue[];
  /** The faction's icon from its data. */
  icon: string | undefined;
  onChange: (draft: ArmyDraft) => void;
}

/** The list's name, its points against the limit, and whether it is legal. */
export default function ArmyHeader({ draft, points, issues, icon, onChange }: Props) {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const legal = errors === 0;

  return (
    <header className="flex flex-wrap items-center gap-3">
      {icon && (
        <span className="flex size-11 items-center justify-center rounded bg-bar text-white">
          <FactionIcon name={icon} className="text-3xl leading-none" />
        </span>
      )}
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
      {RULEBOOK_URL && (
        // The list goes after `#`, so it stays in the browser and never reaches a server.
        <a
          href={`${RULEBOOK_URL}print#army=${encodeListLink(draft.list)}`}
          target="_blank"
          rel="noopener"
          className="rounded bg-bar px-3 py-1 text-lg font-extrabold tracking-wide text-white uppercase hover:bg-bar-dark"
        >
          Print
        </a>
      )}
    </header>
  );
}
