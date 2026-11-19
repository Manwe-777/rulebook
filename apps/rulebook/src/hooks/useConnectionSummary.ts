import { type ConnectionSummary, connectionSummary } from '../identity/connectionSummary';
import { useAccount } from '../identity/useAccount';

/** The relay link and signing state as the header shows it. */
export function useConnectionSummary(): ConnectionSummary {
  const { connection, pubkey, locked } = useAccount();

  return connectionSummary(connection, locked ? 'locked' : pubkey ? 'ready' : 'anonymous');
}
