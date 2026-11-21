import type { NostrEvent, WebSocketConstructor } from 'tool-db';

import { connectPool } from './connectPool';
import { topicEvents } from './topicEvents';

export interface PushOptions {
  /** Message ids each relay already has from us (or refused for good), by relay address. */
  done?: Record<string, string[]>;
  /** Pause between two messages to the same relay, so public relays don't rate-limit the burst. */
  spacingMs?: number;
  timeoutMs?: number;
  WebSocket?: WebSocketConstructor;
}

/** What one relay did with what we sent: the ids now done for it, and why it stopped early, if it did. */
export interface PushResult {
  done: string[];
  sent: number;
  stopped?: string;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Sends one relay the messages it doesn't have from us yet, one at a time; stops when it says to slow down. */
async function pushTo(url: string, events: NostrEvent[], options: Required<Omit<PushOptions, 'done'>>, done: string[]) {
  const known = new Set(done);
  const pool = await connectPool([url], options.WebSocket, options.timeoutMs);
  // Ids of messages we no longer hold (replaced values) are forgotten, so the list doesn't grow for ever.
  const current = new Set(events.map((e) => e.id));
  const result: PushResult = { done: done.filter((id) => current.has(id)), sent: 0 };

  try {
    for (const event of events.filter((e) => !known.has(e.id))) {
      const { accepted, rejected } = await pool.publish(event, options.timeoutMs);
      const reason = rejected[0]?.reason ?? '';

      if (reason.startsWith('rate-limited')) return { ...result, stopped: reason };

      // Kept, already there, or refused for good: either way, don't send it again. No answer: try next round.
      if (accepted.length || rejected.length) result.done.push(event.id);
      if (accepted.length) result.sent++;

      await wait(options.spacingMs);
    }

    return result;
  } finally {
    pool.close();
  }
}

/**
 * Sends every message of the Rulebook topic stored on `from` to each relay in `to`, as signed, skipping those each
 * already has from us, so data that only a project relay holds (an index written while a public relay was down or
 * busy) reaches the public relays too. Relays apply their own rules to each message. Returns, per relay, the ids now
 * done (to pass as `done` next time) and how many it took.
 */
export async function pushTopicEvents(from: string, to: string[], options: PushOptions = {}) {
  const settings = {
    spacingMs: options.spacingMs ?? 200,
    timeoutMs: options.timeoutMs ?? 20_000,
    WebSocket: options.WebSocket ?? (globalThis.WebSocket as unknown as WebSocketConstructor),
  };

  const source = await connectPool([from], settings.WebSocket, settings.timeoutMs);
  const events = await topicEvents(source, settings.timeoutMs).finally(() => source.close());
  const results: Record<string, PushResult> = {};

  await Promise.all(
    to.map(async (url) => {
      results[url] = await pushTo(url, events, settings, options.done?.[url] ?? []);
    }),
  );

  return results;
}
