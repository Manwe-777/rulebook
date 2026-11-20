import { Library, listSchema } from '@rulebook/rules';
import { describe, expect, it } from 'vitest';

import { loadBundledFiles } from '../../sources/loadBundledFiles';
import { stratagemGroups } from './stratagemGroups';

const library = Library.fromFiles(loadBundledFiles());

const list = (detachments: string[]) =>
  listSchema.parse({ name: 'L', battleSize: 'strike-force', faction: 'demo-host', detachments });

describe('stratagemGroups', () => {
  it('lists the core stratagems first, then each chosen detachment, and nothing for detachments not taken', () => {
    const groups = stratagemGroups(list(['shield-wall']), library);

    expect(groups.map((g) => g.title)).toEqual(['Core stratagems', 'Shield Wall']);
    expect(groups[0].stratagems.map((s) => s.name)).toContain('Command Re-roll');
  });

  it('a detachment id the rules no longer have is skipped', () => {
    expect(stratagemGroups(list(['gone']), library).map((g) => g.title)).toEqual(['Core stratagems']);
  });
});
