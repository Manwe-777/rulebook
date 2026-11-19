import type { ArmyDraft } from '../army/ArmyDraft';
import { STORAGE_KEY } from '../constants';

/** Saves the list in this browser. Does nothing when storage can't be used. */
export function saveDraft(draft: ArmyDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage is full or blocked; the list still works for this visit.
  }
}
