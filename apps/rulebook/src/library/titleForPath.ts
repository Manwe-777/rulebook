import type { Library } from '@rulebook/rules';

import { SITE_NAME } from '../constants';

function pageName(library: Library, factionId: string, rest: string[]): string | null | undefined {
  if (rest.length === 0) return undefined;
  if (rest[0] === 'edit') return 'Edit';
  if (rest.length === 1) return library.unit(factionId, rest[0])?.unit.name ?? null;
  if (rest.length === 2 && rest[0] === 'detachment')
    return library.detachment(factionId, rest[1])?.detachment.name ?? null;

  return null;
}

/** Pages that aren't factions, by their path. */
const FIXED_PAGES: Record<string, string> = {
  account: 'Account',
  print: 'Army sheet',
  admin: 'Admin',
  stratagems: 'Core stratagems',
};

/** Browser tab title for a page path: `Boyz · Orks · Rulebook`, `Orks · Rulebook`, or the site name. */
export function titleForPath(library: Library, path: string): string {
  const [factionId, ...rest] = path.split('/').filter(Boolean);

  if (rest.length === 0 && factionId in FIXED_PAGES) return `${FIXED_PAGES[factionId]} · ${SITE_NAME}`;
  const faction = factionId ? library.faction(factionId) : undefined;
  const page = faction ? pageName(library, faction.id, rest) : undefined;

  if ((factionId && !faction) || page === null) return `Not found · ${SITE_NAME}`;

  return [page, faction?.name, SITE_NAME].filter(Boolean).join(' · ');
}
