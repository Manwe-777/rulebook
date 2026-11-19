import { useAccount } from '../identity/useAccount';
import { useAsync } from './useAsync';

export type Role = 'owner' | 'maintainer' | 'contributor' | 'reader';

/** The signed-in user's role in a faction (`reader` with no identity or no relays). */
export function useRole(faction: string): { role: Role; loading: boolean; reload: () => void } {
  const { client, pubkey } = useAccount();

  const { data, loading, reload } = useAsync<Role>(
    client && pubkey
      ? async () => {
          if (pubkey === client.roles.owner) return 'owner';
          if (await client.roles.isMaintainer(faction, pubkey)) return 'maintainer';

          return (await client.roles.isContributor(faction, pubkey)) ? 'contributor' : 'reader';
        }
      : null,
    [client, pubkey, faction],
  );

  return { role: client && pubkey ? (data ?? 'reader') : 'reader', loading, reload };
}
