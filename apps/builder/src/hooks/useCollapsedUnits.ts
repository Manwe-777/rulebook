import { useState } from 'react';

import { loadCollapsed } from '../utils/loadCollapsed';
import { saveCollapsed } from '../utils/saveCollapsed';
import { toggleCollapsed } from '../utils/toggleCollapsed';

/**
 * Which unit cards of an army are folded down to their title (units lost during a game), kept on this device and
 * shared by the edit and play views, and a switch for one card.
 */
export function useCollapsedUnits(army: string): [ReadonlySet<string>, (entry: string) => void] {
  const [stored, setStored] = useState(loadCollapsed);

  const toggle = (entry: string) =>
    setStored((current) => {
      const next = toggleCollapsed(current, army, entry);

      saveCollapsed(next);

      return next;
    });

  return [new Set(stored[army]), toggle];
}
