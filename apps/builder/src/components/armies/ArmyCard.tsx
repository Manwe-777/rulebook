import type { Library } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';

import type { SavedArmy } from '../../army/SavedArmies';
import { armySummary } from '../../utils/armySummary';
import { factionTint } from '../../utils/factionTint';
import { formatAgo } from '../../utils/formatAgo';
import { BUTTON_QUIET } from '../styles';
import ArmyRulesLine from './ArmyRulesLine';
import DeleteArmyButton from './DeleteArmyButton';
import PhotoThumb from './PhotoThumb';

interface Props {
  army: SavedArmy;
  library: Library;
  /** The release the army's faction is on now; undefined for the demo. */
  release: ReleaseInfo | undefined;
  now: number;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/** A saved army on the armies screen: name, faction, size, detachments, points, legality and photos of its units. */
export default function ArmyCard({ army, library, release, now, onOpen, onDuplicate, onDelete }: Props) {
  const s = armySummary(army.list, library);
  const legal = s.errors === 0;

  return (
    <li
      className="flex flex-col overflow-hidden rounded-lg bg-panel shadow-lg"
      style={factionTint(library.faction(army.list.faction)?.color)}
    >
      <span aria-hidden className="h-2 bg-bar" />
      <button type="button" className="flex flex-1 flex-col gap-2 p-3 text-left hover:bg-white/5" onClick={onOpen}>
        <span className="flex items-start gap-2">
          <span className="flex-1 text-xl font-extrabold">{army.list.name}</span>
          <span
            className={`rounded px-2 py-0.5 text-sm font-bold text-white uppercase ${legal ? 'bg-legal' : 'bg-illegal'}`}
          >
            {legal ? 'Legal' : `${s.errors} problem${s.errors === 1 ? '' : 's'}`}
          </span>
        </span>
        <span className="text-sm font-semibold tracking-wide text-text/80 uppercase">
          {s.faction} · {s.battleSize}
        </span>
        <span className="text-sm text-text/70">{s.detachments.join(', ') || 'No detachment'}</span>
        <span className="flex items-baseline gap-3">
          <span className="text-lg font-extrabold">
            {s.points}
            {s.limit !== null && <span className="text-text/60"> / {s.limit} pts</span>}
          </span>
          <span className="text-sm text-text/60">
            {s.units} unit{s.units === 1 ? '' : 's'} · edited {formatAgo(army.updatedAt, now)}
          </span>
        </span>
        {release && <ArmyRulesLine release={release} editedWith={army.list.release} now={now} />}
        {s.unitTypes.length > 0 && (
          <span className="flex gap-1">
            {s.unitTypes.slice(0, 6).map((unit) => (
              <PhotoThumb key={unit} faction={army.list.faction} unit={unit} size={36} />
            ))}
          </span>
        )}
      </button>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-2">
        <button type="button" className={BUTTON_QUIET} onClick={onDuplicate}>
          Duplicate
        </button>
        <span className="ml-auto">
          <DeleteArmyButton name={army.list.name} onDelete={onDelete} />
        </span>
      </div>
    </li>
  );
}
