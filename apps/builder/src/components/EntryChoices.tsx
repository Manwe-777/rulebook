import type { Library, ListEntry, Unit } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { itemOptions } from '../utils/itemOptions';
import AttachControl from './AttachControl';
import SelectField from './SelectField';

interface Props {
  draft: ArmyDraft;
  library: Library;
  entry: ListEntry;
  unit: Unit;
  onChange: (draft: ArmyDraft) => void;
}

/**
 * The choices on a unit card: size, the enhancements and upgrades it can take (hidden when there are none), and
 * attachment (leaders and support).
 */
export default function EntryChoices({ draft, library, entry, unit, onChange }: Props) {
  const items = (target: 'model' | 'unit') =>
    itemOptions(draft.list, library, target, unit, target === 'model' ? entry.enhancement : entry.upgrade).map((e) => ({
      value: e.id,
      label: `${e.name} (${e.points} pts)`,
    }));

  const enhancements = items('model');
  const upgrades = items('unit');

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
      {enhancements.length > 0 && (
        <SelectField
          label="Enhancement"
          value={entry.enhancement ?? ''}
          none="None"
          options={enhancements}
          onChange={(v) => onChange(draft.setEnhancement(entry.id, v))}
        />
      )}
      {upgrades.length > 0 && (
        <SelectField
          label="Upgrade"
          value={entry.upgrade ?? ''}
          none="None"
          options={upgrades}
          onChange={(v) => onChange(draft.setUpgrade(entry.id, v))}
        />
      )}
      {(unit.leader || unit.support) && (
        <AttachControl draft={draft} library={library} entry={entry} unit={unit} onChange={onChange} />
      )}
    </div>
  );
}
