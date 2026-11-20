import { RELAY_MAX_FAILURES } from '../constants';

/** What a browser remembers about one relay it found. */
export interface KnownRelay {
  url: string;
  /** Checks failed in a row since the last one that answered. */
  failures: number;
  /** When it last answered, in ms since 1970; null if never. */
  lastOk: number | null;
}

/**
 * The relays a browser has found through announcements, with how reliable they have been. A relay that fails
 * `RELAY_MAX_FAILURES` checks in a row is dropped; it comes back if it announces itself again. Immutable: every change
 * returns a new list.
 */
export class KnownRelays {
  private constructor(private readonly entries: KnownRelay[]) {}

  static empty(): KnownRelays {
    return new KnownRelays([]);
  }

  /** Saved data, keeping only well-formed entries; anything else starts empty. */
  static fromSave(raw: unknown): KnownRelays {
    if (!Array.isArray(raw)) return KnownRelays.empty();

    const entries = raw.filter(
      (e): e is KnownRelay =>
        typeof e?.url === 'string' &&
        Number.isInteger(e.failures) &&
        (e.lastOk === null || typeof e.lastOk === 'number'),
    );

    return new KnownRelays(entries);
  }

  toJSON(): KnownRelay[] {
    return this.entries;
  }

  get all(): KnownRelay[] {
    return [...this.entries];
  }

  /** Addresses worth connecting to. */
  get urls(): string[] {
    return this.entries.map((e) => e.url);
  }

  /** Adds relays that announced themselves; ones already known keep their record. */
  add(urls: string[]): KnownRelays {
    const fresh = urls.filter((url) => !this.entries.some((e) => e.url === url));

    return new KnownRelays([...this.entries, ...fresh.map((url) => ({ url, failures: 0, lastOk: null }))]);
  }

  /** Records whether a relay answered a check; one failing too often is dropped. */
  record(url: string, ok: boolean, now: number): KnownRelays {
    const entries = this.entries
      .map((e) => (e.url !== url ? e : ok ? { ...e, failures: 0, lastOk: now } : { ...e, failures: e.failures + 1 }))
      .filter((e) => e.failures < RELAY_MAX_FAILURES);

    return new KnownRelays(entries);
  }
}
