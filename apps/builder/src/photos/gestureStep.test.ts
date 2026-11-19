import { describe, expect, it } from 'vitest';

import { gestureStep } from './gestureStep';

describe('gestureStep', () => {
  it('one finger or the mouse drags without zooming', () => {
    expect(gestureStep([{ x: 10, y: 10 }], [{ x: 25, y: 4 }])).toEqual({ dx: 15, dy: -6, zoom: 1 });
  });

  it('two fingers moving apart zoom in by how much farther apart they are', () => {
    const step = gestureStep(
      [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
      ],
      [
        { x: 50, y: 100 },
        { x: 250, y: 100 },
      ],
    );

    expect(step).toEqual({ dx: 0, dy: 0, zoom: 2 });
  });

  it('two fingers moving together drag by how far their middle moved', () => {
    const step = gestureStep(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      [
        { x: 5, y: 8 },
        { x: 15, y: 8 },
      ],
    );

    expect(step).toEqual({ dx: 5, dy: 8, zoom: 1 });
  });

  it('a finger landing or lifting mid-gesture causes no jump', () => {
    expect(
      gestureStep(
        [{ x: 0, y: 0 }],
        [
          { x: 0, y: 0 },
          { x: 90, y: 90 },
        ],
      ),
    ).toEqual({ dx: 0, dy: 0, zoom: 1 });
  });

  it('two fingers on the same spot don’t zoom by infinity', () => {
    const same = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ];

    expect(
      gestureStep(same, [
        { x: 5, y: 5 },
        { x: 50, y: 5 },
      ]).zoom,
    ).toBe(1);
  });
});
