import type { Profile } from '@rulebook/rules';

import { mergedProfiles } from '../../utils/mergedProfiles';

const STATS = ['M', 'T', 'Sv', 'W', 'Ld', 'OC'] as const;

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="text-[11px] font-bold tracking-wide text-text/70 uppercase">{label}</span>
      <span className="min-w-9 rounded bg-parchment px-1 py-0.5 text-center text-lg leading-tight font-extrabold text-ink">
        {value}
      </span>
    </span>
  );
}

/**
 * A unit's characteristics as small datasheet boxes, one row per distinct profile (named when there are several), the
 * invulnerable save last.
 */
export default function PlayStats({ profiles }: { profiles: Profile[] }) {
  const merged = mergedProfiles(profiles);

  return (
    <span className="flex flex-col gap-1.5">
      {merged.map((p) => (
        <span key={p.name} className="flex flex-col gap-0.5">
          {merged.length > 1 && <span className="text-xs font-bold text-text/70 uppercase">{p.name}</span>}
          <span className="flex flex-wrap gap-1">
            {STATS.map((s) => (
              <StatBox key={s} label={s} value={p[s]} />
            ))}
            {p.InSv && <StatBox label="Inv" value={p.InSv} />}
          </span>
        </span>
      ))}
    </span>
  );
}
