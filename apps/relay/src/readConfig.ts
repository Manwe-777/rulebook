import { ownerKeyHex } from '@rulebook/sharing';
import { PROJECT } from '@rulebook/sharing/project';

/** Settings of a relay node, read from environment variables. */
export interface RelayConfig {
  /**
   * Owner public key, hex (an npub is accepted and converted). Must match the one built into the apps. Without it the
   * relay is an open store and doesn't check who may write what.
   */
  owner: string | null;
  port: number;
  host: string;
  /** LevelDB folder. */
  dataDir: string;
  /** Node secret key, hex; a new one is made on every start when left out. */
  secretKey?: string;
}

const HEX_KEY = /^[0-9a-f]{64}$/;

/** The owner key as hex, null when set empty (an open store), or empty when it isn't a key. */
function readOwner(value: string | undefined, projectOwner: string): string | null {
  const text = (value ?? projectOwner).trim();

  return text ? ownerKeyHex(text) : null;
}

/**
 * Reads `RULEBOOK_OWNER` (left out: the project's owner from `project.json`; empty: an open store), `PORT`, `HOST`,
 * `DATA_DIR` and `RELAY_SECRET_KEY`, or says what is wrong with them.
 */
export function readConfig(
  env: Record<string, string | undefined>,
  projectOwner = PROJECT.owner,
): RelayConfig | { errors: string[] } {
  const owner = readOwner(env.RULEBOOK_OWNER, projectOwner);
  const port = Number(env.PORT ?? 8080);
  const secretKey = env.RELAY_SECRET_KEY || undefined;

  const checks: [boolean, string][] = [
    [owner !== '', 'RULEBOOK_OWNER must be the owner public key (npub or 64 hex characters), or left empty'],
    [Number.isInteger(port) && port >= 1 && port <= 65535, 'PORT must be a port number'],
    [!secretKey || HEX_KEY.test(secretKey), 'RELAY_SECRET_KEY must be a secret key in hex (64 characters)'],
  ];

  const errors = checks.filter(([ok]) => !ok).map(([, message]) => message);

  if (errors.length) return { errors };

  return { owner, port, host: env.HOST ?? '0.0.0.0', dataDir: env.DATA_DIR ?? './data', secretKey };
}
