import type { Weapon } from '@rulebook/rules';

import Tags from '../common/Tags';

const CELL = 'px-0.5 py-1 text-center align-top';

/** One weapon profile. Melee weapons show "Melee" as their range and WS instead of BS. */
export default function WeaponRow({ weapon, inGroup }: { weapon: Weapon; inGroup: boolean }) {
  const range = 'range' in weapon ? weapon.range : 'Melee';
  const skill = 'BS' in weapon ? weapon.BS : weapon.WS;

  return (
    <tr className="dotted-rule even:bg-parchment-dark/70">
      <td className="w-6 py-1.5 align-top sm:w-8">
        {inGroup && (
          <span className="profile-arrow mx-auto block h-3 w-3.5 bg-bar sm:w-4" title="One of several profiles" />
        )}
      </td>
      <td className="py-1 pr-2 align-top font-semibold">
        {weapon.name} <Tags tags={weapon.tags} />
      </td>
      <td className={CELL}>{range}</td>
      <td className={CELL}>{weapon.A}</td>
      <td className={CELL}>{skill}</td>
      <td className={CELL}>{weapon.S}</td>
      <td className={CELL}>{weapon.AP}</td>
      <td className={CELL}>{weapon.D}</td>
    </tr>
  );
}
