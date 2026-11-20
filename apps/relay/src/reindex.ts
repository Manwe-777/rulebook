import { legacyIndexes, type LegacyValue, RulebookClient, TOPIC } from '@rulebook/sharing';
import { projectSettings } from '@rulebook/sharing/project';
import { getPublicKey, getTagValue, parseKeyTag, verifyEvent } from 'tool-db';

import { connectProject } from './connectProject';
import { fromInvocation } from './fromInvocation';
import { readSecret } from './readSecret';

/** tool-db's kind for values. */
const VALUE_KIND = 30078;
/** How long to wait for the relays to send every stored value. */
const READ_ALL_MS = 60_000;

/**
 * Moves data written before the lists became maps into the maps (docs/sharing.md): heads, releases, relays, requests
 * and proposals, each checked against the old write rules, plus the `index` of every faction's newest release. Signed
 * with the owner key, which may set any entry. Running it again adds nothing.
 *
 * Usage: npm run reindex -w @rulebook/relay -- <owner key file> (or `RULEBOOK_SECRET` set to the owner key in hex)
 */
const keyFile = process.argv[2];
const secret = await readSecret(keyFile ? fromInvocation(keyFile) : undefined, process.env);

if (!secret) {
  console.error('Wrong password, or not an owner key file.');
  process.exit(1);
}

const owner = getPublicKey(secret);
const projectOwner = projectSettings({ owner: process.env.RULEBOOK_OWNER }).owner;

if (owner !== projectOwner) {
  console.error(`That key (${owner}) is not the project owner (${projectOwner || 'none set'}).`);
  process.exit(1);
}

const { db, relays } = await connectProject(owner, process.env);

await db.keysSignIn(secret);

const events = await db.relays.query([{ kinds: [VALUE_KIND], '#t': [TOPIC] }], READ_ALL_MS);
const values: LegacyValue[] = [];

for (const event of events) {
  const key = parseKeyTag(TOPIC, getTagValue(event, 'd') ?? '');

  if (key === undefined || !verifyEvent(event)) continue;

  try {
    values.push({ key, author: event.pubkey, createdAt: event.created_at, value: JSON.parse(event.content) });
  } catch {
    // Not a value; skip it.
  }
}

console.log(`Read ${values.length} values from ${db.relays.connected} of ${relays.length} relays.`);

const client = new RulebookClient(db, owner, 0);
// Each faction's maintainers are read once, not once per value.
const maintainers = new Map<string, Promise<string[]>>();

const isMaintainer = async (faction: string, pubkey: string) => {
  if (pubkey === owner) return true;
  if (!maintainers.has(faction)) maintainers.set(faction, client.roles.maintainers(faction));

  return (await maintainers.get(faction)!).includes(pubkey);
};

const maps = await legacyIndexes(values, isMaintainer);

// Every map at once: a relay that never answers makes each read wait its full timeout.
await Promise.all(
  Object.entries(maps).map(async ([key, entries]) => {
    await client.setEntries(key, entries);
    console.log(`${key}: ${Object.keys(entries).length} entries`);
  }),
);

await db.close();
