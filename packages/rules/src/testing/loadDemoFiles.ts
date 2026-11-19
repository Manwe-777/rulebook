import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT = join(import.meta.dirname, '../../content');

/** Every file of the demo content, as the library reads them. Node only, for tests. */
export function loadDemoFiles() {
  return readdirSync(CONTENT, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.endsWith('.md'))
    .map((path) => ({ path: `content/${path}`, source: readFileSync(join(CONTENT, path), 'utf8') }));
}
