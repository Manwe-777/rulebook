import { formatAgo } from '@rulebook/rules';

import { useRelayStatus } from '../../hooks/useRelayStatus';
import SectionPanel from '../datasheet/SectionPanel';

const STATUS = {
  fixed: 'Always used (project.json)',
  used: 'Used by this browser',
  unused: 'Not used here yet, or dropped after failed checks',
};

/** Every relay the site knows of: where it is, who runs it, when it last announced itself, and if it answers. */
export default function RelaysPanel() {
  const { rows, loading, error, readAt } = useRelayStatus();

  return (
    <SectionPanel title="Relays">
      {loading && <p>Reading relay announcements…</p>}
      {error && <p className="text-red-800">{error}</p>}
      {!loading && !rows.length && <p>No relays are set up: the site shows the demo only.</p>}
      <ul className="flex flex-col divide-y divide-rule">
        {rows.map((r) => (
          <li key={r.url} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
            <div className="min-w-0">
              <p className="font-bold break-all">
                {r.name && <span>{r.name} · </span>}
                {r.url}
              </p>
              <p className="text-sm text-ink-muted">
                {STATUS[r.status]}
                {r.announced && ` · announced ${formatAgo(Date.parse(r.announced), readAt)}`}
                {r.key && ` · key ${r.key.slice(0, 8)}…`}
              </p>
            </div>
            <span className={`text-sm font-bold ${r.ping === null ? 'text-red-800' : ''}`}>
              {r.ping === undefined ? 'checking…' : r.ping === null ? 'no answer' : `${r.ping} ms`}
            </span>
          </li>
        ))}
      </ul>
    </SectionPanel>
  );
}
