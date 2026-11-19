import { listPoints, validateList } from '@rulebook/rules';

import ArmyHeader from './components/ArmyHeader';
import ArmySettings from './components/ArmySettings';
import EntryList from './components/EntryList';
import IssuesPanel from './components/IssuesPanel';
import UnitPicker from './components/UnitPicker';
import { RULEBOOK_URL, SITE_NAME } from './constants';
import { useBuilderLibrary } from './hooks/useBuilderLibrary';
import { useDraft } from './hooks/useDraft';

const SOURCE = {
  demo: 'Using the demo faction.',
  loading: 'Loading rules from the relays…',
  relays: 'Rules loaded from the relays.',
  failed: 'Could not reach the relays; using the demo faction.',
};

/** The list builder: settings and unit picker on the left, the army and its problems on the right. */
export default function App() {
  const { library, status } = useBuilderLibrary();
  const [draft, setDraft] = useDraft(library);
  const issues = validateList(draft.list, library);
  const points = listPoints(draft.list, library);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-6 font-sans text-text">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="text-3xl font-extrabold tracking-wide uppercase">{SITE_NAME}</h1>
        {RULEBOOK_URL && (
          <a href={RULEBOOK_URL} className="text-sm font-semibold tracking-wide uppercase hover:underline">
            Rulebook
          </a>
        )}
      </div>
      <ArmyHeader draft={draft} points={points} issues={issues} onChange={setDraft} />
      <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
        <div className="flex min-w-0 flex-col gap-4">
          <ArmySettings draft={draft} library={library} onChange={setDraft} />
          <UnitPicker draft={draft} library={library} onChange={setDraft} />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <IssuesPanel issues={issues} />
          <EntryList draft={draft} library={library} points={points.entries} issues={issues} onChange={setDraft} />
        </div>
      </div>
      <footer className="mt-auto text-xs text-text/60">
        {SOURCE[status]} Rules are written by the community and are not official Games Workshop material.
      </footer>
    </main>
  );
}
