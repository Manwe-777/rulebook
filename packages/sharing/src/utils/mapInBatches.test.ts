import { describe, expect, it } from 'vitest';

import { mapInBatches } from './mapInBatches';

describe('mapInBatches', () => {
  it('never runs more than the batch size at once, and keeps the results in order', async () => {
    let running = 0;
    let most = 0;

    const results = await mapInBatches([1, 2, 3, 4, 5], 2, async (n) => {
      running += 1;
      most = Math.max(most, running);
      await new Promise((r) => setTimeout(r, 6 - n));
      running -= 1;

      return n * 10;
    });

    expect(results).toEqual([10, 20, 30, 40, 50]);
    expect(most).toBe(2);
  });
});
