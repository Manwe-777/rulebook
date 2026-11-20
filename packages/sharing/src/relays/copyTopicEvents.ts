import { RelayPool, type WebSocketConstructor } from 'tool-db';

import { TOPIC } from '../constants';

/** tool-db's kinds for values (NIP-78 application data) and for CRDT change sets. */
const VALUE_KIND = 30078;
const CRDT_KIND = 1078;

/** A pool connected to these relays, once each has connected or `timeoutMs` passed. */
async function connected(urls: string[], WebSocket: WebSocketConstructor, timeoutMs: number): Promise<RelayPool> {
  let ready: () => void = () => {};
  const done = new Promise<void>((resolve) => (ready = resolve));
  const pool = new RelayPool(urls, { WebSocket, onStatus: (n) => n === urls.length && ready() });

  await Promise.race([done, new Promise((resolve) => setTimeout(resolve, timeoutMs))]);

  return pool;
}

/**
 * Copies every message of the Rulebook topic stored on `from` into `to` (values and map change sets), as signed: `to` checks each one with its own
 * write rules, so nothing a relay wouldn't accept from a client gets in. Returns how many were found and accepted.
 */
export async function copyTopicEvents(
  from: string[],
  to: string,
  options: { WebSocket?: WebSocketConstructor; timeoutMs?: number } = {},
): Promise<{ found: number; accepted: number }> {
  const { WebSocket = globalThis.WebSocket as unknown as WebSocketConstructor, timeoutMs = 20_000 } = options;

  if (!from.length) return { found: 0, accepted: 0 };

  const source = await connected(from, WebSocket, timeoutMs);
  const target = await connected([to], WebSocket, timeoutMs);

  try {
    const found = await source.query([{ kinds: [VALUE_KIND, CRDT_KIND], '#t': [TOPIC] }], timeoutMs);
    // Oldest first, so role lists arrive before the writes they allow.
    const events = [...found].sort((a, b) => a.created_at - b.created_at);
    let accepted = 0;

    for (const event of events) {
      const result = await target.publish(event, timeoutMs);

      if (result.accepted.length) accepted++;
    }

    return { found: events.length, accepted };
  } finally {
    source.close();
    target.close();
  }
}
