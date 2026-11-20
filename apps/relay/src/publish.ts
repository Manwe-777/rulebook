import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { RulebookClient } from '@rulebook/sharing';
import { projectSettings } from '@rulebook/sharing/project';
import { getPublicKey } from 'tool-db';

import { connectProject } from './connectProject';
import { parsePublishArgs } from './parsePublishArgs';
import { readSecret } from './readSecret';

/**
 * Publishes a content folder (`<faction>/<record>.md`, plus `core/`) to the project's relays and releases every
 * faction in it, signed with a maintainer's key: from a password-protected key file (`--key`, as the rulebook's Account
 * page saves it) or RULEBOOK_SECRET. The owner comes from project.json (or RULEBOOK_OWNER), the relays from project.json
 * plus the announced ones (or RELAYS).
 */
const request = parsePublishArgs(process.argv.slice(2));

if ('error' in request) {
  console.error(request.error);
  process.exit(1);
}

const owner = projectSettings({ owner: process.env.RULEBOOK_OWNER }).owner;
const secret = await readSecret(request.keyFile, process.env);

if (!owner || !secret) {
  console.error(
    owner ? 'Wrong password, or no key: pass --key <file> or set RULEBOOK_SECRET.' : 'No project owner set.',
  );

  process.exit(1);
}

const { db, relays } = await connectProject(owner, process.env);

await db.keysSignIn(secret);

const client = new RulebookClient(db, owner);

console.log(`Publishing as ${getPublicKey(secret)} to ${db.relays.connected} of ${relays.length} relays`);

for (const faction of readdirSync(request.folder, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const files = readdirSync(join(request.folder, faction.name))
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({ name, source: readFileSync(join(request.folder, faction.name, name), 'utf8') }));

  const hash = await client.publishFolder(faction.name, files, request.version, request.notes);
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
