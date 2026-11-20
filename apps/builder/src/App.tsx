import { loadStoredIdentity } from '@rulebook/sharing/identity';
import { useMemo } from 'react';

import { ArmyDraft } from './army/ArmyDraft';
import ArmiesPage from './components/armies/ArmiesPage';
import BuilderPage from './components/BuilderPage';
import AcceptLinkDialog from './components/sync/AcceptLinkDialog';
import { ICON_CREDIT, RULEBOOK_URL, SITE_NAME } from './constants';
import { useArmyRoute } from './hooks/useArmyRoute';
import { useArmySync } from './hooks/useArmySync';
import { type BuilderSource, useBuilderLibrary } from './hooks/useBuilderLibrary';
import { useIncomingLink } from './hooks/useIncomingLink';
import { useSavedArmies } from './hooks/useSavedArmies';
import { newArmyId } from './utils/newArmyId';

const SOURCE: Record<BuilderSource, string> = {
  demo: 'Using the demo faction.',
  loading: 'Loading rules from the relays…',
  cached: 'Using rules saved on this device; checking the relays for newer ones…',
  relays: 'Rules loaded from the relays.',
  offline: 'Offline: using rules saved on this device.',
  failed: 'Could not reach the relays; using the demo faction.',
};

const LINK = 'text-sm font-semibold tracking-wide uppercase hover:underline';
const CURRENT = 'text-sm font-semibold tracking-wide uppercase underline decoration-2 underline-offset-4';

/** The list builder: the saved armies, or the army open in the address (`?army=<id>`). */
export default function App() {
  const rules = useBuilderLibrary();
  const { library, status, releases } = rules;
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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-6 font-sans text-text">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="text-3xl font-extrabold tracking-wide uppercase">{SITE_NAME}</h1>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {draft && (
            <button type="button" className={LINK} onClick={() => open(null)}>
              ← Armies
            </button>
          )}
          {RULEBOOK_URL && (
            <a href={RULEBOOK_URL} className={LINK}>
              Rulebook
            </a>
          )}
          <button type="button" aria-current="page" className={CURRENT} onClick={() => open(null)}>
            List builder
          </button>
          {RULEBOOK_URL && (
            <>
              <a href={`${RULEBOOK_URL}admin`} className={LINK}>
                Admin
              </a>
              <a href={`${RULEBOOK_URL}account`} className={LINK}>
                Account
              </a>
            </>
          )}
        </nav>
      </div>
      {draft && armyId ? (
        <BuilderPage
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
      <footer className="mt-auto text-xs text-text/60">
        {SOURCE[status]} Rules are written by the community and are not official Games Workshop material. Icons:{' '}
        <a href={ICON_CREDIT.url} className="underline">
          {ICON_CREDIT.label}
        </a>
        .
      </footer>
    </main>
  );
}
