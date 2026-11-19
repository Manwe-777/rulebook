import { ToolDbRelay, type ToolDbRelayOptions } from '@tool-db/nostr-relay';

import { KEYS, TOPIC } from '../constants';
import { parseKey } from '../rules/parseKey';
import { Roles } from '../rules/Roles';
import { registerWriteRules } from '../rules/writeRules';

/** tool-db's kind for values (NIP-78 application data). */
const VALUE_KIND = 30078;

interface StoredEvent {
  id: string;
  pubkey: string;
  created_at: number;
  content: string;
}

const newest = (a: StoredEvent, b: StoredEvent) => b.created_at - a.created_at || a.id.localeCompare(b.id);

/**
 * A ToolDB relay node for Rulebook: it keeps the topic's data. Given the owner key, it applies the same write rules as
 * the apps, reading the role lists from its own store. Without one it is an open store: it keeps any correctly signed
 * data on the topic and leaves the checks to the apps, which apply the write rules on every read.
 */
export class RulebookRelay extends ToolDbRelay {
  readonly roles: Roles | null;

  constructor(options: Omit<ToolDbRelayOptions, 'topic'> & { owner: string | null; roleCacheMs?: number }) {
    super({ ...options, topic: TOPIC });
    this.roles = options.owner ? new Roles(options.owner, (key) => this.lookup(key), options.roleCacheMs) : null;
    if (this.roles) registerWriteRules(this, this.roles);
  }

  /** The newest stored value of a role or hidden list, written by someone allowed to write it. */
  private async lookup(key: string): Promise<unknown> {
    if (!this.roles) return null;

    const fixed = key === KEYS.hidden || key.startsWith('maintainers/');

    const events = (await this.store.query([
      { kinds: [VALUE_KIND], '#d': [`${TOPIC}:${key}`], ...(fixed ? { authors: [this.roles.owner] } : {}) },
    ])) as StoredEvent[];

    for (const event of [...events].sort(newest)) {
      if (fixed || (await this.roles.isMaintainer(parseKey(key).parts[1], event.pubkey)))
        return JSON.parse(event.content);
    }

    return null;
  }
}
