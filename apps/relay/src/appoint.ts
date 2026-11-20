import { CORE, RulebookClient } from '@rulebook/sharing';
import { projectSettings } from '@rulebook/sharing/project';
import { getPublicKey } from 'tool-db';

import { connectProject } from './connectProject';
import { fromInvocation } from './fromInvocation';
import { parseAppointArgs } from './parseAppointArgs';
import { readSecret } from './readSecret';

/**
 * Makes a key a maintainer of factions (or removes it), signed with the owner key from its password-protected file, so
 * the owner key never has to go into a browser. Writes to project.json's relays (or RELAYS) and every announced relay.
 */
const request = parseAppointArgs(process.argv.slice(2));

if ('error' in request) {
  console.error(request.error);
  process.exit(1);
}

const secret = await readSecret(fromInvocation(request.keyFile), {});

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

const { db, relays } = await connectProject(owner, process.env);

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
