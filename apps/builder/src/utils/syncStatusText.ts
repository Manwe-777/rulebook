import { formatAgo } from '@rulebook/rules';

import type { SyncStatus } from '../hooks/useArmySync';

/** One line saying how syncing is going, e.g. `Synced 2 min ago`. */
export function syncStatusText(status: SyncStatus, lastSync: number | null, now: number): string {
  if (status === 'connecting') return 'Connecting to the relays…';
  if (status === 'failed') return "Can't reach the relays right now. Your lists are still saved on this device.";
  if (status === 'synced') return lastSync ? `Synced ${formatAgo(lastSync, now)}` : 'Synced';

  return '';
}
