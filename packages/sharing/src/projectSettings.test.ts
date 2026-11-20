import { describe, expect, it } from 'vitest';

import { PROJECT, projectSettings } from './projectSettings';

const KEY = 'a'.repeat(64);

describe('projectSettings', () => {
  it('uses project.json when a build sets nothing, or sets empty values', () => {
    const expected = { owner: PROJECT.owner, relays: PROJECT.relays };

    expect(projectSettings({})).toEqual(expected);
    expect(projectSettings({ owner: ' ', relays: '' })).toEqual(expected);
  });

  it("a build's own owner and relays win", () => {
    expect(projectSettings({ owner: KEY, relays: 'wss://a.example, wss://b.example' })).toEqual({
      owner: KEY,
      relays: ['wss://a.example', 'wss://b.example'],
    });
  });
});
