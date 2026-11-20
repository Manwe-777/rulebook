import { useContext } from 'react';

import { type Releases, ReleasesContext } from '../library/ReleasesContext';

/** The release each faction is on, and when the relays last gave them. */
export function useReleases(): Releases {
  return useContext(ReleasesContext);
}
