import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** File in the data folder recording which messages each public relay already has from this one. */
const FILE = 'pushed.json';

/** What was pushed to each relay before, or nothing when the file is missing or unreadable. */
export function readPushed(dataDir: string): Record<string, string[]> {
  try {
    const parsed: unknown = JSON.parse(readFileSync(join(dataDir, FILE), 'utf8'));

    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

export function writePushed(dataDir: string, pushed: Record<string, string[]>): void {
  writeFileSync(join(dataDir, FILE), JSON.stringify(pushed));
}
