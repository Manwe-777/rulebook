import type { Library, ListEntry, Unit } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { attachTargets } from '../utils/attachTargets';
import { itemOptions } from '../utils/itemOptions';
import SelectField from './SelectField';

interface Props {
  draft: ArmyDraft;
  library: Library;
  entry: ListEntry;
  unit: Unit;
  onChange: (draft: ArmyDraft) => void;
}

/** The dropdowns of a unit card: size, enhancement (characters), upgrade, and attachment (leaders and support). */
export default function EntryChoices({ draft, library, entry, unit, onChange }: Props) {
  const label = (e: ListEntry) => library.unit(draft.list.faction, e.unit)?.unit.name ?? e.unit;

  const items = (target: 'model' | 'unit') =>
    itemOptions(draft.list, library, target).map((e) => ({ value: e.id, label: `${e.name} (${e.points} pts)` }));

  return (
    <div className="flex flex-wrap gap-3">
      <SelectField
        label="Models"
        value={String(entry.models)}
        options={unit.composition.points.map((p) => ({
          value: String(p.models),
          label: `${p.models} (${p.points} pts)`,
        }))}
        onChange={(v) => onChange(draft.setModels(entry.id, Number(v)))}
      />
      {unit.roles.includes('character') && (
        <SelectField
          label="Enhancement"
          value={entry.enhancement ?? ''}
          none="None"
          options={items('model')}
          onChange={(v) => onChange(draft.setEnhancement(entry.id, v))}
        />
      )}
      <SelectField
        label="Upgrade"
        value={entry.upgrade ?? ''}
        none="None"
        options={items('unit')}
        onChange={(v) => onChange(draft.setUpgrade(entry.id, v))}
      />
      {(unit.leader || unit.support) && (
        <SelectField
          label="Attached to"
          value={entry.attachedTo ?? ''}
          none="Nobody"
          options={attachTargets(draft.list, library, entry).map((e) => ({ value: e.id, label: label(e) }))}
          onChange={(v) => onChange(draft.attach(entry.id, v))}
        />
      )}
    </div>
  );
}
