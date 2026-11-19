import type { RulebookClient } from '@rulebook/sharing';

import { useAsync } from '../../hooks/useAsync';
import KeyListEditor from './KeyListEditor';

/** Contributors (maintainers edit) and, for the owner, maintainers of the faction. */
interface Props {
  client: RulebookClient;
  faction: string;
  owner: boolean;
  rolesVersion: number;
  onChange: () => void;
}

export default function RolesPanel({ client, faction, owner, rolesVersion, onChange }: Props) {
  const { data } = useAsync(
    async () => ({
      maintainers: await client.roles.maintainers(faction),
      contributors: await client.roles.contributors(faction),
    }),
    [client, faction, rolesVersion],
  );

  if (!data) return <p>Loading…</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h4 className="mb-1 font-bold uppercase">Contributors</h4>
        <KeyListEditor
          keys={data.contributors}
          onSave={(keys) => client.setContributors(faction, keys).then(onChange)}
        />
      </div>
      {owner && (
        <div>
          <h4 className="mb-1 font-bold uppercase">Maintainers</h4>
          <KeyListEditor
            keys={data.maintainers}
            onSave={(keys) => client.setMaintainers(faction, keys).then(onChange)}
          />
        </div>
      )}
    </div>
  );
}
