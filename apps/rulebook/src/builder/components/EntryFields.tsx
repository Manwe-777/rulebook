import type { Library, ListEntry, Unit } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import EntryChoices from './EntryChoices';
import WargearFields from './WargearFields';
import WarlordButton from './WarlordButton';

interface Props {
  draft: ArmyDraft;
  library: Library;
  entry: ListEntry;
  unit: Unit;
  warlord: boolean;
  onChange: (draft: ArmyDraft) => void;
}

/** The editable part of a unit card: size, enhancement or upgrade, attachment, wargear and warlord. */
export default function EntryFields({ draft, library, entry, unit, warlord, onChange }: Props) {
  return (
    <>
      <EntryChoices draft={draft} library={library} entry={entry} unit={unit} onChange={onChange} />
      <WargearFields draft={draft} entry={entry} unit={unit} onChange={onChange} />
      {unit.roles.includes('character') && (
        <WarlordButton warlord={warlord} onChange={(on) => onChange(draft.setWarlord(on ? entry.id : undefined))} />
      )}
    </>
  );
}
