import { formatAgo } from '@rulebook/rules';

import type { SourceStatus } from '../library/SourceContext';

/** One line on how current the rules are: where they come from and when the relays last gave them. */
export function rulesFreshness(
  status: SourceStatus,
  checkedAt: number | null,
  now: number,
): {
  tone: 'good' | 'pending' | 'bad' | 'muted';
  text: string;
} {
  const checked = checkedAt === null ? '' : `, last checked ${formatAgo(checkedAt, now)}`;

  switch (status) {
    case 'relays':
      return { tone: 'good', text: `Up to date with the relays (checked ${formatAgo(checkedAt ?? now, now)})` };
    case 'cached':
      return {
        tone: 'pending',
        text: `Checking the relays for newer rules; showing the copy on this device${checked}`,
      };
    case 'offline':
      return { tone: 'bad', text: `Offline: using the copy on this device${checked}` };
    case 'loading':
      return { tone: 'pending', text: 'Loading rules from the relays…' };
    case 'failed':
      return { tone: 'bad', text: 'Could not reach the relays and nothing is saved on this device; demo faction only' };
    default:
      return { tone: 'muted', text: 'No relays configured; demo faction only' };
  }
}
