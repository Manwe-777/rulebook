import type { RulebookClient } from '@rulebook/sharing';
import { useState } from 'react';

import { useAsync } from '../../hooks/useAsync';
import { BUTTON, INPUT, LABEL } from '../common/styles';

/** Publishes the accepted records as a new release, and lists the trusted releases. */
export default function ReleasePanel({ client, faction }: { client: RulebookClient; faction: string }) {
  const { data, reload } = useAsync(() => client.releases(faction), [client, faction]);
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const publish = async () => {
    setBusy(true);
    await client.release(faction, version, notes);
    setVersion('');
    setNotes('');
    setBusy(false);
    reload();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className={LABEL}>
          Version
          <input className={INPUT} placeholder="2026-11" value={version} onChange={(e) => setVersion(e.target.value)} />
        </label>
        <label className={`${LABEL} flex-1`}>
          What changed
          <input className={INPUT} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <button type="button" className={BUTTON} disabled={!version || busy} onClick={publish}>
          Release
        </button>
      </div>
      <ul>
        {data?.map((r) => (
          <li key={r.hash} className="dotted-rule py-1">
            <strong>{r.version}</strong> <span className="text-sm text-ink-muted">{r.date.slice(0, 10)}</span> {r.notes}
          </li>
        ))}
      </ul>
    </div>
  );
}
