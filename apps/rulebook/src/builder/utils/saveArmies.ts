import type { SavedArmies } from '../army/SavedArmies';
import { ARMIES_KEY } from '../constants';

/** Saves every army in this browser. Does nothing when storage can't be used. */
export function saveArmies(saved: SavedArmies) {
  try {
    localStorage.setItem(ARMIES_KEY, JSON.stringify(saved));
  } catch {
    // Storage is full or blocked; the armies still work for this visit.
  }
}
