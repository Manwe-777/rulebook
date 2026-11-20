import type { ReleasedRules } from '../schemas';

const folder = (path: string) => path.split('/')[0];

/**
 * The saved rules updated with what the relays gave: each faction (and core) takes the newer of the two releases.
 * Factions the relays didn't return this time (a relay that answered only in part, a dropped connection) keep their
 * saved release instead of disappearing.
 */
export function mergeReleasedRules(saved: ReleasedRules, fresh: ReleasedRules): ReleasedRules {
  const date = (rules: ReleasedRules, faction: string) => {
    const release = rules.releases.find((r) => r.faction === faction);

    return release ? Date.parse(release.date) : -Infinity;
  };

  const factions = new Set([...saved.files, ...fresh.files].map((f) => folder(f.path)));

  const pick = (faction: string): ReleasedRules => {
    const hasFresh = fresh.files.some((f) => folder(f.path) === faction);

    return hasFresh && date(fresh, faction) >= date(saved, faction) ? fresh : saved;
  };

  const chosen = [...factions].map((faction) => ({ faction, from: pick(faction) }));

  return {
    files: chosen.flatMap(({ faction, from }) => from.files.filter((f) => folder(f.path) === faction)),
    releases: chosen.flatMap(({ faction, from }) => from.releases.filter((r) => r.faction === faction)),
  };
}
