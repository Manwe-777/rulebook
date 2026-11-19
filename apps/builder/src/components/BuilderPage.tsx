import { type Library, listPoints, validateList } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';

import type { ArmyDraft } from '../army/ArmyDraft';
import { factionTint } from '../utils/factionTint';
import ArmyHeader from './ArmyHeader';
import ArmySettings from './ArmySettings';
import EntryList from './EntryList';
import IssuesPanel from './IssuesPanel';
import UnitPicker from './UnitPicker';

interface Props {
  draft: ArmyDraft;
  library: Library;
  /** The release the army's faction is on; undefined for the demo. */
  release: ReleaseInfo | undefined;
  onChange: (draft: ArmyDraft) => void;
}

/**
 * One army being built: settings and unit picker on the left, the army and its problems on the right, in the colour
 * the faction's data sets.
 */
export default function BuilderPage({ draft, library, release, onChange }: Props) {
  const issues = validateList(draft.list, library);
  const points = listPoints(draft.list, library);

  return (
    <div className="flex flex-col gap-4" style={factionTint(library.faction(draft.list.faction)?.color)}>
      <ArmyHeader draft={draft} points={points} issues={issues} onChange={onChange} />
      <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <ArmySettings draft={draft} library={library} release={release} onChange={onChange} />
          <UnitPicker draft={draft} library={library} onChange={onChange} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <IssuesPanel issues={issues} />
          <EntryList draft={draft} library={library} points={points.entries} issues={issues} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
