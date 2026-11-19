import type { RulebookClient } from '@rulebook/sharing';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { encryptSecretKey, generateSecretKey, getPublicKey, nsecEncode } from 'tool-db';

import { KEY_PROTECTION_LOGN, OWNER_KEY, RELAYS } from '../constants';
import { type Account, AccountContext } from './AccountContext';
import { connectClient } from './connectClient';
import type { Connection } from './connectionSummary';
import { readSecretKey } from './readSecretKey';
import { loadStoredIdentity, saveStoredIdentity, type StoredIdentity } from './storedIdentity';

const online = RELAYS.length > 0 && OWNER_KEY !== '';

type Signer = { extension: true } | { secret: string } | null;

/** The secret key in use: stored in the browser, or unlocked for this visit. */
function initialSecret(stored: StoredIdentity | null): string | null {
  return stored?.mode === 'browser' ? stored.secret : null;
}

/** Holds how this browser signs and the connected client. Keys never leave the browser. */
export default function AccountProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(() => (typeof window === 'undefined' ? null : loadStoredIdentity()));
  const [secret, setSecret] = useState(() => initialSecret(stored));
  const [extensionKey, setExtensionKey] = useState<string | null>(null);
  const [client, setClient] = useState<RulebookClient | null>(null);
  const signer: Signer = stored?.mode === 'extension' ? { extension: true } : secret ? { secret } : null;
  const signerId = signer ? ('secret' in signer ? signer.secret : 'extension') : 'anonymous';
  // The link state of the client opened for `id`; a different id means a new client is still connecting.
  const [link, setLink] = useState<{ id: string; state: Connection } | null>(null);
  const connection: Connection = !online ? 'offline' : link?.id === signerId ? link.state : 'connecting';

  useEffect(() => {
    if (!online) return;

    let closed = false;
    const report = (state: Connection) => !closed && setLink({ id: signerId, state });
    const opened = connectClient(RELAYS, OWNER_KEY, signer, (up) => report(up ? 'connected' : 'reconnecting'));

    opened
      .then(({ client: c }) => {
        if (closed) return;

        setClient(c);
        report('connected');
        if (signer && 'extension' in signer) setExtensionKey(c.me || null);
      })
      .catch(() => {
        if (closed) return;

        setClient(null);
        report('failed');
      });

    return () => {
      closed = true;
      opened.then(({ db }) => db.close()).catch(() => undefined);
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
    const pubkey = secret ? getPublicKey(secret) : stored?.mode === 'extension' ? extensionKey : null;

    return {
      online,
      connection,
      client,
      stored,
      pubkey,
      locked: stored?.mode === 'protected' && !secret,
      ensureKey: async () => {
        if (!stored) {
          const fresh = generateSecretKey();

          remember({ mode: 'browser', secret: fresh }, fresh);
          const { client: c } = await connectClient(RELAYS, OWNER_KEY, { secret: fresh });

          setClient(c);

          return c;
        }

        return client;
      },
      importKey: async (text, password) => {
        const result = await readSecretKey(text, password);

        if ('error' in result) return result.error;

        remember({ mode: 'browser', secret: result.secret }, result.secret);

        return null;
      },
      protect: async (password) => {
        if (secret)
          remember(
            { mode: 'protected', ncryptsec: await encryptSecretKey(secret, password, KEY_PROTECTION_LOGN) },
            secret,
          );
      },
      unlock: async (password) => {
        if (stored?.mode !== 'protected') return null;

        const result = await readSecretKey(stored.ncryptsec, password);

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
      exportNsec: () => (secret ? nsecEncode(secret) : null),
      exportNcryptsec: async (password) => (secret ? encryptSecretKey(secret, password, KEY_PROTECTION_LOGN) : null),
    };
  }, [client, connection, stored, secret, extensionKey, remember]);

  return <AccountContext value={account}>{children}</AccountContext>;
}
