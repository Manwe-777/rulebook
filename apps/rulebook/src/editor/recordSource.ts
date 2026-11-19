import { parseRecord, recordPath, type RulesFile } from '@rulebook/rules';

import type { EditableKind } from './types';

/** The text of a record among the loaded files, by faction, kind and id; undefined when there is none. */
export function recordSource(files: RulesFile[], faction: string, kind: EditableKind, id: string): string | undefined {
  return files.find((file) => {
    const where = recordPath(file.path);

    if (where?.bundle !== faction) return false;

    const parsed = parseRecord(file.source, file.path, where.name);

    return parsed.ok && parsed.value.kind === kind && (kind === 'faction' || parsed.value.id === id);
  })?.source;
}
