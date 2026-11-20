import { RulebookRelay } from '@rulebook/sharing/relay';
import { ToolDbLeveldb } from '@tool-db/leveldb-store';
import { generateSecretKey } from 'tool-db';

import { readConfig } from './readConfig';
import { runNetwork } from './runNetwork';

const config = readConfig(process.env);

if ('errors' in config) {
  for (const error of config.errors) console.error(error);
  process.exit(1);
}

// Used by the installer to check the settings before replacing a running relay.
if (process.argv.includes('--check-config')) process.exit(0);

// Announcements are signed with the node key, so it must be known here even when the settings don't give one.
const secretKey = config.secretKey ?? generateSecretKey();

const relay = new RulebookRelay({
  owner: config.owner,
  port: config.port,
  host: config.host,
  storageAdapter: ToolDbLeveldb,
  storageName: config.dataDir,
  secretKey,
});

await relay.start();
console.log(`Rulebook relay listening on ${relay.url}, node key ${relay.pubkey}`);

console.log(
  config.owner
    ? `Checking writes against owner ${config.owner}`
    : 'No owner key: open store, keeping any signed data on the topic (apps still check it)',
);

console.log(
  config.publicUrl
    ? `Announcing ${config.publicUrl} and syncing with ${config.bootstrap.length} bootstrap relays`
    : `Not announcing (no RELAY_PUBLIC_URL); syncing with ${config.bootstrap.length} bootstrap relays`,
);

const stopNetwork = runNetwork(config, secretKey, `ws://127.0.0.1:${config.port}`);

const stop = async () => {
  stopNetwork();
  await relay.close();
  process.exit(0);
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
