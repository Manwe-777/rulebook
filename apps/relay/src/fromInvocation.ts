import { resolve } from 'node:path';

/**
 * A path as the user typed it, resolved from the folder they ran the command in: `npm run -w` runs scripts from the
 * workspace folder, but npm keeps the original one in INIT_CWD.
 */
export function fromInvocation(path: string, env: Record<string, string | undefined> = process.env): string {
  return resolve(env.INIT_CWD ?? process.cwd(), path);
}
