import type { Library } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';

import type { SavedArmy } from '../../army/SavedArmies';
import { armySummary } from '../../utils/armySummary';
import { factionTint } from '../../utils/factionTint';
import { formatAgo } from '../../utils/formatAgo';
import { BUTTON_QUIET } from '../styles';
import ArmyBanner from './ArmyBanner';
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

  return (
    <li className="flex flex-col overflow-hidden rounded-lg bg-panel shadow-lg" style={factionTint(s.color)}>
      <button type="button" className="flex flex-1 flex-col text-left hover:bg-white/5" onClick={onOpen}>
        <ArmyBanner
          name={army.list.name}
          faction={s.faction}
          battleSize={s.battleSize}
          icon={s.icon}
          errors={s.errors}
        />
        <span className="flex flex-col gap-2 p-3">
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
        </span>
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
