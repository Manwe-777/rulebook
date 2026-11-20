import { type Library, listPoints, validateList } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';

import type { ArmyDraft } from '../army/ArmyDraft';
import { useCollapsedUnits } from '../hooks/useCollapsedUnits';
import { usePlayMode } from '../hooks/usePlayMode';
import { useShowStratagems } from '../hooks/useShowStratagems';
import { useUnitRoute } from '../hooks/useUnitRoute';
import { factionTint } from '../utils/factionTint';
import ArmyHeader from './ArmyHeader';
import ArmySettings from './ArmySettings';
import EntryList from './EntryList';
import IssuesPanel from './IssuesPanel';
import PlayList from './play/PlayList';
import PlayStratagems from './play/PlayStratagems';
import { BUTTON, BUTTON_QUIET } from './styles';
import UnitSheet from './unit/UnitSheet';
import UnitPicker from './UnitPicker';

interface Props {
  /** The army's id, for what this device remembers about it. */
  armyId: string;
  draft: ArmyDraft;
  library: Library;
  /** The release the army's faction is on; undefined for the demo. */
  release: ReleaseInfo | undefined;
  onChange: (draft: ArmyDraft) => void;
}

/**
 * One army in edit mode (settings, unit picker, editable cards), in play mode (`?mode=play`: compact read-only cards),
 * or one of its units in the play view (`?unit=`): settings and unit picker on the left, the army and its problems on the right, in the colour
 * the faction's data sets.
 */
export default function BuilderPage({ armyId, draft, library, release, onChange }: Props) {
  const issues = validateList(draft.list, library);
  const points = listPoints(draft.list, library);
  const faction = library.faction(draft.list.faction);
  const [unitId, openUnit] = useUnitRoute();
  const [playing, setPlaying] = usePlayMode();
  const [showStratagems, setShowStratagems] = useShowStratagems();
  const [collapsed, toggle] = useCollapsedUnits(armyId);

  if (unitId && draft.entry(unitId)) {
    return (
      <div style={factionTint(faction?.color)}>
        <UnitSheet
          draft={draft}
          library={library}
          entryId={unitId}
          points={points.entries}
          playing={playing}
          onClose={() => openUnit(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" style={factionTint(faction?.color)}>
      <ArmyHeader
        draft={draft}
        points={points}
        issues={issues}
        icon={faction?.icon}
        playing={playing}
        onPlayingChange={setPlaying}
        onChange={onChange}
      />
      {playing ? (
        <>
          <button
            type="button"
            aria-pressed={showStratagems}
            className={`${showStratagems ? BUTTON : BUTTON_QUIET} self-start`}
            onClick={() => setShowStratagems(!showStratagems)}
          >
            {showStratagems ? 'Hide stratagems' : 'Show stratagems'}
          </button>
          {showStratagems && <PlayStratagems list={draft.list} library={library} />}
          <PlayList draft={draft} library={library} points={points.entries} collapsed={collapsed} onToggle={toggle} />
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
          <div className="flex min-w-0 flex-col gap-4">
            <ArmySettings draft={draft} library={library} release={release} onChange={onChange} />
            <UnitPicker draft={draft} library={library} onChange={onChange} />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <IssuesPanel issues={issues} />
            <EntryList
              draft={draft}
              library={library}
              points={points.entries}
              issues={issues}
              collapsed={collapsed}
              onToggle={toggle}
              onChange={onChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
