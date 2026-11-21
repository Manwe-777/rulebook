import { RelayPool, type WebSocketConstructor } from 'tool-db';

/** A pool connected to these relays, once each has connected or `timeoutMs` passed. */
export async function connectPool(
  urls: string[],
  WebSocket: WebSocketConstructor,
  timeoutMs: number,
): Promise<RelayPool> {
  let ready: () => void = () => {};
  const done = new Promise<void>((resolve) => (ready = resolve));
  const pool = new RelayPool(urls, { WebSocket, onStatus: (n) => n === urls.length && ready() });

  await Promise.race([done, new Promise((resolve) => setTimeout(resolve, timeoutMs))]);

  return pool;
}
