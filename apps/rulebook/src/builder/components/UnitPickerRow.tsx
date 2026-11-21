import type { ArmyList, Unit } from '@rulebook/rules';

import { unitCopies } from '../utils/unitCopies';
import AddUnitButton from './AddUnitButton';
import UnitPhoto from './photos/UnitPhoto';

interface Props {
  list: ArmyList;
  unit: Unit;
  /** The role its heading already says, left out of the role tags. */
  sectionRole?: string;
  onAdd: () => void;
}

/** One datasheet in the Add units list: photo, name, other roles, copies in the army, cheapest cost and Add. */
export default function UnitPickerRow({ list, unit, sectionRole, onAdd }: Props) {
  const copies = unitCopies(list, unit.id);
  const roles = unit.roles.filter((r) => r !== sectionRole && !(sectionRole === 'epic-hero' && r === 'character'));

  return (
    <li className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5 last:border-0">
      <UnitPhoto faction={list.faction} unit={unit.id} name={unit.name} size={28} placeholder={false} />
      <span className="flex-1">
        <span className="font-semibold">{unit.name}</span>
        {roles.length > 0 && <span className="ml-2 text-xs text-text/60 uppercase">{roles.join(', ')}</span>}
      </span>
      {copies > 0 && (
        <span className="text-sm font-bold text-text" aria-label={`${copies} in the army`}>
          ×{copies}
        </span>
      )}
      <span className="text-sm text-text/70">{Math.min(...unit.composition.points.map((p) => p.points))} pts</span>
      <AddUnitButton name={unit.name} onAdd={onAdd} />
    </li>
  );
}
