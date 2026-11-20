import { Link } from 'react-router';

import { useLibrary } from '../../hooks/useLibrary';
import { useNow } from '../../hooks/useNow';
import { useReleases } from '../../hooks/useReleases';
import { releaseLine } from '../../utils/releaseLine';
import DataChecks from '../common/DataChecks';
import RulesFreshness from '../common/RulesFreshness';
import FactionCard from './FactionCard';

export default function HomePage() {
  const library = useLibrary();
  const { releases } = useReleases();
  const now = useNow();
  const releaseOf = (id: string) => releases.find((r) => r.faction === id);
  const core = releaseOf('core');

  return (
    <div className="flex flex-col gap-6">
      <RulesFreshness />
      <Link
        to="/stratagems"
        className="self-start rounded bg-bar px-3 py-1 font-bold tracking-wide text-white uppercase hover:bg-bar-dark"
      >
        Core stratagems
      </Link>
      {core && <p className="-mt-4 text-xs text-text/60">Core rules {releaseLine(core, now)}</p>}
      <h2 className="text-xl font-bold tracking-wide uppercase">Factions</h2>
      {library.factions.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {library.factions.map((f) => (
            <FactionCard key={f.id} faction={f} units={library.unitCount(f.id)} release={releaseOf(f.id)} now={now} />
          ))}
        </div>
      ) : (
        <p className="text-text/70">No factions loaded.</p>
      )}
      <DataChecks />
    </div>
  );
}
