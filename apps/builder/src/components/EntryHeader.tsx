import type { Unit } from '@rulebook/rules';

import { useUnitRoute } from '../hooks/useUnitRoute';
import UnitPhoto from './photos/UnitPhoto';

interface Props {
  faction: string;
  entryId: string;
  /** The datasheet, or undefined when the list names a unit the rules don't have. */
  unit: Unit | undefined;
  unitId: string;
  points: number;
  onRemove: () => void;
}

/** The title bar of a unit card: photo, name (opening the unit's play view), cost and a remove button. */
export default function EntryHeader({ faction, entryId, unit, unitId, points, onRemove }: Props) {
  const name = unit?.name ?? `Unknown unit "${unitId}"`;
  const [, openUnit] = useUnitRoute();

  return (
    <div className="flex items-center gap-2 bg-bar px-3 py-1 text-white">
      {unit && <UnitPhoto faction={faction} unit={unit.id} name={unit.name} size={44} />}
      <h3 className="flex-1 text-lg font-bold tracking-wide uppercase">
        {unit ? (
          <button type="button" className="text-left uppercase hover:underline" onClick={() => openUnit(entryId)}>
            {name}
          </button>
        ) : (
          name
        )}
      </h3>
      <span className="font-extrabold">{points} pts</span>
      <button
        type="button"
        aria-label={`Remove ${name}`}
        className="rounded px-2 font-bold hover:bg-bar-dark"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}
