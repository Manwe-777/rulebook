import type { Faction } from '@rulebook/rules';
import { Link } from 'react-router';

/** `Factions / <faction>` links above a unit or detachment page. */
export default function Breadcrumbs({ faction }: { faction: Faction }) {
  return (
    <nav className="text-sm text-text/70">
      <Link to="/" className="hover:text-text">
        Factions
      </Link>
      {' / '}
      <Link to={`/${faction.id}`} className="hover:text-text">
        {faction.name}
      </Link>
    </nav>
  );
}
