import type { ReleaseSource } from '@rulebook/sharing';
import { createContext } from 'react';

/** Where the shown rules come from: the bundled demo only, or releases (loading, cached, from the relays, offline). */
export type SourceStatus = 'demo' | ReleaseSource;

export const SourceContext = createContext<SourceStatus>('demo');
