import type { ReleaseInfo } from '@rulebook/sharing';
import { createContext } from 'react';

/** The release each faction (and `core`) is on, and when the relays last gave them; empty for the demo. */
export interface Releases {
  releases: ReleaseInfo[];
  /** When the relays gave these releases: now, or when the saved copy was saved; null with none. */
  checkedAt: number | null;
}

export const ReleasesContext = createContext<Releases>({ releases: [], checkedAt: null });
