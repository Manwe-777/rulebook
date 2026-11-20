import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { Library, listPoints, listSchema, validateList } from '../src/index';

/**
 * Prices and checks army lists (JSON in the builder's list format) against a content folder: the total, each entry's
 * points, and every problem. Usage: npm run check-list -w @rulebook/rules -- <content folder> <list.json>…
 */
const here = process.env.INIT_CWD ?? process.cwd();
const [folderArg, ...listArgs] = process.argv.slice(2);
const folder = resolve(here, folderArg ?? 'content');

const files = readdirSync(folder, { recursive: true, encoding: 'utf8' })
  .filter((path) => path.endsWith('.md'))
  .map((path) => ({ path: `content/${path}`, source: readFileSync(join(folder, path), 'utf8') }));

const library = Library.fromFiles(files);
let failed = false;

for (const arg of listArgs) {
  const parsed = listSchema.safeParse(JSON.parse(readFileSync(resolve(here, arg), 'utf8')));

  if (!parsed.success) {
    console.log(`${arg}: not a list: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    failed = true;
    continue;
  }

  const list = parsed.data;
  const points = listPoints(list, library);
  const issues = validateList(list, library);

  console.log(
    `${arg}: ${list.name}: ${points.total} / ${points.limit} pts, ${issues.length ? `${issues.length} problems` : 'legal'}`,
  );

  for (const entry of list.units)
    console.log(`  ${entry.id} ${entry.unit} x${entry.models}: ${points.entries[entry.id] ?? '?'} pts`);
  for (const issue of issues) console.log(`  ${issue.severity.toUpperCase()} ${issue.code}: ${issue.message}`);
  if (issues.some((i) => i.severity === 'error')) failed = true;
}

process.exitCode = failed ? 1 : 0;
