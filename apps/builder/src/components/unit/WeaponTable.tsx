import type { MeleeWeapon, RangedWeapon } from '@rulebook/rules';

import type { WeaponRow } from '../../utils/weaponRows';

interface Props {
  title: string;
  skill: 'BS' | 'WS';
  rows: WeaponRow<RangedWeapon | MeleeWeapon>[];
}

const HEAD = 'px-1 py-1 text-center font-bold';
const CELL = 'px-1 py-1 text-center align-top';

/** Weapons with how many the unit carries; weapons it doesn't carry (shown with "show all") are dimmed. */
export default function WeaponTable({ title, skill, rows }: Props) {
  if (!rows.length) return null;

  return (
    <table className="w-full border-collapse text-sm">
      <thead className="bg-bar text-white uppercase">
        <tr>
          <th className="px-2 py-1 text-left font-bold" colSpan={2}>
            {title}
          </th>
          <th className={HEAD}>Range</th>
          <th className={HEAD}>A</th>
          <th className={HEAD}>{skill}</th>
          <th className={HEAD}>S</th>
          <th className={HEAD}>AP</th>
          <th className={HEAD}>D</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ weapon, count, first }) => (
          <tr
            key={weapon.name}
            className={`border-b border-white/10 ${count ? '' : 'opacity-40'} ${first ? '' : 'border-t-0'}`}
          >
            <td className="w-7 py-1 pl-2 align-top font-bold">{first && count ? count : ''}</td>
            <td className="py-1 pr-1 align-top">
              {weapon.name}
              {weapon.tags.length > 0 && (
                <span className="block text-xs text-text/70 uppercase">[{weapon.tags.join(', ')}]</span>
              )}
            </td>
            <td className={CELL}>{'range' in weapon ? weapon.range : 'Melee'}</td>
            <td className={CELL}>{weapon.A}</td>
            <td className={CELL}>{'BS' in weapon ? weapon.BS : weapon.WS}</td>
            <td className={CELL}>{weapon.S}</td>
            <td className={CELL}>{weapon.AP}</td>
            <td className={CELL}>{weapon.D}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
