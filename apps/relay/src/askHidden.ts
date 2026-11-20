import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';

/**
 * Asks questions on the terminal and reads each answer without showing it (for passwords); works when typed or piped.
 * Call `close` when done.
 */
export function askHidden(): { ask: (question: string) => Promise<string>; close: () => void } {
  // readline echoes what is typed through its output; this one drops the echo so passwords stay off the screen.
  const silent = new Writable({ write: (_chunk, _encoding, done) => done() });
  const prompt = createInterface({ input: process.stdin, output: silent, terminal: Boolean(process.stdin.isTTY) });
  const lines = prompt[Symbol.asyncIterator]();

  return {
    ask: async (question) => {
      process.stdout.write(question);

      const answer = ((await lines.next()).value as string | undefined) ?? '';

      process.stdout.write('\n');

      return answer;
    },
    close: () => prompt.close(),
  };
}
