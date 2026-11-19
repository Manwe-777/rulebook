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

/** Browser tab title for a page path: `Boyz · Orks · Rulebook`, `Orks · Rulebook`, or the site name. */
export function titleForPath(library: Library, path: string): string {
  const [factionId, ...rest] = path.split('/').filter(Boolean);

  if (factionId === 'account' && rest.length === 0) return `Account · ${SITE_NAME}`;
  const faction = factionId ? library.faction(factionId) : undefined;
  const page = faction ? pageName(library, faction.id, rest) : undefined;

  if ((factionId && !faction) || page === null) return `Not found · ${SITE_NAME}`;

  return [page, faction?.name, SITE_NAME].filter(Boolean).join(' · ');
}
