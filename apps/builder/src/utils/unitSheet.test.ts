import { entryLoadout, Library, type ListEntry } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { loadBundledFiles } from '../sources/loadBundledFiles';
import { attackDice, totalAttacks } from './attackDice';
import { carriedWargearRules } from './carriedWargearRules';
import { combinedUnit } from './combinedUnit';
import { gearSummary } from './gearSummary';
import { loadoutLines } from './loadoutLines';
import { mergedProfiles } from './mergedProfiles';
import { weaponRows } from './weaponRows';

const library = Library.fromFiles(loadBundledFiles());
const unit = (id: string) => library.unit('demo-host', id)!.unit;

const entry = (unitId: string, models: number, wargear: ListEntry['wargear'] = []): ListEntry =>
  ({ id: unitId, unit: unitId, models, wargear }) as ListEntry;

describe('the play view of a unit', () => {
  const vets = unit('veteran-squad');
  const built = entry('veteran-squad', 10, [{ option: 'melta', models: 2, choice: ['melta-gun'] }]);
  const loadout = entryLoadout(vets, built);

  it('lists only the weapons the unit carries, each with how many', () => {
    const { ranged, melee } = weaponRows(vets, loadout, false);

    expect(ranged.map((r) => [r.weapon.name, r.count])).toEqual([
      ['Carbine', 8],
      ['Melta gun', 2],
    ]);

    expect(melee.map((r) => [r.weapon.name, r.count])).toEqual([['Combat blade', 10]]);
  });

  it('with "show all" every weapon is listed, the ones not carried with a count of 0', () => {
    const plain = entryLoadout(vets, entry('veteran-squad', 5));

    expect(weaponRows(vets, plain, true).ranged.map((r) => [r.weapon.name, r.count])).toEqual([
      ['Carbine', 5],
      ['Melta gun', 0],
    ]);
  });

  it('says what each model type carries, counting items only some of them have', () => {
    expect(loadoutLines(vets, loadout)).toEqual(['10 Veteran: 8 × Carbine, Combat blade, 2 × Melta gun']);
  });

  it('shows the rules of wargear the unit carries, all of them with "show all"', () => {
    const troopers = unit('line-troopers');

    expect(carriedWargearRules(troopers, ['signal-flare'], false)).toContain('Signal flare');
    expect(carriedWargearRules(troopers, ['service-rifle'], false)).toBeUndefined();
    expect(carriedWargearRules(troopers, [], true)).toContain('Signal flare');
  });

  it('models with the same characteristics share a row, under both names', () => {
    const base = { M: '6"', T: '4', Sv: '3+', W: '2', Ld: '6+', OC: '1' };

    expect(
      mergedProfiles([
        { name: 'Sergeant', ...base },
        { name: 'Trooper', ...base },
        { name: 'Heavy', ...base, W: '3' },
      ]).map((p) => p.name),
    ).toEqual(['Sergeant, Trooper', 'Heavy']);
  });

  it('opening a leader or its bodyguard shows the whole combined unit, bodyguard first', () => {
    const list = {
      ...built,
      units: [
        { id: 'cap', unit: 'field-captain', models: 1, wargear: [], attachedTo: 'tr' },
        { id: 'tr', unit: 'line-troopers', models: 10, wargear: [] },
        { id: 'sb', unit: 'standard-bearer', models: 1, wargear: [], attachedTo: 'tr' },
      ],
    } as never;

    for (const id of ['cap', 'tr', 'sb']) {
      const group = combinedUnit(list, id)!;

      expect([group.bodyguard.id, ...group.attached.map((e) => e.id)]).toEqual(['tr', 'cap', 'sb']);
    }

    expect(combinedUnit(list, 'missing')).toBeNull();
  });
});

describe('attack dice', () => {
  it('multiplies the attacks by how many models carry the weapon, dice included', () => {
    expect(totalAttacks('1', 10)).toBe('10');
    expect(totalAttacks('D3', 10)).toBe('10D3');
    expect(totalAttacks('D6+1', 1)).toBe('D6+1');
    expect(totalAttacks('D3+1', 3)).toBe('3D3+3');
    expect(totalAttacks('2D6', 2)).toBe('4D6');
  });

  it('says what to roll and what hits; a weapon with no hit roll hits automatically', () => {
    expect(attackDice('2', '3+', 5)).toBe('Roll 10 attacks, hitting on 3+');
    expect(attackDice('1', '4+', 1)).toBe('Roll 1 attack, hitting on 4+');
    expect(attackDice('D6', 'N/A', 2)).toBe('Roll 2D6 attacks, hitting automatically');
  });
});

describe('gear summary on play cards', () => {
  it('totals what the models carry, weapons before other wargear', () => {
    const troopers = unit('line-troopers');

    expect(gearSummary(troopers, entryLoadout(troopers, entry('line-troopers', 10)))).toEqual([
      'Service pistol',
      '10 × Close combat weapon',
      '9 × Service rifle',
      'Signal flare',
    ]);
  });
});
