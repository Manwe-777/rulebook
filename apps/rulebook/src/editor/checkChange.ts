import { checkDataset, type Issue, Library, parseRecord, type RulesFile } from '@rulebook/rules';

import { recordSource } from './recordSource';
import type { EditableKind } from './types';

/**
 * Checks an edited record together with the rest of the loaded files: its own parse errors, and the dataset checks of
 * its faction with the change applied. Also returns that library, for previews.
 */
export function checkChange(
  files: RulesFile[],
  faction: string,
  kind: EditableKind,
  id: string,
  text: string,
): { errors: string[]; issues: Issue[]; library: Library; id: string } {
  const parsed = parseRecord(text, 'edit', id);
  const newId = parsed.ok && parsed.value.kind !== 'faction' ? parsed.value.id : id;
  const old = recordSource(files, faction, kind, id);
  const name = kind === 'faction' ? 'faction' : newId;
  const path = `${faction}/${name}.md`;
  const others = files.filter((f) => f.source !== old);
  const library = Library.fromFiles([...others, { path, source: text }]);
  const errors = parsed.ok ? (library.errors.find((e) => e.path === path)?.errors ?? []) : parsed.errors;
  const ref = (i: Issue) => i.entries.some((e) => e === faction || e.startsWith(`${faction}/`) || e === 'core');

  return { errors, issues: checkDataset(library).filter(ref), library, id: newId };
}
