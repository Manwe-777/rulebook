import { useState } from 'react';

import type { ArmySync } from '../../hooks/useArmySync';
import { syncStatusText } from '../../utils/syncStatusText';
import { BUTTON, BUTTON_QUIET, PANEL, PANEL_TITLE } from '../styles';
import LinkDeviceDialog from './LinkDeviceDialog';
import SyncHelp from './SyncHelp';
import UnlockForm from './UnlockForm';

/** Turns syncing between devices on and off, shows how it is going, and links more devices. */
export default function SyncPanel({ sync, now }: { sync: ArmySync; now: number }) {
  const [linking, setLinking] = useState(false);
  const running = ['connecting', 'synced', 'failed'].includes(sync.status);

  return (
    <section className={PANEL}>
      <h2 className={PANEL_TITLE}>Sync between devices</h2>
      <div className="flex flex-col gap-3 p-3">
        {sync.status === 'off' && (
          <>
            <p className="text-sm">
              Your lists are saved on this device only. Turn on sync to have them on your phone and your computer, kept
              up to date on both.
            </p>
            <button type="button" className={`${BUTTON} self-start`} onClick={sync.turnOn}>
              Turn on sync
            </button>
          </>
        )}
        {sync.status === 'extension' && (
          <p className="text-sm">
            This device signs with a browser extension, whose key can't be shared with your phone. In the Rulebook's
            Account page, import your key into this browser to sync.
          </p>
        )}
        {sync.status === 'locked' && <UnlockForm onUnlock={sync.unlock} />}
        {running && (
          <>
            <p className={`text-sm ${sync.status === 'failed' ? 'text-red-300' : 'text-text/80'}`}>
              {syncStatusText(sync.status, sync.lastSync, now)}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={BUTTON} onClick={() => setLinking(true)}>
                Link a phone or another device
              </button>
              <button type="button" className={BUTTON_QUIET} onClick={sync.turnOff}>
                Turn off
              </button>
            </div>
          </>
        )}
        <SyncHelp />
      </div>
      {linking && <LinkDeviceDialog makeLink={sync.link} onClose={() => setLinking(false)} />}
    </section>
  );
}
