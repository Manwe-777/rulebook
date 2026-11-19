import { type Library, listPoints, validateList } from '@rulebook/rules';

import type { ArmyDraft } from '../army/ArmyDraft';
import ArmyHeader from './ArmyHeader';
import ArmySettings from './ArmySettings';
import EntryList from './EntryList';
import IssuesPanel from './IssuesPanel';
import UnitPicker from './UnitPicker';

interface Props {
  draft: ArmyDraft;
  library: Library;
  onChange: (draft: ArmyDraft) => void;
}

/** One army being built: settings and unit picker on the left, the army and its problems on the right. */
export default function BuilderPage({ draft, library, onChange }: Props) {
  const issues = validateList(draft.list, library);
  const points = listPoints(draft.list, library);

  return (
    <>
      <ArmyHeader draft={draft} points={points} issues={issues} onChange={onChange} />
      <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <ArmySettings draft={draft} library={library} onChange={onChange} />
          <UnitPicker draft={draft} library={library} onChange={onChange} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <IssuesPanel issues={issues} />
          <EntryList draft={draft} library={library} points={points.entries} issues={issues} onChange={onChange} />
        </div>
      </div>
    </>
  );
}
