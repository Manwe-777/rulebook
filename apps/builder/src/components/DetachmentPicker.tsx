import { detachmentPoints, detachmentTags, type Library, offeredDispositions } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import SelectField from './SelectField';
import { LABEL } from './styles';

interface Props {
  draft: ArmyDraft;
  library: Library;
  onChange: (draft: ArmyDraft) => void;
}

/**
 * The faction's detachments with their cost in detachment points, disposition and tags; the points spent against the
 * battle size's budget; and, with several detachments of different dispositions, which one the army uses.
 */
export default function DetachmentPicker({ draft, library, onChange }: Props) {
  const faction = library.faction(draft.list.faction);
  const { spent, budget } = detachmentPoints(draft.list, library);
  const chosen = (faction?.detachments ?? []).filter((d) => draft.list.detachments.includes(d.id));
  const dispositions = offeredDispositions(chosen);
  const over = budget !== null && spent > budget;

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className={`${LABEL} mb-1 flex w-full flex-row justify-between`}>
        Detachments
        {budget !== null && (
          <span className={over ? 'text-red-300' : ''}>
            {spent} / {budget} DP
          </span>
        )}
      </legend>
      {faction?.detachments.map((d) => (
        <label key={d.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={draft.list.detachments.includes(d.id)}
            onChange={() => onChange(draft.toggleDetachment(library, d.id))}
          />
          <span className="font-semibold">{d.name}</span>
          <span className="text-sm text-text/60">{detachmentTags(d, library.muster).join(' · ')}</span>
        </label>
      ))}
      {dispositions.length > 1 && (
        <div className="mt-2">
          <SelectField
            label="Force disposition"
            value={draft.list.disposition ?? ''}
            none="Pick one"
            options={dispositions.map((id) => ({
              value: id,
              label: library.muster?.dispositions.find((x) => x.id === id)?.name ?? id,
            }))}
            onChange={(v) => onChange(draft.setDisposition(v))}
          />
        </div>
      )}
    </fieldset>
  );
}
