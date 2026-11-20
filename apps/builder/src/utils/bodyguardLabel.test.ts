import { Library, listSchema } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { loadBundledFiles } from '../sources/loadBundledFiles';
import { bodyguardLabel } from './bodyguardLabel';

const library = Library.fromFiles(loadBundledFiles());

const list = listSchema.parse({
  name: 'Two squads',
  battleSize: 'strike-force',
  faction: 'demo-host',
  units: [
    { id: 't1', unit: 'line-troopers', models: 10 },
    { id: 't2', unit: 'line-troopers', models: 20 },
    { id: 'v1', unit: 'veteran-squad', models: 5 },
    { id: 'cap', unit: 'field-captain', models: 1, attachedTo: 't2' },
    { id: 'bearer', unit: 'standard-bearer', models: 1, attachedTo: 't2' },
  ],
});

const entry = (id: string) => list.units.find((u) => u.id === id)!;

describe('bodyguardLabel', () => {
  it('numbers copies of the same datasheet and says how many models each has', () => {
    expect(bodyguardLabel(list, library, entry('t1'))).toBe('Line Troopers 1 · 10 models');
    expect(bodyguardLabel(list, library, entry('v1'))).toBe('Veteran Squad · 5 models');
  });

  it('names the units already joined, leaving out the one asking', () => {
    expect(bodyguardLabel(list, library, entry('t2'))).toBe(
      'Line Troopers 2 · 20 models · with Field Captain, Standard Bearer',
    );

    expect(bodyguardLabel(list, library, entry('t2'), 'cap')).toBe(
      'Line Troopers 2 · 20 models · with Standard Bearer',
    );
  });
});
