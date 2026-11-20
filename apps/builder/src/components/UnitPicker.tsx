import type { Library } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { ADDED_TOAST_MS } from '../constants';
import { useToast } from '../hooks/useToast';
import { addedMessage } from '../utils/addedMessage';
import { unitCopies } from '../utils/unitCopies';
import AddUnitButton from './AddUnitButton';
import UnitPhoto from './photos/UnitPhoto';
import { PANEL, PANEL_TITLE } from './styles';
import Toast from './Toast';

/** Brings a unit's card into view once React has drawn it. */
const reveal = (id: string) =>
  requestAnimationFrame(() =>
    document.getElementById(`entry-${id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
  );

interface Props {
  draft: ArmyDraft;
  library: Library;
  onChange: (draft: ArmyDraft) => void;
}

/**
 * The faction's datasheets, each with its cheapest cost, how many the army has and an Add button. Each add is
 * confirmed with a short message that can take you to the new unit.
 */
export default function UnitPicker({ draft, library, onChange }: Props) {
  const units = library.armyUnits(draft.list.faction);
  const [toast, show, hide] = useToast(ADDED_TOAST_MS);

  const add = (unitId: string, name: string) => {
    const { draft: next, id } = draft.addUnit(library, unitId);

    onChange(next);
    show(addedMessage(name, unitCopies(next.list, unitId)), { label: 'Show', run: () => reveal(id) });
  };

  return (
    <section className={PANEL}>
      <h2 className={PANEL_TITLE}>Add units</h2>
      <ul>
        {units.map((unit) => (
          <li key={unit.id} className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5 last:border-0">
            <UnitPhoto faction={draft.list.faction} unit={unit.id} name={unit.name} size={28} placeholder={false} />
            <span className="flex-1">
              <span className="font-semibold">{unit.name}</span>
              <span className="ml-2 text-xs text-text/60 uppercase">{unit.roles.join(', ')}</span>
            </span>
            {unitCopies(draft.list, unit.id) > 0 && (
              <span
                className="text-sm font-bold text-text"
                aria-label={`${unitCopies(draft.list, unit.id)} in the army`}
              >
                ×{unitCopies(draft.list, unit.id)}
              </span>
            )}
            <span className="text-sm text-text/70">
              {Math.min(...unit.composition.points.map((p) => p.points))} pts
            </span>
            <AddUnitButton name={unit.name} onAdd={() => add(unit.id, unit.name)} />
          </li>
        ))}
      </ul>
      <Toast toast={toast} onClose={hide} />
    </section>
  );
}
