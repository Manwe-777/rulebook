import { checkDataset } from '@rulebook/rules';

import { useLibrary } from '../../hooks/useLibrary';
import ErrorsPanel from '../common/ErrorsPanel';
import IssuesPanel from '../common/IssuesPanel';
import FactionCard from './FactionCard';

export default function HomePage() {
  const library = useLibrary();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold tracking-wide uppercase">Factions</h2>
      {library.factions.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {library.factions.map((f) => (
            <FactionCard key={f.id} faction={f} />
          ))}
        </div>
      ) : (
        <p className="text-text/70">No factions loaded.</p>
      )}
      <ErrorsPanel errors={library.errors} />
      <IssuesPanel issues={checkDataset(library)} />
    </div>
  );
}
