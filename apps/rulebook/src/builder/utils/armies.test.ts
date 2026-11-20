import { formatAgo, Library } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { loadBundledFiles } from '../../sources/loadBundledFiles';
import { ArmyDraft } from '../army/ArmyDraft';
import { armySummary } from './armySummary';

const library = Library.fromFiles(loadBundledFiles());

describe('armySummary', () => {
  it('names the faction, battle size and detachments, and counts points, units and problems', () => {
    const troopers = ArmyDraft.create(library, 'demo-host').addUnit(library, 'line-troopers');
    const draft = troopers.draft.addUnit(library, 'line-troopers').draft.addUnit(library, 'field-captain').draft;
    const summary = armySummary(draft.list, library);

    expect(summary).toMatchObject({ faction: 'Demo Host', units: 3, unitTypes: ['line-troopers', 'field-captain'] });
    expect(summary.color).toBe(library.faction('demo-host')?.color);
    expect(summary.icon).toBe(library.faction('demo-host')?.icon);
    expect(summary.detachments).toEqual(['Armoured Column']);
    expect(summary.points).toBeGreaterThan(0);
    expect(summary.errors).toBeGreaterThan(0); // no warlord picked yet
  });

  it('shows ids for an army whose faction isn’t loaded, instead of failing', () => {
    const list = { ...ArmyDraft.create(library, 'demo-host').list, faction: 'unknown', detachments: ['mystery'] };

    expect(armySummary(list, library)).toMatchObject({
      faction: 'unknown',
      detachments: ['mystery'],
      color: undefined,
      icon: undefined,
    });
  });
});

describe('formatAgo', () => {
  const now = Date.UTC(2026, 10, 19, 12);

  it('says how long ago in the largest whole unit', () => {
    expect(formatAgo(now - 30_000, now)).toBe('just now');
    expect(formatAgo(now - 5 * 60_000, now)).toBe('5 min ago');
    expect(formatAgo(now - 3 * 3_600_000, now)).toBe('3 h ago');
    expect(formatAgo(now - 26 * 3_600_000, now)).toBe('1 day ago');
    expect(formatAgo(now - 3 * 86_400_000, now)).toBe('3 days ago');
  });

  it('gives the date after a week, and never a negative time', () => {
    expect(formatAgo(now - 10 * 86_400_000, now)).toBe(new Date(now - 10 * 86_400_000).toLocaleDateString());
    expect(formatAgo(now + 60_000, now)).toBe('just now');
  });
});

describe('ArmyDraft.withRelease', () => {
  it('records the release the list was edited with, and changes nothing when it is the same', () => {
    const draft = ArmyDraft.create(library, 'demo-host').withRelease('abc');

    expect(draft.list.release).toBe('abc');
    expect(draft.withRelease('abc')).toBe(draft);
  });
});
