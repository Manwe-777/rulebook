import { parseRecord } from '../parse/parseRecord';
import type { ParseResult, RulesRecord } from '../types';

/** The last text read for each path, and what it gave. */
const parsed = new Map<string, { source: string; fallbackId: string; result: ParseResult<RulesRecord> }>();

/**
 * {@link parseRecord}, remembering the result per path, so building a new library when one faction changes only reads
 * the files that changed. The records returned are shared between libraries and must not be changed.
 */
export function parseCached(source: string, path: string, fallbackId: string): ParseResult<RulesRecord> {
  const known = parsed.get(path);

  if (known && known.source === source && known.fallbackId === fallbackId) return known.result;

  const result = parseRecord(source, path, fallbackId);

  parsed.set(path, { source, fallbackId, result });

  return result;
}
