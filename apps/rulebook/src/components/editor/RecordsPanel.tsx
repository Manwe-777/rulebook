import type { Faction } from '@rulebook/rules';
import { slugify } from '@rulebook/rules';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { BUTTON_QUIET, INPUT } from '../common/styles';

/** Every record of the faction with an Edit link, and a way to start a new unit or detachment. */
export default function RecordsPanel({ faction }: { faction: Faction }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const records = [
    { kind: 'faction', id: faction.id, name: `${faction.name} (army rules)` },
    ...faction.detachments.map((d) => ({ kind: 'detachment', id: d.id, name: `${d.name} (detachment)` })),
    ...faction.units.map((u) => ({ kind: 'unit', id: u.id, name: u.name })),
  ];

  const create = (kind: string) =>
    navigate(`/${faction.id}/edit/${kind}/${slugify(name)}?name=${encodeURIComponent(name)}`);

  return (
    <div className="flex flex-col gap-3">
      <ul>
        {records.map((r) => (
          <li key={`${r.kind}/${r.id}`} className="dotted-rule py-1">
            <Link to={`/${faction.id}/edit/${r.kind}/${r.id}`} className="font-semibold underline">
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="New record name"
          placeholder="Name"
          className={INPUT}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="button" className={BUTTON_QUIET} disabled={!slugify(name)} onClick={() => create('unit')}>
          New unit
        </button>
        <button type="button" className={BUTTON_QUIET} disabled={!slugify(name)} onClick={() => create('detachment')}>
          New detachment
        </button>
      </div>
    </div>
  );
}
