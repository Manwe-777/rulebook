import type { Unit } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { unitSections } from './unitSections';

const unit = (id: string, roles: string[] = []) => ({ id, name: id, roles }) as unknown as Unit;

const shape = (units: Unit[]) => unitSections(units).map((s) => [s.title, ...s.units.map((u) => u.id)]);

describe('unitSections', () => {
  it('puts each unit under its role, in heading order, with role-less units last', () => {
    const units = [
      unit('rhino', ['dedicated-transport']),
      unit('tank'),
      unit('troops', ['battleline']),
      unit('lord', ['character']),
    ];

    expect(shape(units)).toEqual([
      ['Characters', 'lord'],
      ['Battleline', 'troops'],
      ['Dedicated transports', 'rhino'],
      ['Other datasheets', 'tank'],
    ]);
  });

  it('an epic hero is listed once, under Epic heroes rather than Characters', () => {
    expect(shape([unit('hero', ['character', 'epic-hero']), unit('lord', ['character'])])).toEqual([
      ['Epic heroes', 'hero'],
      ['Characters', 'lord'],
    ]);
  });

  it('keeps the given order inside a heading and leaves out empty headings', () => {
    expect(shape([unit('b'), unit('a')])).toEqual([['Other datasheets', 'b', 'a']]);
    expect(unitSections([])).toEqual([]);
  });
});
