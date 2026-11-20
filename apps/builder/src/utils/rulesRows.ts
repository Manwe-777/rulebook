import type { Library } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';

/** One row of the rules data table: a faction (or the core rules) and its release, if it came from the relays. */
export interface RulesRow {
  id: string;
  name: string;
  release: ReleaseInfo | undefined;
}

const released = (row: RulesRow) => (row.release ? Date.parse(row.release.date) : -Infinity);

/** Every faction and the core rules, the most recently released first; ones with no release (built in) last, by name. */
export function rulesRows(library: Library, releases: ReleaseInfo[]): RulesRow[] {
  const rows = [
    ...library.factions.map((f) => ({ id: f.id, name: f.name })),
    ...(library.muster ? [{ id: 'core', name: 'Core rules' }] : []),
  ].map((r) => ({ ...r, release: releases.find((rel) => rel.faction === r.id) }));

  return rows.sort((a, b) => released(b) - released(a) || a.name.localeCompare(b.name));
}
