import project from '../../../project.json';
import { ownerKeyHex } from './utils/ownerKeyHex';

/** The project's owner key and relays, from `project.json` at the repository root. Forks keep them by default. */
export const PROJECT: { owner: string; relays: string[] } = project;

/**
 * The owner key (hex; empty when none is set) and relays an app uses: `project.json`, unless a build sets its own
 * (`owner`, an npub or hex key; `relays`, comma separated). Empty build values count as not set.
 */
export function projectSettings(build: { owner?: string; relays?: string }): { owner: string; relays: string[] } {
  const owner = build.owner?.trim() || PROJECT.owner;
  const relays = build.relays?.trim() ? build.relays.split(',').map((r) => r.trim()) : PROJECT.relays;

  return { owner: owner ? ownerKeyHex(owner) : '', relays: relays.filter(Boolean) };
}
