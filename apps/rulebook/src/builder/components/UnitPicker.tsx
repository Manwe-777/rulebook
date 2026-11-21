import type { Library } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { ADDED_TOAST_MS } from '../constants';
import { useToast } from '../hooks/useToast';
import { addedMessage } from '../utils/addedMessage';
import { unitCopies } from '../utils/unitCopies';
import { unitSections } from '../utils/unitSections';
import { PANEL, PANEL_TITLE } from './styles';
import Toast from './Toast';
import UnitPickerRow from './UnitPickerRow';

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
 * The faction's datasheets under role headings (epic heroes, characters, battleline…), each with its cheapest cost, how many the army has and an Add button. Each add is
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
      {unitSections(units).map((section) => (
        <div key={section.title}>
          <h3 className="bg-black/30 px-3 py-1 text-xs font-bold tracking-wider text-text/70 uppercase">
            {section.title}
          </h3>
          <ul>
            {section.units.map((unit) => (
              <UnitPickerRow
                key={unit.id}
                list={draft.list}
                unit={unit}
                sectionRole={section.role}
                onAdd={() => add(unit.id, unit.name)}
              />
            ))}
          </ul>
        </div>
      ))}
      <Toast toast={toast} onClose={hide} />
    </section>
  );
}
