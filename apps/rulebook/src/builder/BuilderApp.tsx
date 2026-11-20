import { loadStoredIdentity } from '@rulebook/sharing/identity';
import { useMemo } from 'react';

import { ArmyDraft } from './army/ArmyDraft';
import ArmiesPage from './components/armies/ArmiesPage';
import BuilderPage from './components/BuilderPage';
import AcceptLinkDialog from './components/sync/AcceptLinkDialog';
import { useArmyRoute } from './hooks/useArmyRoute';
import { useArmySync } from './hooks/useArmySync';
import { useBuilderLibrary } from './hooks/useBuilderLibrary';
import { useIncomingLink } from './hooks/useIncomingLink';
import { useSavedArmies } from './hooks/useSavedArmies';
import { newArmyId } from './utils/newArmyId';

/** The list builder (`/builder`): the saved armies, or the army open in the address (`?army=<id>`). */
export default function BuilderApp() {
  const rules = useBuilderLibrary();
  const { library, releases } = rules;
  const [saved, change] = useSavedArmies();
  const sync = useArmySync(saved, change);
  // A link from another device, opened from its QR code: `#link=…`.
  const [incoming, closeLink] = useIncomingLink();
  const [armyId, open] = useArmyRoute();
  const draft = useMemo(() => (armyId ? saved.draft(armyId) : null), [saved, armyId]);

  const create = (faction: string) => {
    const id = newArmyId();

    change((s) => s.put(id, ArmyDraft.create(library, faction), Date.now()));
    open(id);
  };

  return (
    <div className="flex flex-col gap-4">
      {draft && (
        <button
          type="button"
          className="self-start text-sm font-semibold tracking-wide uppercase hover:underline"
          onClick={() => open(null)}
        >
          ← Armies
        </button>
      )}
      {draft && armyId ? (
        <BuilderPage
          armyId={armyId}
          draft={draft}
          library={library}
          release={releases.find((r) => r.faction === draft.list.faction)}
          onChange={(next) => {
            // Remember which release of the rules the army was last edited with.
            const release = releases.find((r) => r.faction === next.list.faction)?.hash;

            change((s) => s.put(armyId, next.withRelease(release), Date.now()));
          }}
        />
      ) : (
        <ArmiesPage
          saved={saved}
          rules={rules}
          sync={sync}
          onOpen={open}
          onCreate={create}
          onDuplicate={(id) => change((s) => s.duplicate(id, newArmyId(), Date.now()))}
          onDelete={(id) => change((s) => s.remove(id, Date.now()))}
        />
      )}
      {incoming && (
        <AcceptLinkDialog
          ncryptsec={incoming}
          hasOwnKey={loadStoredIdentity() !== null}
          onLinked={(secret) => {
            sync.adopt(secret);
            closeLink();
          }}
          onClose={closeLink}
        />
      )}
    </div>
  );
}
