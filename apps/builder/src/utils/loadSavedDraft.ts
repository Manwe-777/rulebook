import { ArmyDraft } from '../army/ArmyDraft';
import { BACKUP_KEY, STORAGE_KEY } from '../constants';

/**
 * The list saved in this browser, or null. A save that can't be read is moved to a backup key so it isn't lost, and
 * storage that can't be used at all (private mode, blocked) just gives null.
 */
export function loadSavedDraft(): ArmyDraft | null {
  try {
    const text = localStorage.getItem(STORAGE_KEY);

    if (text === null) return null;

    let raw: unknown = null;

    try {
      raw = JSON.parse(text);
    } catch {
      // Unreadable JSON is backed up below like any other bad save.
    }

    const draft = ArmyDraft.fromSave(raw);

    if (!draft) {
      localStorage.setItem(BACKUP_KEY, text);
      localStorage.removeItem(STORAGE_KEY);
    }

    return draft;
  } catch {
    return null;
  }
}
