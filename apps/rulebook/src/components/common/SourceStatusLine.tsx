import { useContext } from 'react';

import { SourceContext, type SourceStatus } from '../../library/SourceContext';

const TEXT: Record<SourceStatus, string> = {
  demo: 'Showing the demo faction.',
  loading: 'Loading rules from the relays…',
  cached: 'Showing rules saved on this device; checking the relays for newer ones…',
  relays: 'Rules loaded from the relays.',
  offline: 'Could not reach the relays; showing rules saved on this device.',
  failed: 'Could not reach the relays; showing the demo faction.',
};

/** One line saying where the rules on screen come from. */
export default function SourceStatusLine() {
  return <span>{TEXT[useContext(SourceContext)]}</span>;
}
