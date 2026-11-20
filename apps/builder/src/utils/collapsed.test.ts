import { afterEach, describe, expect, it } from 'vitest';

import { COLLAPSED_KEY } from '../constants';
import { loadCollapsed } from './loadCollapsed';
import { saveCollapsed } from './saveCollapsed';
import { toggleCollapsed } from './toggleCollapsed';

describe('folded unit cards', () => {
  afterEach(() => localStorage.clear());

  it('folding a card twice opens it again, and an army with nothing folded is forgotten', () => {
    const once = toggleCollapsed({ other: ['x'] }, 'army', 'a');

    expect(once).toEqual({ other: ['x'], army: ['a'] });
    expect(toggleCollapsed(once, 'army', 'a')).toEqual({ other: ['x'] });
  });

  it('folding one card leaves the other cards of the army as they were', () => {
    expect(toggleCollapsed({ army: ['a', 'b'] }, 'army', 'a')).toEqual({ army: ['b'] });
  });

  it('survives a reload, and unreadable or odd saved data counts as nothing folded', () => {
    saveCollapsed({ army: ['a'] });
    expect(loadCollapsed()).toEqual({ army: ['a'] });

    localStorage.setItem(COLLAPSED_KEY, '{not json');
    expect(loadCollapsed()).toEqual({});

    localStorage.setItem(COLLAPSED_KEY, JSON.stringify({ army: 'a', ok: ['b'], bad: [1] }));
    expect(loadCollapsed()).toEqual({ ok: ['b'] });
  });
});
