import type { RulesFile } from '../types';
import { recordPath } from './recordPath';

/** The bundle folders a set of files covers, e.g. `orks` or `core`. */
function bundles(files: RulesFile[]): Set<string> {
  return new Set(files.flatMap((f) => recordPath(f.path)?.bundle ?? []));
}

/** Bundled files plus files from the relays; a faction (or core) found on the relays replaces the bundled one. */
export function mergeFiles(bundled: RulesFile[], remote: RulesFile[]): RulesFile[] {
  const replaced = bundles(remote);

  return [...bundled.filter((f) => !replaced.has(recordPath(f.path)?.bundle ?? '')), ...remote];
}
