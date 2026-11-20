import { type ListEntry, type Unit, wargearAllowance, wargearName } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { choicePoints } from '../utils/choicePoints';
import { optionLabel } from '../utils/optionLabel';
import { INPUT, LABEL } from './styles';

interface Props {
  draft: ArmyDraft;
  entry: ListEntry;
  unit: Unit;
  onChange: (draft: ArmyDraft) => void;
}

/**
 * One block per wargear option, with a count for each of its choices. The choices share the option's limit, so two
 * models can take different weapons from the same list.
 */
export default function WargearFields({ draft, entry, unit, onChange }: Props) {
  const names = (ids: string[]) => ids.map((id) => wargearName(unit, id)).join(' + ');

  return unit.wargearOptions.map((option) => {
    const rows = entry.wargear.filter((w) => w.option === option.id);
    const max = wargearAllowance(unit, entry, option);
    const used = rows.reduce((sum, w) => sum + w.models, 0);
    const countOf = (choice: string[]) => rows.find((w) => w.choice.join(',') === choice.join(','))?.models ?? 0;

    return (
      <fieldset key={option.id} className="flex flex-col gap-1">
        <legend className={LABEL}>
          {optionLabel(unit, option)}
          <span className="ml-2 font-normal text-text/60 normal-case">
            up to {max}
            {option.points ? `, +${option.points} pts each` : ''}
          </span>
        </legend>
        {option.with.map((choice) => {
          const count = countOf(choice);
          const room = max - used + count;

          return (
            <label key={choice.join(',')} className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={room}
                className={`${INPUT} w-16`}
                value={count}
                onChange={(e) => {
                  const n = Math.min(room, Math.max(0, Number(e.target.value) || 0));

                  onChange(draft.setWargear(entry.id, option.id, n, choice));
                }}
              />
              <span>
                {names(choice)}
                {choicePoints(unit, choice) > 0 && (
                  <span className="text-text/60"> (+{choicePoints(unit, choice)} pts each)</span>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>
    );
  });
}
