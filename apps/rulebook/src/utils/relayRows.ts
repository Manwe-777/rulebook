import type { KnownRelay, RelayAnnouncement } from '@rulebook/sharing';

/** One relay in the admin list. */
export interface RelayRow {
  url: string;
  name: string;
  /** `project`: in project.json (or the build); `announced`: found through its announcement. */
  source: 'project' | 'announced';
  /** When it last announced itself (ISO), if it did. */
  announced: string | null;
  /** The relay's own key, if it announced itself. */
  key: string | null;
  /** Connection time from this browser in ms; null when it didn't answer, undefined while checking. */
  ping: number | null | undefined;
  /**
   * What this browser does with it: `fixed`, always used (project.json); `used`, found and answering; `unused`, not
   * checked yet or dropped after failing checks.
   */
  status: 'fixed' | 'used' | 'unused';
}

/**
 * Every relay the admin page knows of, once each: the project's, then the announced ones, newest announcement first,
 * with what this browser does with each.
 */
export function relayRows(
  fixed: string[],
  announced: RelayAnnouncement[],
  known: KnownRelay[],
  pings: Record<string, number | null>,
): RelayRow[] {
  const byUrl = new Map<string, RelayRow>();

  for (const url of fixed) {
    byUrl.set(url, { url, name: '', source: 'project', announced: null, key: null, ping: pings[url], status: 'fixed' });
  }

  for (const r of announced) {
    const row = byUrl.get(r.url);

    if (row) Object.assign(row, { name: r.name, announced: r.updated, key: r.key });
    else
      byUrl.set(r.url, {
        url: r.url,
        name: r.name,
        source: 'announced',
        announced: r.updated,
        key: r.key,
        ping: pings[r.url],
        status: known.some((k) => k.url === r.url) ? 'used' : 'unused',
      });
  }

  return [...byUrl.values()];
}
