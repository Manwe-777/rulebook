import { RulebookRelay } from '@rulebook/sharing/relay';
import { ToolDbLeveldb } from '@tool-db/leveldb-store';

import { readConfig } from './readConfig';

const config = readConfig(process.env);

if ('errors' in config) {
  for (const error of config.errors) console.error(error);
  process.exit(1);
}

// Used by the installer to check the settings before replacing a running relay.
if (process.argv.includes('--check-config')) process.exit(0);

const relay = new RulebookRelay({
  owner: config.owner,
  port: config.port,
  host: config.host,
  storageAdapter: ToolDbLeveldb,
  storageName: config.dataDir,
  secretKey: config.secretKey,
});

await relay.start();
console.log(`Rulebook relay listening on ${relay.url}, node key ${relay.pubkey}`);

console.log(
  config.owner
    ? `Checking writes against owner ${config.owner}`
    : 'No owner key: open store, keeping any signed data on the topic (apps still check it)',
);

const stop = async () => {
  await relay.close();
  process.exit(0);
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
