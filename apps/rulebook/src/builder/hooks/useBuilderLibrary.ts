import type { Library } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';
import { useContext } from 'react';

import { useLibrary } from '../../hooks/useLibrary';
import { useReleases } from '../../hooks/useReleases';
import { SourceContext, type SourceStatus } from '../../library/SourceContext';

export type BuilderSource = SourceStatus;

export interface BuilderRules {
  library: Library;
  status: BuilderSource;
  /** The release each relay faction (and core) is on; empty for the bundled demo. */
  releases: ReleaseInfo[];
  /** When the relays last gave these rules (ms since epoch); null when they never have on this device. */
  checkedAt: number | null;
}

/** The rules the whole app loaded (see `LibraryProvider`), as the list builder uses them. */
export function useBuilderLibrary(): BuilderRules {
  const library = useLibrary();
  const status = useContext(SourceContext);
  const { releases, checkedAt } = useReleases();

  return { library, status, releases, checkedAt };
}
