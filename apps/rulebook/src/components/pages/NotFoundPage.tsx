import { useContext } from 'react';
import { Link } from 'react-router';

import { SourceContext } from '../../library/SourceContext';

/** Shown for unknown addresses; while rules are still loading from the relays, the page may just not be here yet. */
export default function NotFoundPage() {
  if (['loading', 'cached'].includes(useContext(SourceContext)))
    return <p className="text-text/70">Loading rules from the relays…</p>;

  return (
    <div className="flex flex-col items-start gap-3">
      <h2 className="text-2xl font-bold uppercase">Not found</h2>
      <p className="text-text/70">There is no faction, datasheet or detachment at this address.</p>
      <Link to="/" className="underline">
        Back to factions
      </Link>
    </div>
  );
}
