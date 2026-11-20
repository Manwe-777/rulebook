import { describe, expect, it } from 'vitest';

import { syncStatusText } from './syncStatusText';

describe('syncStatusText', () => {
  const now = 10 * 60_000;

  it('says when this device last synced', () => {
    expect(syncStatusText('synced', now - 2 * 60_000, now)).toBe('Synced 2 min ago');
  });

  it('reassures that lists are still on the device when the relays are out of reach', () => {
    expect(syncStatusText('failed', null, now)).toContain('still saved on this device');
  });

  it('says nothing for states the panel explains itself', () => {
    expect(syncStatusText('off', null, now)).toBe('');
  });
});
