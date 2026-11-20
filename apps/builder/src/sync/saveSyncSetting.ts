import { SYNC_KEY } from '../constants';

/** Turns syncing on or off for this device. Returns false when storage can't be used. */
export function saveSyncSetting(on: boolean): boolean {
  try {
    if (on) localStorage.setItem(SYNC_KEY, '1');
    else localStorage.removeItem(SYNC_KEY);

    return true;
  } catch {
    return false;
  }
}
