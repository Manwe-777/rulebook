import type { z } from 'zod';

import { Library } from '../library/Library';
import { listSchema } from '../schemas/listSchema';
import type { ArmyList, Muster } from '../types';
import { loadDemoFiles } from './loadDemoFiles';

/** The demo library, read once. */
export const demoLibrary = Library.fromFiles(loadDemoFiles());

/** The demo library with some muster values replaced. */
export function withMuster(patch: Partial<Muster>): Library {
  return Object.assign(Object.create(Library.prototype), demoLibrary, { muster: { ...demoLibrary.muster!, ...patch } });
}

/**
 * A legal 295 point Strike Force list: a Field Captain (with an enhancement) and a Standard Bearer attached to Line
 * Troopers, and Veterans with two melta guns. Pass changes to break one rule at a time.
 */
export function demoList(patch: Partial<z.input<typeof listSchema>> = {}): ArmyList {
  return listSchema.parse({
    name: 'Test',
    battleSize: 'strike-force',
    faction: 'demo-host',
    detachments: ['shield-wall'],
    warlord: 'captain',
    units: [
      { id: 'captain', unit: 'field-captain', models: 1, enhancement: 'banner-of-resolve', attachedTo: 'troopers' },
      { id: 'troopers', unit: 'line-troopers', models: 10 },
      {
        id: 'vets',
        unit: 'veteran-squad',
        models: 5,
        wargear: [{ option: 'melta', models: 2, choice: ['melta-gun'] }],
      },
      { id: 'bearer', unit: 'standard-bearer', models: 1, attachedTo: 'troopers' },
    ],
    ...patch,
  });
}
