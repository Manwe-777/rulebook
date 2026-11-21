import type { WebSocketConstructor } from 'tool-db';

import { connectPool } from './connectPool';
import { topicEvents } from './topicEvents';

/**
 * Copies every message of the Rulebook topic stored on `from` into `to` (values and map change sets), as signed:
 * `to` checks each one with its own write rules, so nothing a relay wouldn't accept from a client gets in. Returns how
 * many were found and accepted.
 */
export async function copyTopicEvents(
  from: string[],
  to: string,
  options: { WebSocket?: WebSocketConstructor; timeoutMs?: number } = {},
): Promise<{ found: number; accepted: number }> {
  const { WebSocket = globalThis.WebSocket as unknown as WebSocketConstructor, timeoutMs = 20_000 } = options;

  if (!from.length) return { found: 0, accepted: 0 };

  const source = await connectPool(from, WebSocket, timeoutMs);
  const target = await connectPool([to], WebSocket, timeoutMs);

  try {
    const events = await topicEvents(source, timeoutMs);
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
