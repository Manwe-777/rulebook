import { describe, expect, it } from 'vitest';

import { addedMessage } from './addedMessage';

describe('addedMessage', () => {
  it('names the unit, and says how many the army has once there is more than one', () => {
    expect(addedMessage('Line Troopers', 1)).toBe('Added Line Troopers');
    expect(addedMessage('Line Troopers', 3)).toBe('Added Line Troopers · 3 in the army');
  });
});
