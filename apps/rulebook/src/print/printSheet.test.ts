import { listSchema } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { bundledLibrary as library } from '../library/bundledLibrary';
import { printSheet } from './printSheet';

const list = listSchema.parse({
  name: 'Shield Wall 2000',
  battleSize: 'strike-force',
  faction: 'demo-host',
  detachments: ['shield-wall'],
  warlord: 'captain',
  units: [
    { id: 'vets', unit: 'veteran-squad', models: 5, wargear: [{ option: 'melta', models: 2, choice: ['melta-gun'] }] },
    { id: 'troopers', unit: 'line-troopers', models: 10, wargear: [] },
    {
      id: 'captain',
      unit: 'field-captain',
      models: 1,
      enhancement: 'banner-of-resolve',
      attachedTo: 'troopers',
      wargear: [{ option: 'launcher', models: 1, choice: ['grenade-launcher'] }],
    },
    { id: 'troopers-2', unit: 'line-troopers', models: 10, wargear: [] },
  ],
});

describe('printSheet', () => {
  const sheet = printSheet(list, library);

  it('names the faction, battle size and detachments taken', () => {
    expect(sheet.faction?.name).toBe('Demo Host');
    expect(sheet.battleSize).toBe('Strike Force');
    expect(sheet.detachments.map((d) => d.id)).toEqual(['shield-wall']);
  });

  it('prints an attached character in its combined unit, before the unit it leads, with the group’s total', () => {
    const combined = sheet.groups.find((g) => g.combined)!;

    expect(combined.entries.map((e) => e.id)).toEqual(['captain', 'troopers']);
    expect(combined.points).toBe(combined.entries[0].points + combined.entries[1].points);
    expect(sheet.groups.map((g) => g.entries.length)).toEqual([1, 2, 1]);
  });

  it('says what wargear was swapped, the enhancement taken and who is the warlord', () => {
    const captain = sheet.groups.flatMap((g) => g.entries).find((e) => e.id === 'captain')!;
    const vets = sheet.groups.flatMap((g) => g.entries).find((e) => e.id === 'vets')!;

    expect(vets.wargear).toEqual(['2× Melta gun (replacing Carbine)']);
    expect(captain).toMatchObject({ enhancement: 'Banner of Resolve', warlord: true });
    expect(captain.wargear).toEqual(['1× Grenade launcher (replacing Service pistol)']);
  });

  it('lists each datasheet once, and the enhancements taken with their bearer', () => {
    expect(sheet.datasheets.map((u) => u.id)).toEqual(['veteran-squad', 'line-troopers', 'field-captain']);
    expect(sheet.items.map((i) => [i.item.name, i.bearer])).toEqual([['Banner of Resolve', 'Field Captain']]);
  });

  it('adds up to the same points as the builder', () => {
    expect(sheet.points).toBe(sheet.groups.reduce((sum, g) => sum + g.points, 0) + (sheet.detachments[0].points ?? 0));
  });
});
