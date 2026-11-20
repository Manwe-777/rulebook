import type { Library } from '@rulebook/rules';
import { useState } from 'react';

import { BUTTON, INPUT, LABEL } from '../styles';

/** Starts a new army for the chosen faction. */
export default function NewArmyForm({ library, onCreate }: { library: Library; onCreate: (faction: string) => void }) {
  const [faction, setFaction] = useState(library.factions[0]?.id ?? '');
  const chosen = library.factions.some((f) => f.id === faction) ? faction : (library.factions[0]?.id ?? '');

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (chosen) onCreate(chosen);
      }}
    >
      <label className={LABEL}>
        Faction
        <select className={INPUT} value={chosen} onChange={(e) => setFaction(e.target.value)}>
          {library.factions.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className={BUTTON} disabled={!chosen}>
        New army
      </button>
    </form>
  );
}
