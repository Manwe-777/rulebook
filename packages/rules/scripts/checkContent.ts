import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { checkDataset, Library } from '../src/index';

/**
 * Checks a content folder (one folder per faction, plus `core`): files that don't parse, every dataset issue, and
 * what each faction's armies can use. Exits with 1 when there are errors.
 * Usage: npm run check-content -w @rulebook/rules -- <folder>
 */
const folder = resolve(process.env.INIT_CWD ?? process.cwd(), process.argv[2] ?? 'content');

const files = readdirSync(folder, { recursive: true, encoding: 'utf8' })
  .filter((path) => path.endsWith('.md'))
  .map((path) => ({ path: `content/${path}`, source: readFileSync(join(folder, path), 'utf8') }));

const library = Library.fromFiles(files);
const issues = checkDataset(library);

for (const e of library.errors) console.log(`FILE ${e.path}\n  ${e.errors.join('\n  ')}`);
for (const i of issues) console.log(`${i.severity.toUpperCase()} ${i.code} ${i.source}: ${i.message}`);

for (const f of library.factions) {
  const units = library.armyUnits(f.id).length;
  const detachments = library.armyDetachments(f.id).length;

  console.log(
    `${f.id}: ${f.units.length} datasheets, ${f.detachments.length} detachments (armies: ${units}, ${detachments})`,
  );
}

const errors = library.errors.length + issues.filter((i) => i.severity === 'error').length;

console.log(errors ? `${errors} errors` : 'No errors');
process.exitCode = errors ? 1 : 0;
