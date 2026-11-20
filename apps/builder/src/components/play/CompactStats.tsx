import type { Profile } from '@rulebook/rules';

import { mergedProfiles } from '../../utils/mergedProfiles';

const STATS = ['M', 'T', 'Sv', 'W', 'Ld', 'OC'] as const;

/** A unit's characteristics in one small row per distinct profile, invulnerable save last. */
export default function CompactStats({ profiles }: { profiles: Profile[] }) {
  return (
    <span className="flex flex-col gap-0.5">
      {mergedProfiles(profiles).map((p, i, all) => (
        <span key={p.name} className="flex flex-wrap items-center gap-x-2.5 text-sm">
          {STATS.map((s) => (
            <span key={s}>
              <span className="text-xs text-text/60">{s} </span>
              <span className="font-bold">{p[s]}</span>
            </span>
          ))}
          {p.InSv && (
            <span>
              <span className="text-xs text-text/60">Inv </span>
              <span className="font-bold">{p.InSv}</span>
            </span>
          )}
          {all.length > 1 && <span className="text-xs text-text/60">{p.name}</span>}
        </span>
      ))}
    </span>
  );
}
