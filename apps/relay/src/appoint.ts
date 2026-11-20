import { readFileSync } from 'node:fs';

import { CORE, loadRelayAnnouncements, RulebookClient, TOPIC } from '@rulebook/sharing';
import { PROJECT, projectSettings } from '@rulebook/sharing/project';
import { decryptSecretKey, getPublicKey, ToolDb } from 'tool-db';

import { askHidden } from './askHidden';
import { parseAppointArgs } from './parseAppointArgs';

/**
 * Makes a key a maintainer of factions (or removes it), signed with the owner key from its password-protected file, so
 * the owner key never has to go into a browser. Writes to project.json's relays (or RELAYS) and every announced relay.
 */
const request = parseAppointArgs(process.argv.slice(2));

if ('error' in request) {
  console.error(request.error);
  process.exit(1);
}

const prompt = askHidden();
const password = await prompt.ask(`Password for ${request.keyFile}: `);

prompt.close();

const secret = await decryptSecretKey(readFileSync(request.keyFile, 'utf8').trim(), password).catch(() => null);

if (!secret) {
  console.error('Wrong password, or not an owner key file.');
  process.exit(1);
}

const owner = getPublicKey(secret);
// The project owner as hex: project.json (npub or hex), or RULEBOOK_OWNER when set, as the apps read it.
const projectOwner = projectSettings({ owner: process.env.RULEBOOK_OWNER }).owner;

if (owner !== projectOwner) {
  console.error(`That key (${owner}) is not the project owner (${projectOwner || 'none set'}).`);
  process.exit(1);
}

const bootstrap = process.env.RELAYS?.split(',').filter(Boolean) ?? PROJECT.relays;
const announced = (await loadRelayAnnouncements(bootstrap, owner).catch(() => [])).map((r) => r.url);
const relays = [...new Set([...bootstrap, ...announced])];
const db = new ToolDb({ relays, topic: TOPIC });

await db.ready;
if (!db.isConnected) await new Promise<void>((resolve) => (db.onConnect = () => resolve()));

// A write only reaches the relays connected at that moment: give the others a few seconds.
for (let waited = 0; db.relays.connected < relays.length && waited < 5000; waited += 250) {
  await new Promise((resolve) => setTimeout(resolve, 250));
}

await db.keysSignIn(secret);

const client = new RulebookClient(db, owner, 0);

const factions =
  request.factions === 'all' ? [...new Set([CORE, ...(await client.releasedFactions())])] : request.factions;

for (const faction of factions) {
  const current = await client.roles.maintainers(faction);
  const next = request.remove ? current.filter((k) => k !== request.key) : [...new Set([...current, request.key])];

  await client.setMaintainers(faction, next);
  console.log(`${faction}: ${next.length} maintainer${next.length === 1 ? '' : 's'}`);
}

console.log(`Written to ${db.relays.connected} of ${relays.length} relays.`);
await db.close();
