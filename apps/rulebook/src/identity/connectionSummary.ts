/** The link to the relays: none configured, first connect, up, lost after being up, or never reached. */
export type Connection = 'offline' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

/** Whether this browser can sign: no key yet, a password-protected key not unlocked, or ready. */
export type Signing = 'anonymous' | 'locked' | 'ready';

export interface ConnectionSummary {
  tone: 'good' | 'pending' | 'bad' | 'muted';
  label: string;
  /** What the user can do right now. */
  detail: string;
  /** True when changes can be sent now. */
  canWrite: boolean;
}

const LINK: Record<Connection, Pick<ConnectionSummary, 'tone' | 'label'>> = {
  offline: { tone: 'muted', label: 'Offline' },
  connecting: { tone: 'pending', label: 'Connecting…' },
  connected: { tone: 'good', label: 'Connected' },
  reconnecting: { tone: 'pending', label: 'Reconnecting…' },
  failed: { tone: 'bad', label: 'No relay reachable' },
};

const SIGNING: Record<Signing, string> = {
  anonymous: 'Reading; a key is made when you first contribute',
  locked: 'Key locked; unlock it on the Account page to send changes',
  ready: 'Signed in; changes can be sent',
};

/** What the header says about the relays and the identity. */
export function connectionSummary(connection: Connection, signing: Signing): ConnectionSummary {
  const link = LINK[connection];

  if (connection === 'offline')
    return { ...link, detail: 'No relays configured; showing the demo faction', canWrite: false };
  if (connection !== 'connected')
    return { ...link, detail: 'Changes can be sent once a relay is reached', canWrite: false };

  return { ...link, detail: SIGNING[signing], canWrite: signing !== 'locked' };
}
