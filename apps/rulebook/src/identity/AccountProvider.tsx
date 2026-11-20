import type { RulebookClient } from '@rulebook/sharing';
import { loadStoredIdentity, saveStoredIdentity, type StoredIdentity } from '@rulebook/sharing/identity';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { KEY_PROTECTION_LOGN, OWNER_KEY, RELAYS } from '../constants';
import { type Account, AccountContext } from './AccountContext';
import type { Connection } from './connectionSummary';

const online = RELAYS.length > 0 && OWNER_KEY !== '';

// tool-db and the key code load after the first render, so readers get the page without them.
const keys = () => import('tool-db');

const connect: typeof import('./connectClient').connectClient = (...args) =>
  import('./connectClient').then((m) => m.connectClient(...args));

const readKey: typeof import('./readSecretKey').readSecretKey = (...args) =>
  import('./readSecretKey').then((m) => m.readSecretKey(...args));

type Signer = { extension: true } | { secret: string } | null;

/** The secret key in use: stored in the browser, or unlocked for this visit. */
function initialSecret(stored: StoredIdentity | null): string | null {
  return stored?.mode === 'browser' ? stored.secret : null;
}

/** Holds how this browser signs and the connected client. Keys never leave the browser. */
export default function AccountProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(() => (typeof window === 'undefined' ? null : loadStoredIdentity()));
  const [secret, setSecret] = useState(() => initialSecret(stored));
  // The public key the client opened for a signer signs with; learned once connected.
  const [me, setMe] = useState<{ id: string; pubkey: string } | null>(null);
  const [client, setClient] = useState<RulebookClient | null>(null);
  const signer: Signer = stored?.mode === 'extension' ? { extension: true } : secret ? { secret } : null;
  const signerId = signer ? ('secret' in signer ? signer.secret : 'extension') : 'anonymous';
  // The link state of the client opened for `id`; a different id means a new client is still connecting.
  const [link, setLink] = useState<{ id: string; state: Connection } | null>(null);
  const connection: Connection = !online ? 'offline' : link?.id === signerId ? link.state : 'connecting';

  // Whether the browser extension failed to answer for this signer; the app then reads without signing.
  const [stalled, setStalled] = useState<string | null>(null);

  useEffect(() => {
    if (!online) return;

    let closed = false;
    const report = (state: Connection) => !closed && setLink({ id: signerId, state });
    const onLink = (up: boolean) => report(up ? 'connected' : 'reconnecting');
    const dbs: Promise<{ db: { close: () => void } }>[] = [];

    const use = (opening: ReturnType<typeof connect>) => {
      dbs.push(opening);

      return opening.then(({ client: c }) => {
        if (closed) return;

        setClient(c);
        report('connected');
        if (c.me && signer) setMe({ id: signerId, pubkey: c.me });
      });
    };

    use(connect(RELAYS, OWNER_KEY, signer, onLink)).catch(() => {
      if (closed) return;

      // A browser extension that never answers mustn't stop reading: read the relays without signing.
      if (signer && 'extension' in signer) {
        setStalled(signerId);
        use(connect(RELAYS, OWNER_KEY, null, onLink)).catch(() => !closed && report('failed'));
      } else {
        setClient(null);
        report('failed');
      }
    });

    return () => {
      closed = true;
      for (const opening of dbs) opening.then(({ db }) => db.close()).catch(() => undefined);
    };
    // The signer object changes every render; its identity is signerId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerId]);

  const remember = useCallback((next: StoredIdentity | null, nextSecret: string | null) => {
    saveStoredIdentity(next);
    setStored(next);
    setSecret(nextSecret);
  }, []);

  const account = useMemo<Account>(() => {
    const pubkey = signerId !== 'anonymous' && me?.id === signerId ? me.pubkey : null;

    return {
      online,
      connection,
      client,
      stored,
      pubkey,
      locked: stored?.mode === 'protected' && !secret,
      extensionStalled: stalled === signerId,
      ensureKey: async () => {
        if (!stored) {
          const fresh = (await keys()).generateSecretKey();

          remember({ mode: 'browser', secret: fresh }, fresh);
          const { client: c } = await connect(RELAYS, OWNER_KEY, { secret: fresh });

          setClient(c);
          setMe({ id: fresh, pubkey: c.me });

          return c;
        }

        return client;
      },
      importKey: async (text, password) => {
        const result = await readKey(text, password);

        if ('error' in result) return result.error;

        remember({ mode: 'browser', secret: result.secret }, result.secret);

        return null;
      },
      protect: async (password) => {
        if (secret)
          remember(
            {
              mode: 'protected',
              ncryptsec: await (await keys()).encryptSecretKey(secret, password, KEY_PROTECTION_LOGN),
            },
            secret,
          );
      },
      unlock: async (password) => {
        if (stored?.mode !== 'protected') return null;

        const result = await readKey(stored.ncryptsec, password);

        if ('error' in result) return result.error;

        setSecret(result.secret);

        return null;
      },
      switchToExtension: async () => {
        if (!('nostr' in window)) return 'No Nostr browser extension found. Install one (Alby, nos2x…) and reload.';

        remember({ mode: 'extension' }, null);

        return null;
      },
      forget: () => remember(null, null),
      exportNsec: async () => (secret ? (await keys()).nsecEncode(secret) : null),
      exportNcryptsec: async (password) =>
        secret ? (await keys()).encryptSecretKey(secret, password, KEY_PROTECTION_LOGN) : null,
    };
  }, [client, connection, stored, secret, signerId, me, remember, stalled]);

  return <AccountContext value={account}>{children}</AccountContext>;
}
