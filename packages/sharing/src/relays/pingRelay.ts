/** The parts of WebSocket a ping needs; browsers and Node 22+ have it. */
type Socket = { onopen: (() => void) | null; onerror: (() => void) | null; close: () => void };

/**
 * How long a relay takes to accept a connection, in ms, or null when it doesn't within `timeoutMs`. Opens a WebSocket
 * and closes it again; nothing is sent.
 */
export function pingRelay(
  url: string,
  timeoutMs = 5000,
  open: (url: string) => Socket = (u) => new WebSocket(u) as unknown as Socket,
): Promise<number | null> {
  const start = Date.now();

  return new Promise((resolve) => {
    let socket: Socket;

    try {
      socket = open(url);
    } catch {
      resolve(null);

      return;
    }

    const done = (result: number | null) => {
      clearTimeout(timer);
      socket.onopen = socket.onerror = null;
      socket.close();
      resolve(result);
    };

    const timer = setTimeout(() => done(null), timeoutMs);

    socket.onopen = () => done(Date.now() - start);
    socket.onerror = () => done(null);
  });
}
