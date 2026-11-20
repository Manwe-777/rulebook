import type { ArmyList, Library, Stratagem } from '@rulebook/rules';

/** The stratagems an army can use, by where they come from: the core rules first, then each chosen detachment. */
export function stratagemGroups(list: ArmyList, library: Library): { title: string; stratagems: Stratagem[] }[] {
  const core = { title: 'Core stratagems', stratagems: library.muster?.stratagems ?? [] };

  const detachments = list.detachments.flatMap((id) => {
    const detachment = library.detachment(list.faction, id)?.detachment;

    return detachment ? [{ title: detachment.name, stratagems: detachment.stratagems }] : [];
  });

  return [core, ...detachments].filter((g) => g.stratagems.length > 0);
}
