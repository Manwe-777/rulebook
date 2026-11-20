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
  /** Where apps reach this relay (`wss://…`); it announces itself with it. Left out, it doesn't announce. */
  publicUrl?: string;
  /** A short name shown in the apps' relay list. */
  name: string;
  /** Relays to announce on and copy data from, besides the ones that announced themselves. */
  bootstrap: string[];
}

const HEX_KEY = /^[0-9a-f]{64}$/;
const RELAY_URL = /^wss?:\/\/\S+$/;

/** The owner key as hex, null when set empty (an open store), or empty when it isn't a key. */
function readOwner(value: string | undefined, projectOwner: string): string | null {
  const text = (value ?? projectOwner).trim();

  return text ? ownerKeyHex(text) : null;
}

/** Relays from a comma-separated setting: left out, the project's (`project.json`); empty, none. */
function readRelays(value: string | undefined, project: string[]): string[] {
  if (value === undefined) return project;

  return value
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
}

/** The network settings: where this relay announces itself, under what name, and which relays it syncs with. */
function readNetwork(
  env: Record<string, string | undefined>,
  projectRelays: string[],
): Pick<RelayConfig, 'publicUrl' | 'name' | 'bootstrap'> & { errors: string[] } {
  const publicUrl = env.RELAY_PUBLIC_URL?.trim() || undefined;
  const bootstrap = readRelays(env.RELAY_BOOTSTRAP, projectRelays);

  const errors = [
    ...(publicUrl && !RELAY_URL.test(publicUrl) ? ['RELAY_PUBLIC_URL must be a ws:// or wss:// address'] : []),
    ...(bootstrap.every((r) => RELAY_URL.test(r))
      ? []
      : ['RELAY_BOOTSTRAP must be ws:// or wss:// addresses, comma separated']),
  ];

  return { publicUrl, name: (env.RELAY_NAME ?? '').trim().slice(0, 60), bootstrap, errors };
}

/**
 * Reads `RULEBOOK_OWNER` (left out: the project's owner from `project.json`; empty: an open store), `PORT`, `HOST`,
 * `DATA_DIR`, `RELAY_SECRET_KEY`, `RELAY_PUBLIC_URL`, `RELAY_NAME` and `RELAY_BOOTSTRAP` (left out: `project.json`'s
 * relays; empty: none), or says what is wrong with them.
 */
export function readConfig(
  env: Record<string, string | undefined>,
  project: { owner: string; relays: string[] } = PROJECT,
): RelayConfig | { errors: string[] } {
  const owner = readOwner(env.RULEBOOK_OWNER, project.owner);
  const port = Number(env.PORT ?? 8080);
  const secretKey = env.RELAY_SECRET_KEY || undefined;
  const { errors: networkErrors, ...network } = readNetwork(env, project.relays);

  const checks: [boolean, string][] = [
    [owner !== '', 'RULEBOOK_OWNER must be the owner public key (npub or 64 hex characters), or left empty'],
    [Number.isInteger(port) && port >= 1 && port <= 65535, 'PORT must be a port number'],
    [!secretKey || HEX_KEY.test(secretKey), 'RELAY_SECRET_KEY must be a secret key in hex (64 characters)'],
  ];

  const errors = [...checks.filter(([ok]) => !ok).map(([, message]) => message), ...networkErrors];

  if (errors.length) return { errors };

  return { owner, port, host: env.HOST ?? '0.0.0.0', dataDir: env.DATA_DIR ?? './data', secretKey, ...network };
}
