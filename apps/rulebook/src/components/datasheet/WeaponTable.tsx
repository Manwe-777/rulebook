import type { Weapon } from '@rulebook/rules';

import { markProfileGroups } from '../../utils/markProfileGroups';
import CrossedHammersIcon from '../icons/CrossedHammersIcon';
import CrosshairIcon from '../icons/CrosshairIcon';
import WeaponRow from './WeaponRow';

const HEAD = 'px-0.5 py-1 text-center font-bold w-8 sm:w-11';

export default function WeaponTable({ kind, weapons }: { kind: 'ranged' | 'melee'; weapons: Weapon[] }) {
  if (!weapons.length) return null;

  const Icon = kind === 'ranged' ? CrosshairIcon : CrossedHammersIcon;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[19rem] border-collapse text-sm sm:text-[0.95rem]">
        <thead>
          <tr className="bg-bar text-white uppercase">
            <th className="w-6 py-1 sm:w-8">
              <Icon className="mx-auto size-4 sm:size-5" />
            </th>
            <th className="py-1 text-left text-base font-bold tracking-wide sm:text-lg">
              {kind}
              <span className="hidden sm:inline"> weapons</span>
            </th>
            <th className={`${HEAD} w-12 sm:w-16`}>Range</th>
            <th className={HEAD}>A</th>
            <th className={HEAD}>{kind === 'ranged' ? 'BS' : 'WS'}</th>
            <th className={HEAD}>S</th>
            <th className={HEAD}>AP</th>
            <th className={HEAD}>D</th>
          </tr>
        </thead>
        <tbody>
          {markProfileGroups(weapons).map(({ weapon, inGroup }) => (
            <WeaponRow key={weapon.name} weapon={weapon} inGroup={inGroup} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
