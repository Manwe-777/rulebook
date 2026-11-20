import { describe, expect, it } from 'vitest';

import { rulesFreshness } from './rulesFreshness';

describe('rulesFreshness', () => {
  const now = Date.UTC(2026, 10, 19, 12);

  it('says the rules are current once the relays answered, and when', () => {
    expect(rulesFreshness('relays', now - 2 * 60_000, now)).toEqual({
      tone: 'good',
      text: 'Up to date with the relays (checked 2 min ago)',
    });
  });

  it('offline, says how old the copy on this device is', () => {
    expect(rulesFreshness('offline', now - 3 * 86_400_000, now).text).toBe(
      'Offline: using the copy on this device, last checked 3 days ago',
    );
  });

  it('with nothing saved and no relay, says only the demo is available', () => {
    expect(rulesFreshness('failed', null, now).tone).toBe('bad');
    expect(rulesFreshness('failed', null, now).text).toMatch(/demo/);
  });
});
