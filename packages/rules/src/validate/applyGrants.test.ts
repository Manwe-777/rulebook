import { describe, expect, it } from 'vitest';

import { demoLibrary } from '../testing/demoList';
import type { Detachment, ListEntry } from '../types';
import { applyGrants } from './applyGrants';

const unit = (id: string) => demoLibrary.unit('demo-host', id)!.unit;

const resolved = (id: string, n: number) =>
  Array.from({ length: n }, (_, i) => ({ entry: { id: `${id}${i}` } as ListEntry, unit: unit(id), copy: i + 1 }));

const detachment = (grants: Detachment['grants']) => ({ grants }) as Detachment;

describe('applyGrants', () => {
  it('gives the roles and keywords to every matching unit, leaving the datasheet itself unchanged', () => {
    const [first] = applyGrants(resolved('veteran-squad', 1), [
      detachment([{ units: { ids: ['veteran-squad'], not: false }, roles: ['battleline'], keywords: ['BATTLELINE'] }]),
    ]);

    expect(first.unit.roles).toContain('battleline');
    expect(first.unit.keywords).toContain('BATTLELINE');
    expect(unit('veteran-squad').roles).not.toContain('battleline');
  });

  it('with a max, only that many units in list order get it', () => {
    const grants = applyGrants(resolved('armoured-carrier', 3), [
      detachment([{ units: { keywords: ['TRANSPORT'], not: false }, roles: ['character'], keywords: [], max: 2 }]),
    ]);

    expect(grants.map((r) => r.unit.roles.includes('character'))).toEqual([true, true, false]);
  });

  it('units the grant does not select stay as they are', () => {
    const [captain] = applyGrants(resolved('field-captain', 1), [
      detachment([{ units: { ids: ['veteran-squad'], not: false }, roles: ['battleline'], keywords: [] }]),
    ]);

    expect(captain.unit).toBe(unit('field-captain'));
  });
});
