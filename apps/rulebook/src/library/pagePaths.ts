import type { Library } from '@rulebook/rules';

/** Every page path the library has, for prerendering. */
export function pagePaths(library: Library): string[] {
  return [
    '/',
    ...library.factions.flatMap((f) => [
      `/${f.id}`,
      ...f.units.map((u) => `/${f.id}/${u.id}`),
      ...f.detachments.map((d) => `/${f.id}/detachment/${d.id}`),
    ]),
  ];
}
