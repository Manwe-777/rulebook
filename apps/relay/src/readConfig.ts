import { ownerKeyHex } from '@rulebook/sharing';

/** Settings of a relay node, read from environment variables. */
export interface RelayConfig {
  /** Owner public key, hex (an npub is accepted and converted). Must match the one built into the apps. */
  owner: string;
  port: number;
  host: string;
  /** LevelDB folder. */
  dataDir: string;
  /** Node secret key, hex; a new one is made on every start when left out. */
  secretKey?: string;
}

const HEX_KEY = /^[0-9a-f]{64}$/;

/** Reads `RULEBOOK_OWNER`, `PORT`, `HOST`, `DATA_DIR` and `RELAY_SECRET_KEY`, or says what is wrong with them. */
export function readConfig(env: Record<string, string | undefined>): RelayConfig | { errors: string[] } {
  const owner = ownerKeyHex(env.RULEBOOK_OWNER ?? '');
  const port = Number(env.PORT ?? 8080);
  const secretKey = env.RELAY_SECRET_KEY || undefined;

  const checks: [boolean, string][] = [
    [HEX_KEY.test(owner), 'RULEBOOK_OWNER must be the owner public key (npub or 64 hex characters)'],
    [Number.isInteger(port) && port >= 1 && port <= 65535, 'PORT must be a port number'],
    [!secretKey || HEX_KEY.test(secretKey), 'RELAY_SECRET_KEY must be a secret key in hex (64 characters)'],
  ];

  const errors = checks.filter(([ok]) => !ok).map(([, message]) => message);

  if (errors.length) return { errors };

  return { owner, port, host: env.HOST ?? '0.0.0.0', dataDir: env.DATA_DIR ?? './data', secretKey };
}
