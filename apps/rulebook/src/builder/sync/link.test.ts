import { generateSecretKey } from 'tool-db';
import { describe, expect, it } from 'vitest';

import { formatLinkCode } from '../utils/formatLinkCode';
import { linkFromHash } from '../utils/linkFromHash';
import { acceptLink } from './acceptLink';
import { createLink } from './createLink';

describe('linking a device', () => {
  it('the other device gets the same key from the link and the code, typed however', async () => {
    const secret = generateSecretKey();
    const { code, url } = await createLink(secret, 'https://example.org/builder/');
    const carried = linkFromHash(new URL(url).hash)!;

    expect(await acceptLink(carried, formatLinkCode(code).toLowerCase())).toEqual({ secret });
  });

  it('the link alone, or with a wrong code, gives no key', async () => {
    const { url } = await createLink(generateSecretKey(), 'https://example.org/builder/');
    const carried = linkFromHash(new URL(url).hash)!;

    expect(url).not.toContain('nsec1');
    expect(await acceptLink(carried, '')).toHaveProperty('error');
    expect(await acceptLink(carried, 'AAAAAA')).toHaveProperty('error');
  });
});
