import { type ArmyList, entryLoadout, type Library, type ListEntry, type Unit } from '@rulebook/rules';

import { carriedWargearRules } from '../../utils/carriedWargearRules';
import { entryItems } from '../../utils/entryItems';
import { loadoutLines } from '../../utils/loadoutLines';
import { weaponRows } from '../../utils/weaponRows';
import UnitPhoto from '../photos/UnitPhoto';
import StatBlock from './StatBlock';
import UnitAbilities from './UnitAbilities';
import WeaponTable from './WeaponTable';

interface Props {
  library: Library;
  list: ArmyList;
  entry: ListEntry;
  unit: Unit;
  /** Show every weapon and wargear rule on the datasheet, not only what this unit carries. */
  showAll: boolean;
  /** Play mode: the photo can't be changed. */
  readOnly: boolean;
  /** What the unit is in its combined unit, e.g. "Leader". */
  role?: string;
}

/** One unit as it was built, for playing: stats, what each model carries, its weapons with counts and its rules. */
export default function UnitPanel({ library, list, entry, unit, showAll, readOnly, role }: Props) {
  const loadout = entryLoadout(unit, entry);
  const { ranged, melee } = weaponRows(unit, loadout, showAll);
  const carried = loadout.flatMap((l) => l.items.map((i) => i.id));

  return (
    <article className="overflow-hidden rounded-lg bg-panel shadow-lg">
      <header className="flex flex-col gap-3 bg-bar-dark px-3 py-3 text-white">
        <div className="flex items-center gap-3">
          <UnitPhoto faction={list.faction} unit={unit.id} name={unit.name} size={64} readOnly={readOnly} />
          <div className="flex-1">
            {role && <p className="text-xs font-bold tracking-wide uppercase opacity-80">{role}</p>}
            <h3 className="text-2xl font-extrabold tracking-wide uppercase">{unit.name}</h3>
          </div>
        </div>
        <StatBlock profiles={unit.profiles} />
      </header>
      <ul className="flex flex-col gap-1 px-3 py-2 text-sm">
        {entry.wargear.length === 0 && <li className="text-text/70">No wargear options taken: datasheet wargear.</li>}
        {loadoutLines(unit, loadout).map((line) => (
          <li key={line} className="rounded bg-black/20 px-2 py-1">
            {line}
          </li>
        ))}
      </ul>
      <WeaponTable library={library} title="Ranged weapons" skill="BS" rows={ranged} />
      <WeaponTable library={library} title="Melee weapons" skill="WS" rows={melee} />
      <UnitAbilities
        library={library}
        unit={unit}
        wargearRules={carriedWargearRules(unit, carried, showAll)}
        items={entryItems(library, list, entry)}
      />
      <footer className="bg-black/30 px-3 py-2 text-xs uppercase">
        <p>
          <span className="font-bold">Keywords:</span> {unit.keywords.join(', ')}
        </p>
        <p>
          <span className="font-bold">Faction:</span> {unit.factionKeywords.join(', ')}
        </p>
      </footer>
    </article>
  );
}
