// Builds the relay release: one bundled script plus the LevelDB module (which ships prebuilt binaries for x64 and
// arm64), packed as rulebook-relay.tar.gz next to install.sh and SHA256SUMS in release/.
//
//   RULEBOOK_OWNER=npub1... node scripts/package.mjs 1.2.3
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';
import { npubDecode } from 'tool-db';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const version = process.argv[2] ?? '0.0.0-dev';
const out = join(root, 'release');
// Outside the repo, or npm would install into the workspace root.
const stage = mkdtempSync(join(tmpdir(), 'rulebook-relay-'));
const app = join(stage, 'rulebook-relay');

/** Version of `level` the LevelDB store was built against, so the packed copy matches. */
function levelVersion() {
  const store = createRequire(join(root, 'package.json')).resolve('@tool-db/leveldb-store');

  return JSON.parse(readFileSync(createRequire(store).resolve('level/package.json'), 'utf8')).version;
}

mkdirSync(app, { recursive: true });

await build({
  entryPoints: [join(root, 'src/main.ts')],
  outfile: join(app, 'relay.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  // Native module: installed below. The ws speed-ups are optional and loaded only when present.
  external: ['level', 'bufferutil', 'utf-8-validate'],
  // CommonJS dependencies call require() for Node built-ins.
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  legalComments: 'none',
});

writeFileSync(
  join(app, 'package.json'),
  `${JSON.stringify({ name: 'rulebook-relay', version, private: true, type: 'module', dependencies: { level: levelVersion() } }, null, 2)}\n`,
);
writeFileSync(join(app, 'VERSION'), `${version}\n`);
execFileSync('npm', ['install', '--omit=dev', '--ignore-scripts', '--no-package-lock', '--no-audit', '--no-fund'], {
  cwd: app,
  stdio: 'inherit',
});

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
execFileSync('tar', ['-czf', join(out, 'rulebook-relay.tar.gz'), '-C', stage, 'rulebook-relay']);
// The download address points at this repository's releases, and the project owner (project.json, or RULEBOOK_OWNER
// to override it; npub or hex) becomes the installer's default so relays check writes without any options.
const repo = process.env.GITHUB_REPOSITORY ?? 'OWNER/REPO';
const project = JSON.parse(readFileSync(join(root, '../../project.json'), 'utf8'));
const ownerText = (process.env.RULEBOOK_OWNER || project.owner || '').trim();
const owner = /^[0-9a-f]{64}$/.test(ownerText) ? ownerText : ownerText.startsWith('npub1') ? npubDecode(ownerText) : '';

if (ownerText && !owner) throw new Error('RULEBOOK_OWNER must be an npub or a hex public key');

writeFileSync(
  join(out, 'install.sh'),
  readFileSync(join(root, 'packaging/install.sh'), 'utf8')
    .replaceAll('OWNER/REPO', repo)
    .replace("'@PROJECT_OWNER@'", owner ? `'${owner}'` : "''"),
  { mode: 0o755 },
);
writeFileSync(join(out, 'VERSION'), `${version}\n`);

const sums = ['rulebook-relay.tar.gz', 'install.sh']
  .map(
    (f) =>
      `${createHash('sha256')
        .update(readFileSync(join(out, f)))
        .digest('hex')}  ${f}`,
  )
  .join('\n');

writeFileSync(join(out, 'SHA256SUMS'), `${sums}\n`);
rmSync(stage, { recursive: true, force: true });
console.log(`release/ ready for ${version}`);
