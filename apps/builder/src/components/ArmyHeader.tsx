import { encodeListLink, type Issue } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { RULEBOOK_URL } from '../constants';
import FactionIcon from './FactionIcon';
import { BUTTON, BUTTON_QUIET, INPUT } from './styles';

interface Props {
  draft: ArmyDraft;
  points: { total: number; limit: number | null };
  issues: Issue[];
  /** The faction's icon from its data. */
  icon: string | undefined;
  /** Play mode: the name can't be edited, and the switch offers edit mode. */
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  onChange: (draft: ArmyDraft) => void;
}

/** The list's name, its points against the limit, whether it is legal, and the switch between edit and play mode. */
export default function ArmyHeader({ draft, points, issues, icon, playing, onPlayingChange, onChange }: Props) {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const legal = errors === 0;

  return (
    <header className="flex flex-wrap items-center gap-3">
      {/* Icon and name share a full line on phones, so a long name doesn't squeeze the points and buttons. */}
      <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto sm:flex-1">
        {icon && (
          <span className="flex size-11 shrink-0 items-center justify-center rounded bg-bar text-white">
            <FactionIcon name={icon} className="text-3xl leading-none" />
          </span>
        )}
        {playing ? (
          <h2 className="min-w-0 flex-1 text-xl font-extrabold sm:text-2xl">{draft.list.name}</h2>
        ) : (
          <input
            aria-label="List name"
            className={`${INPUT} min-w-0 flex-1 text-xl font-bold`}
            value={draft.list.name}
            onChange={(e) => onChange(draft.rename(e.target.value))}
          />
        )}
      </div>
      <span className="rounded bg-panel px-3 py-1 text-xl font-extrabold">
        {points.total}
        {points.limit !== null && <span className="text-text/60"> / {points.limit} pts</span>}
      </span>
      <span
        className={`rounded px-3 py-1 text-lg font-extrabold tracking-wide text-white uppercase ${legal ? 'bg-legal' : 'bg-illegal'}`}
      >
        {legal ? 'Legal' : `${errors} problem${errors === 1 ? '' : 's'}`}
      </span>
      <button
        type="button"
        className={`${playing ? BUTTON_QUIET : BUTTON} text-lg`}
        onClick={() => onPlayingChange(!playing)}
      >
        {playing ? 'Edit list' : 'Play'}
      </button>
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
