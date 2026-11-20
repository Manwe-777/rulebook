import { Link } from 'react-router';

import { useLibrary } from '../../hooks/useLibrary';
import DataChecks from '../common/DataChecks';
import FactionCard from './FactionCard';

export default function HomePage() {
  const library = useLibrary();

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/stratagems"
        className="self-start rounded bg-bar px-3 py-1 font-bold tracking-wide text-white uppercase hover:bg-bar-dark"
      >
        Core stratagems
      </Link>
      <h2 className="text-xl font-bold tracking-wide uppercase">Factions</h2>
      {library.factions.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {library.factions.map((f) => (
            <FactionCard key={f.id} faction={f} units={library.unitCount(f.id)} />
          ))}
        </div>
      ) : (
        <p className="text-text/70">No factions loaded.</p>
      )}
      <DataChecks />
    </div>
  );
}
