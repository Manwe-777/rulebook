import type { Profile } from '@rulebook/rules';

import { mergedProfiles } from '../../utils/mergedProfiles';

const STATS = ['M', 'T', 'Sv', 'W', 'Ld', 'OC'] as const;

/**
 * Every model profile's characteristics as large boxes, with its invulnerable save and base size; models with the
 * same characteristics share one row.
 */
export default function StatBlock({ profiles: all }: { profiles: Profile[] }) {
  const profiles = mergedProfiles(all);

  return (
    <div className="flex flex-col gap-2">
      {profiles.map((p) => (
        <div key={p.name} className="flex flex-col gap-1">
          {profiles.length > 1 && <span className="text-sm font-bold uppercase">{p.name}</span>}
          <div className="flex flex-wrap items-end gap-1.5">
            {STATS.map((s) => (
              <div key={s} className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase">{s}</span>
                <span className="min-w-11 rounded bg-black px-1.5 py-1 text-center text-xl font-extrabold text-white">
                  {p[s]}
                </span>
              </div>
            ))}
            {p.InSv && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase">Invuln</span>
                <span className="min-w-11 rounded bg-black px-1.5 py-1 text-center text-xl font-extrabold text-white">
                  {p.InSv}
                </span>
              </div>
            )}
            {p.base && <span className="ml-1 pb-1 text-sm font-semibold">Base {p.base}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
