import { describe, expect, it } from 'vitest';

import { listSchema } from '../schemas/listSchema';
import { decodeListLink } from './decodeListLink';
import { encodeListLink } from './encodeListLink';

const list = listSchema.parse({
  name: 'Ünïcødé “army” ⚔',
  battleSize: 'strike-force',
  faction: 'demo-host',
  detachments: ['shield-wall'],
  warlord: 'field-captain-1',
  units: [{ id: 'field-captain-1', unit: 'field-captain', models: 1, wargear: [], attachedTo: 'line-troopers-1' }],
});

describe('list links', () => {
  it('a list survives the trip through a link, any name included', () => {
    expect(decodeListLink(encodeListLink(list))).toEqual(list);
  });

  it('the link only uses characters that are safe in a URL', () => {
    expect(encodeListLink(list)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('text that is not a list gives null instead of failing', () => {
    expect(decodeListLink('not base64 at all!')).toBeNull();
    expect(decodeListLink(btoa('{"units": 3}'))).toBeNull();
    expect(decodeListLink('')).toBeNull();
  });
});
