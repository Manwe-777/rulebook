import type { RulebookClient } from '@rulebook/sharing';
import { npubEncode } from 'tool-db';

import { useAsync } from '../../hooks/useAsync';
import { BUTTON } from '../common/styles';

/** People asking to contribute, each with a button to add them. */
interface Props {
  client: RulebookClient;
  faction: string;
  rolesVersion: number;
  onChange: () => void;
}

export default function RequestsPanel({ client, faction, rolesVersion, onChange }: Props) {
  const { data } = useAsync(() => client.requests(faction), [client, faction, rolesVersion]);

  const add = async (author: string) => {
    await client.setContributors(faction, [...(await client.roles.contributors(faction)), author]);
    onChange();
  };

  if (!data?.length) return <p className="text-ink-muted">No open requests.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {data.map((r) => (
        <li key={r.author} className="dotted-rule flex flex-wrap items-center gap-2 pb-2">
          <span className="font-mono text-xs">{npubEncode(r.author).slice(0, 24)}…</span>
          <span className="flex-1">{r.message}</span>
          <button type="button" className={BUTTON} onClick={() => add(r.author)}>
            Add as contributor
          </button>
        </li>
      ))}
    </ul>
  );
}
