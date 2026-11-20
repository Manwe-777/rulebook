import type { Faction } from '@rulebook/rules';
import { useContext } from 'react';
import { Link } from 'react-router';

import { LibraryContext } from '../../library/LibraryContext';

/** The factions whose datasheets and detachments this faction's armies also use, linking to them. */
export default function IncludedFactions({ faction }: { faction: Faction }) {
  const library = useContext(LibraryContext);
  const included = faction.includes.flatMap((id) => library?.faction(id) ?? []);

  if (!included.length) return null;

  return (
    <p className="rounded bg-parchment-dark px-3 py-2 text-sm">
      Armies also use the datasheets and detachments of{' '}
      {included.map((f, i) => (
        <span key={f.id}>
          {i > 0 && ', '}
          <Link to={`/${f.id}`} className="font-semibold underline">
            {f.name}
          </Link>
        </span>
      ))}
      {faction.excludes.length > 0 && `, except ${faction.excludes.length} they can't take`}.
    </p>
  );
}
