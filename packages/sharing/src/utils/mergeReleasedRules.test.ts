import { describe, expect, it } from 'vitest';

import type { ReleasedRules, ReleaseInfo } from '../schemas';
import { mergeReleasedRules } from './mergeReleasedRules';

const release = (faction: string, date: string): ReleaseInfo => ({
  faction,
  date,
  version: date,
  hash: `${faction}-${date}`,
  notes: '',
  records: 1,
});

const rules = (...entries: [string, string, string][]): ReleasedRules => ({
  files: entries.map(([faction, , source]) => ({ path: `${faction}/faction.md`, source })),
  releases: entries.map(([faction, date]) => release(faction, date)),
});

const sources = (r: ReleasedRules) => r.files.map((f) => f.source).sort();

describe('mergeReleasedRules', () => {
  it('a faction the relays did not return this time keeps its saved rules', () => {
    const saved = rules(['orks', '2026-11-01', 'orks v1'], ['tyranids', '2026-11-01', 'nids v1']);
    const fresh = rules(['orks', '2026-11-20', 'orks v2']);

    const merged = mergeReleasedRules(saved, fresh);

    expect(sources(merged)).toEqual(['nids v1', 'orks v2']);
    expect(merged.releases.map((r) => r.faction).sort()).toEqual(['orks', 'tyranids']);
  });

  it('a newer release from the relays replaces the saved one', () => {
    const merged = mergeReleasedRules(rules(['orks', '2026-11-01', 'old']), rules(['orks', '2026-11-20', 'new']));

    expect(sources(merged)).toEqual(['new']);
  });

  it('an older release from a lagging relay never replaces a newer saved one', () => {
    const merged = mergeReleasedRules(rules(['orks', '2026-11-20', 'new']), rules(['orks', '2026-11-01', 'old']));

    expect(sources(merged)).toEqual(['new']);
  });

  it('a faction new on the relays is added', () => {
    const merged = mergeReleasedRules(
      rules(['orks', '2026-11-01', 'orks']),
      rules(['necrons', '2026-11-20', 'necrons']),
    );

    expect(sources(merged)).toEqual(['necrons', 'orks']);
  });
});
