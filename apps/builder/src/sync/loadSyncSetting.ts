import { SYNC_KEY } from '../constants';

/** Whether this device syncs its lists. False when storage can't be read. */
export function loadSyncSetting(): boolean {
  try {
    return localStorage.getItem(SYNC_KEY) === '1';
  } catch {
    return false;
  }
}
