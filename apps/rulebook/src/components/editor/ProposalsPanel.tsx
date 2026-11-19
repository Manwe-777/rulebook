import type { RulebookClient } from '@rulebook/sharing';

import { useAsync } from '../../hooks/useAsync';
import ProposalCard from './ProposalCard';

/** Proposals for the faction that nobody has reviewed yet. */
export default function ProposalsPanel({ client, faction }: { client: RulebookClient; faction: string }) {
  const { data, loading, reload } = useAsync(() => client.proposals(faction), [client, faction]);
  const open = (data ?? []).filter((p) => !p.review);

  if (loading && !data) return <p>Loading proposals…</p>;
  if (!open.length) return <p className="text-ink-muted">No open proposals.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {open.map((p) => (
        <ProposalCard key={p.key} client={client} faction={faction} proposal={p} onDone={reload} />
      ))}
    </ul>
  );
}
