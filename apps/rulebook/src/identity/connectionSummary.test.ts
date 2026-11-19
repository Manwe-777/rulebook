import { describe, expect, it } from 'vitest';

import { connectionSummary } from './connectionSummary';

describe('connectionSummary', () => {
  it('only allows changes while a relay is connected', () => {
    expect(connectionSummary('connected', 'ready').canWrite).toBe(true);
    expect(connectionSummary('connecting', 'ready').canWrite).toBe(false);
    expect(connectionSummary('reconnecting', 'ready').canWrite).toBe(false);
    expect(connectionSummary('failed', 'ready').canWrite).toBe(false);
    expect(connectionSummary('offline', 'ready').canWrite).toBe(false);
  });

  it('a locked key blocks changes even when connected', () => {
    const summary = connectionSummary('connected', 'locked');

    expect(summary.canWrite).toBe(false);
    expect(summary.detail).toMatch(/unlock/i);
  });

  it('anonymous visitors can still contribute, since a key is made on their first change', () => {
    expect(connectionSummary('connected', 'anonymous').canWrite).toBe(true);
  });

  it('a lost connection is shown as pending, an unreachable one as an error', () => {
    expect(connectionSummary('reconnecting', 'ready').tone).toBe('pending');
    expect(connectionSummary('failed', 'ready').tone).toBe('bad');
  });
});
