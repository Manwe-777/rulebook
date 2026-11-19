import { createContext } from 'react';

/** Where the shown rules come from: the bundled demo only, the relays (loading, loaded, or failed). */
export type SourceStatus = 'demo' | 'loading' | 'relays' | 'failed';

export const SourceContext = createContext<SourceStatus>('demo');
