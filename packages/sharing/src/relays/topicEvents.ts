import type { NostrEvent, RelayPool } from 'tool-db';

import { TOPIC } from '../constants';

/** tool-db's kinds for values (NIP-78 application data) and for CRDT change sets. */
const VALUE_KIND = 30078;
const CRDT_KIND = 1078;

/** Every message of the Rulebook topic the pool's relays hold (values and map change sets), oldest first. */
export async function topicEvents(pool: RelayPool, timeoutMs: number): Promise<NostrEvent[]> {
  const found = await pool.query([{ kinds: [VALUE_KIND, CRDT_KIND], '#t': [TOPIC] }], timeoutMs);

  // Oldest first, so role lists arrive before the writes they allow.
  return [...found].sort((a, b) => a.created_at - b.created_at);
}
