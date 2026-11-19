import type { ArmyList, Enhancement, Library } from '@rulebook/rules';

/** Enhancements (`model`) or upgrades (`unit`) offered by the list's chosen detachments. */
export function itemOptions(list: ArmyList, library: Library, target: Enhancement['target']): Enhancement[] {
  const detachments = library.faction(list.faction)?.detachments ?? [];

  return detachments
    .filter((d) => list.detachments.includes(d.id))
    .flatMap((d) => d.enhancements)
    .filter((e) => e.target === target);
}
