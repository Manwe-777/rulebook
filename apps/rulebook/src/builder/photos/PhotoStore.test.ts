import 'fake-indexeddb/auto';

import { describe, expect, it, vi } from 'vitest';

import { PhotoStore } from './PhotoStore';

const photo = (text: string) => new Blob([text], { type: 'image/webp' });

describe('PhotoStore', () => {
  it('keeps one photo per unit of a faction, and the same unit of another faction separately', async () => {
    const store = new PhotoStore('photos-a');

    await store.set('host', 'captain', photo('mine'));
    await store.set('other', 'captain', photo('theirs'));

    expect(await (await store.get('host', 'captain'))?.text()).toBe('mine');
    expect(await (await store.get('other', 'captain'))?.text()).toBe('theirs');
    expect((await store.keys()).sort()).toEqual(['host/captain', 'other/captain']);
  });

  it('a new photo replaces the old one, and removing leaves none', async () => {
    const store = new PhotoStore('photos-b');

    await store.set('host', 'captain', photo('old'));
    await store.set('host', 'captain', photo('new'));
    expect(await (await store.get('host', 'captain'))?.text()).toBe('new');

    await store.remove('host', 'captain');
    expect(await store.get('host', 'captain')).toBeNull();
  });

  it('tells subscribers which photo changed, until they unsubscribe', async () => {
    const store = new PhotoStore('photos-c');
    const heard = vi.fn();
    const stop = store.subscribe(heard);

    await store.set('host', 'captain', photo('x'));
    await store.remove('host', 'captain');
    stop();
    await store.set('host', 'troopers', photo('y'));

    expect(heard.mock.calls).toEqual([['host/captain'], ['host/captain']]);
  });
});
