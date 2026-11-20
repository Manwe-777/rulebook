import { loadStoredIdentity, saveStoredIdentity, type StoredIdentity } from '@rulebook/sharing/identity';
import { useCallback, useEffect, useRef, useState } from 'react';
import { decryptSecretKey, generateSecretKey } from 'tool-db';

import type { SavedArmies } from '../army/SavedArmies';
import { RELAYS, SYNC_DEBOUNCE_MS, SYNC_INTERVAL_MS } from '../constants';
import { createLink } from '../sync/createLink';
import { loadSyncSetting } from '../sync/loadSyncSetting';
import { saveSyncSetting } from '../sync/saveSyncSetting';
import { SyncSession } from '../sync/SyncSession';

/**
 * `off`: this device doesn't sync. `extension`: it signs with a browser extension, whose key can't be used here.
 * `locked`: its key has a password, not yet typed this visit. Otherwise the state of the link to the relays.
 */
export type SyncStatus = 'off' | 'extension' | 'locked' | 'connecting' | 'synced' | 'failed';

export interface ArmySync {
  status: SyncStatus;
  /** When this device last synced (ms since epoch), or null. */
  lastSync: number | null;
  /** Starts syncing, making a key for this device when it has none. */
  turnOn: () => void;
  /** Stops syncing on this device; its lists and key stay. */
  turnOff: () => void;
  /** Opens a password-protected key for this visit; returns an error message or null. */
  unlock: (password: string) => Promise<string | null>;
  /** A link and code for another device, or null when there is no key to share. */
  link: () => Promise<{ code: string; url: string } | null>;
  /** Uses the key another device shared, and starts syncing with it. */
  adopt: (secret: string) => void;
}

type Change = (change: (saved: SavedArmies) => SavedArmies) => void;

const BASE = () => `${window.location.origin}${import.meta.env.BASE_URL}`;

/** The key to sync with: stored in the browser, or opened with its password this visit. */
const usableSecret = (identity: StoredIdentity | null, unlocked: string | null) =>
  identity?.mode === 'browser' ? identity.secret : unlocked;

function statusOf(on: boolean, identity: StoredIdentity | null, secret: string | null, link: SyncStatus): SyncStatus {
  if (!on) return 'off';
  if (identity?.mode === 'extension') return 'extension';
  if (!secret) return 'locked';

  return link;
}

/**
 * Keeps this device's saved armies in sync with the user's other devices through the relays, while syncing is on:
 * on start, every minute, when the page is shown again, and shortly after each change here.
 */
export function useArmySync(saved: SavedArmies, change: Change): ArmySync {
  const [on, setOn] = useState(loadSyncSetting);
  const [identity, setIdentity] = useState(loadStoredIdentity);
  const [unlocked, setUnlocked] = useState<string | null>(null);
  const [link, setLink] = useState<SyncStatus>('connecting');
  const [lastSync, setLastSync] = useState<number | null>(null);
  const session = useRef<SyncSession | null>(null);
  const current = useRef(saved);
  const secret = usableSecret(identity, unlocked);

  useEffect(() => {
    current.current = saved;
  }, [saved]);

  const run = useCallback(async () => {
    const open = session.current;

    if (!open) return;

    try {
      await open.sync(
        () => current.current,
        (remote) => change((s) => s.merge(remote).saved),
      );

      setLastSync(Date.now());
      setLink('synced');
    } catch {
      setLink('failed');
    }
  }, [change]);

  useSyncLoop(on && RELAYS.length > 0 ? secret : null, session, run, setLink);
  useSendChanges(saved, session, run);

  const remember = (next: StoredIdentity) => {
    saveStoredIdentity(next);
    setIdentity(next);
  };

  return {
    status: statusOf(on, identity, secret, link),
    lastSync,
    turnOn: () => {
      if (!identity) remember({ mode: 'browser', secret: generateSecretKey() });
      saveSyncSetting(true);
      setOn(true);
    },
    turnOff: () => {
      saveSyncSetting(false);
      setOn(false);
    },
    unlock: async (password) => {
      if (identity?.mode !== 'protected') return null;

      try {
        setUnlocked(await decryptSecretKey(identity.ncryptsec, password));

        return null;
      } catch {
        return 'Wrong password.';
      }
    },
    link: async () => (secret ? createLink(secret, BASE()) : null),
    adopt: (next) => {
      remember({ mode: 'browser', secret: next });
      setUnlocked(null);
      saveSyncSetting(true);
      setOn(true);
    },
  };
}

/** While there is a key to sync with: opens the session, syncs now, every minute and whenever the page is shown. */
function useSyncLoop(
  secret: string | null,
  session: { current: SyncSession | null },
  run: () => Promise<void>,
  setLink: (status: SyncStatus) => void,
) {
  useEffect(() => {
    if (!secret) return;

    let closed = false;
    const visible = () => document.visibilityState === 'visible' && void run();
    const timer = setInterval(() => void run(), SYNC_INTERVAL_MS);

    setLink('connecting');

    SyncSession.open(RELAYS, secret)
      .then((opened) => {
        if (closed) return opened.close();

        session.current = opened;
        void run();
      })
      .catch(() => !closed && setLink('failed'));

    document.addEventListener('visibilitychange', visible);

    return () => {
      closed = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
      session.current?.close();
      session.current = null;
    };
    // run changes with `change`, which is stable; the session follows the key only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret]);
}

/** Sends this device's changes a moment after they are made, while a session is open. */
function useSendChanges(saved: SavedArmies, session: { current: SyncSession | null }, run: () => Promise<void>) {
  useEffect(() => {
    if (!session.current) return;

    const timer = setTimeout(() => void run(), SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [saved, session, run]);
}
