import { useEffect, useState } from 'react';

import type { SavedArmies } from '../army/SavedArmies';
import { loadSavedArmies } from '../utils/loadSavedArmies';
import { saveArmies } from '../utils/saveArmies';

/** Every army saved in this browser, saved again after each change. */
export function useSavedArmies(): [SavedArmies, (change: (saved: SavedArmies) => SavedArmies) => void] {
  const [saved, setSaved] = useState(loadSavedArmies);

  useEffect(() => saveArmies(saved), [saved]);

  return [saved, setSaved];
}
