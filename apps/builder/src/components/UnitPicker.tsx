import type { Library } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { PANEL, PANEL_TITLE } from './styles';

interface Props {
  draft: ArmyDraft;
  library: Library;
  onChange: (draft: ArmyDraft) => void;
}

/** The faction's datasheets, each with its cheapest cost and an Add button. */
export default function UnitPicker({ draft, library, onChange }: Props) {
  const units = library.faction(draft.list.faction)?.units ?? [];

  return (
    <section className={PANEL}>
      <h2 className={PANEL_TITLE}>Add units</h2>
      <ul>
        {units.map((unit) => (
          <li key={unit.id} className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5 last:border-0">
            <span className="flex-1">
              <span className="font-semibold">{unit.name}</span>
              <span className="ml-2 text-xs text-text/60 uppercase">{unit.roles.join(', ')}</span>
            </span>
            <span className="text-sm text-text/70">
              {Math.min(...unit.composition.points.map((p) => p.points))} pts
            </span>
            <button
              type="button"
              aria-label={`Add ${unit.name}`}
              className="rounded bg-bar px-2 font-bold text-white hover:bg-bar-dark"
              onClick={() => onChange(draft.addUnit(library, unit.id).draft)}
            >
              +
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
