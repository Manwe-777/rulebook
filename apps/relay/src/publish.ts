import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { RulebookClient, TOPIC } from '@rulebook/sharing';
import { getPublicKey, ToolDb } from 'tool-db';

/**
 * Publishes a content folder (`<faction>/<record>.md`, plus `core/`) to the relays and releases every faction in it.
 * Usage: RULEBOOK_OWNER=<hex> RULEBOOK_SECRET=<hex> RELAYS=ws://… npm run publish -w @rulebook/relay -- <folder> <version>
 */
const [folder, version] = process.argv.slice(2);
const { RULEBOOK_OWNER: owner, RULEBOOK_SECRET: secret, RELAYS: relays = 'ws://localhost:8080' } = process.env;

if (!folder || !version || !owner || !secret) {
  console.error('Usage: RULEBOOK_OWNER=<hex> RULEBOOK_SECRET=<hex> [RELAYS=ws://…] publish <folder> <version>');
  process.exit(1);
}

const db = new ToolDb({ relays: relays.split(','), topic: TOPIC });

await db.ready;
if (!db.isConnected) await new Promise<void>((resolve) => (db.onConnect = () => resolve()));
await db.keysSignIn(secret);

const client = new RulebookClient(db, owner);

console.log(`Publishing as ${getPublicKey(secret)}`);

for (const faction of readdirSync(folder, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const files = readdirSync(join(folder, faction.name))
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({ name, source: readFileSync(join(folder, faction.name, name), 'utf8') }));

  const hash = await client.publishFolder(faction.name, files, version);
  // A relay refuses records its own rules can't read (for example an older relay and a newer field), without telling
  // the writer; reading the release back shows what was really stored.
  const stored = await client.releaseFiles(faction.name, hash);

  console.log(`${faction.name}: ${stored.length} of ${files.length} records stored, release ${hash}`);

  if (stored.length < files.length) {
    const kept = new Set(stored.map((f) => f.path.split('/').pop()));

    console.error(
      `Missing on the relay: ${files
        .filter((f) => !kept.has(f.name))
        .map((f) => f.name)
        .join(', ')}`,
    );

    process.exitCode = 1;
  }
}

await db.close();
