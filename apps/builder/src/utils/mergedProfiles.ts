import type { Profile } from '@rulebook/rules';

const STATS = ['M', 'T', 'Sv', 'InSv', 'W', 'Ld', 'OC', 'base'] as const;

/** Model profiles with identical characteristics shown once, under all their names: `Hesyr, Einhyr Hearthguard`. */
export function mergedProfiles(profiles: Profile[]): Profile[] {
  const merged: Profile[] = [];

  for (const p of profiles) {
    const same = merged.find((m) => STATS.every((s) => m[s] === p[s]));

    if (same) same.name = `${same.name}, ${p.name}`;
    else merged.push({ ...p });
  }

  return merged;
}
