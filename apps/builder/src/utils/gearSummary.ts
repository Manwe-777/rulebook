import { type ModelLoadout, type Unit, wargearName } from '@rulebook/rules';

/**
 * Everything a unit carries, totalled across its models, weapons first: `10 × EtaCarn plasma gun`, `Teleport crest`.
 * Items carried once are named alone.
 */
export function gearSummary(unit: Unit, loadout: ModelLoadout[]): string[] {
  const totals = new Map<string, number>();

  for (const item of loadout.flatMap((l) => l.items)) totals.set(item.id, (totals.get(item.id) ?? 0) + item.count);

  const equipment = new Set(unit.equipment.map((e) => e.id));
  const ids = [...totals.keys()].sort((a, b) => Number(equipment.has(a)) - Number(equipment.has(b)));

  return ids.map((id) => {
    const count = totals.get(id)!;

    return `${count > 1 ? `${count} × ` : ''}${wargearName(unit, id)}`;
  });
}
