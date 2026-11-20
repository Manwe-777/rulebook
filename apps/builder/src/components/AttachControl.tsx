import type { Library, ListEntry, Unit } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { attachTargets } from '../utils/attachTargets';
import { bodyguardLabel } from '../utils/bodyguardLabel';
import SelectField from './SelectField';
import { BUTTON_QUIET, LABEL } from './styles';

interface Props {
  draft: ArmyDraft;
  library: Library;
  entry: ListEntry;
  unit: Unit;
  onChange: (draft: ArmyDraft) => void;
}

/** Brings the moved card into view once React has put it in its new place. */
const reveal = (id: string) =>
  requestAnimationFrame(() =>
    document.getElementById(`entry-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
  );

/**
 * For leaders and support units: which unit they join. Once attached, the card shows the unit it leads and a Detach
 * button; with nothing in the army it can join, which units it could lead.
 */
export default function AttachControl({ draft, library, entry, unit, onChange }: Props) {
  const name = (id: string) => library.unit(draft.list.faction, id)?.unit.name ?? id;
  const joined = entry.attachedTo ? draft.entry(entry.attachedTo) : undefined;

  const attach = (target: string | undefined) => {
    onChange(draft.attach(entry.id, target));
    reveal(entry.id);
  };

  if (joined) {
    const verb = unit.leader?.bodyguards.includes(joined.unit) ? 'Leading' : 'Supporting';

    return (
      <div className={LABEL}>
        {verb}
        <span className="flex items-center gap-2 normal-case">
          <span className="font-bold text-text">{bodyguardLabel(draft.list, library, joined, entry.id)}</span>
          <button type="button" className={`${BUTTON_QUIET} py-0 text-sm`} onClick={() => attach(undefined)}>
            Detach
          </button>
        </span>
      </div>
    );
  }

  const targets = attachTargets(draft.list, library, entry);

  if (!targets.length) {
    const bodyguards = [...(unit.leader?.bodyguards ?? []), ...(unit.support?.bodyguards ?? [])];

    return (
      <p className="flex flex-col gap-1 text-sm">
        <span className="font-semibold tracking-wide text-text/70 uppercase">Can join</span>
        <span className="text-text/70">{bodyguards.map(name).join(', ')}: add one to attach</span>
      </p>
    );
  }

  return (
    <SelectField
      label="Attach to"
      value=""
      none="Not attached"
      options={targets.map((e) => ({ value: e.id, label: bodyguardLabel(draft.list, library, e) }))}
      onChange={attach}
    />
  );
}
