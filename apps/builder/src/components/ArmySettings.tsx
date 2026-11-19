import type { Library } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';

import { ArmyDraft } from '../army/ArmyDraft';
import DetachmentPicker from './DetachmentPicker';
import { INPUT, LABEL, PANEL, PANEL_TITLE } from './styles';

interface Props {
  draft: ArmyDraft;
  library: Library;
  release: ReleaseInfo | undefined;
  onChange: (draft: ArmyDraft) => void;
}

/** Faction, battle size, detachments and disposition. Changing the faction starts a new list. */
export default function ArmySettings({ draft, library, release, onChange }: Props) {
  const faction = library.faction(draft.list.faction);

  return (
    <section className={PANEL}>
      <h2 className={PANEL_TITLE}>Army</h2>
      <div className="flex flex-col gap-3 p-3">
        <label className={LABEL}>
          Faction
          <select
            className={INPUT}
            value={draft.list.faction}
            onChange={(e) => onChange(ArmyDraft.create(library, e.target.value))}
          >
            {!faction && <option value={draft.list.faction}>{draft.list.faction} (not loaded)</option>}
            {library.factions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal tracking-normal text-text/60 normal-case">
            {release
              ? `Rules ${release.version}, released ${new Date(release.date).toLocaleDateString()}`
              : 'Built-in demo rules'}
          </span>
        </label>
        <label className={LABEL}>
          Battle size
          <select
            className={INPUT}
            value={draft.list.battleSize}
            onChange={(e) => onChange(draft.setBattleSize(e.target.value))}
          >
            {library.muster?.battleSizes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.points} pts)
              </option>
            ))}
          </select>
        </label>
        <DetachmentPicker draft={draft} library={library} onChange={onChange} />
      </div>
    </section>
  );
}
