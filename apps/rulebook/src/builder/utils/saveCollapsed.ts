import { COLLAPSED_KEY } from '../constants';

/** Saves the folded unit cards; does nothing when storage can't be used. */
export function saveCollapsed(stored: Record<string, string[]>): void {
  try {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(stored));
  } catch {
    // Folding still works for this visit.
  }
}
