import { recordSchema } from '../schemas/recordSchema';
import type { ParseResult, RulesRecord } from '../types';
import { buildDetachment } from './buildDetachment';
import { buildMuster } from './buildMuster';
import { buildUnit } from './buildUnit';
import { readFrontmatter } from './readFrontmatter';
import { splitEntries } from './splitEntries';

function build(data: ReturnType<typeof recordSchema.parse>, body: string, id: string) {
  switch (data.kind) {
    case 'unit':
      return buildUnit(data, body, id);
    case 'detachment':
      return buildDetachment(data, body, id);
    case 'faction':
      return { value: { ...data, id, body: body.trim() }, errors: [] };

    case 'glossary': {
      const entries = splitEntries(body).entries.map(({ heading, text }) => ({ term: heading, text }));

      return { value: { ...data, id, entries }, errors: [] };
    }

    case 'muster':
      return buildMuster(data, body, id);
  }
}

/**
 * Reads one record file of any kind. `fallbackId` (usually the file name) is used when the frontmatter has no `id`.
 * Every problem found is reported with the field it concerns, never thrown.
 */
export function parseRecord(source: string, path: string, fallbackId: string): ParseResult<RulesRecord> {
  const front = readFrontmatter(source, recordSchema);

  if (front.errors) return { ok: false, path, errors: front.errors };

  const { value, errors } = build(front.data, front.body, front.data.id ?? fallbackId);

  return errors.length ? { ok: false, path, errors } : { ok: true, value };
}
