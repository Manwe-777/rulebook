import { type ListEntry, type Unit, wargearAllowance, wargearName, wargearRoom } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import { choicePoints } from '../utils/choicePoints';
import { optionLabel } from '../utils/optionLabel';
import NumberStepper from './NumberStepper';
import { LABEL } from './styles';

interface Props {
  draft: ArmyDraft;
  entry: ListEntry;
  unit: Unit;
  onChange: (draft: ArmyDraft) => void;
}

/**
 * One block per wargear option, with a count for each of its choices. The choices share the option's limit (and its
 * group's, for "one or the other" options), so two models can take different weapons from the same list.
 */
export default function WargearFields({ draft, entry, unit, onChange }: Props) {
  const names = (ids: string[]) => ids.map((id) => wargearName(unit, id)).join(' + ');

  return unit.wargearOptions.map((option) => {
    const rows = entry.wargear.filter((w) => w.option === option.id);
    const max = wargearAllowance(unit, entry, option);
    const free = wargearRoom(unit, entry, option);
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
          const room = free + count;

          return (
            <div key={choice.join(',')} className="flex items-center gap-2">
              <NumberStepper
                value={count}
                max={room}
                label={names(choice)}
                onChange={(n) => onChange(draft.setWargear(entry.id, option.id, n, choice))}
              />
              <span>
                {names(choice)}
                {choicePoints(unit, choice) > 0 && (
                  <span className="text-text/60"> (+{choicePoints(unit, choice)} pts each)</span>
                )}
              </span>
            </div>
          );
        })}
      </fieldset>
    );
  });
}
