import { type ListEntry, type Unit, wargearAllowance } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { INPUT, LABEL } from './styles';

interface Props {
  draft: ArmyDraft;
  entry: ListEntry;
  unit: Unit;
  onChange: (draft: ArmyDraft) => void;
}

const weaponName = (unit: Unit, id: string) => {
  const weapon = [...unit.ranged, ...unit.melee].find((w) => w.id === id);

  return weapon ? (weapon.group ?? weapon.name) : id;
};

/** One row per wargear option: how many models take it, and which choice when there are several. */
export default function WargearFields({ draft, entry, unit, onChange }: Props) {
  return unit.wargearOptions.map((option) => {
    const taken = entry.wargear.find((w) => w.option === option.id);
    const models = taken?.models ?? 0;
    const choice = taken?.choice ?? option.with[0];
    const max = wargearAllowance(unit, entry.models, option);
    const names = (ids: string[]) => ids.map((id) => weaponName(unit, id)).join(' + ');
    const set = (n: number, c: string[]) => onChange(draft.setWargear(entry.id, option.id, n, c));

    return (
      <div key={option.id} className="flex flex-wrap items-end gap-2">
        <label className={LABEL}>
          {option.replace.length ? `Swap ${names(option.replace)}` : 'Add'}
          <input
            type="number"
            min={0}
            max={max}
            className={`${INPUT} w-20`}
            value={models}
            onChange={(e) => set(Math.max(0, Number(e.target.value) || 0), choice)}
          />
        </label>
        {option.with.length > 1 ? (
          <select
            aria-label={`${option.id} choice`}
            className={INPUT}
            value={choice.join(',')}
            onChange={(e) => set(models, e.target.value.split(','))}
          >
            {option.with.map((list) => (
              <option key={list.join(',')} value={list.join(',')}>
                {names(list)}
              </option>
            ))}
          </select>
        ) : (
          <span className="pb-1">for {names(choice)}</span>
        )}
        <span className="pb-1 text-sm text-text/60">
          up to {max}
          {option.points ? `, +${option.points} pts each` : ''}
        </span>
      </div>
    );
  });
}
