import { describe, expect, it } from 'vitest';

import { PhotoCrop } from './PhotoCrop';

/** The corners of the drawn photo, in frame pixels. */
function corners(crop: PhotoCrop, size: number) {
  const t = crop.transform(size);
  const turn = (t.rotation * Math.PI) / 180;

  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([sx, sy]) => {
    const px = (sx * crop.width) / 2;
    const py = (sy * crop.height) / 2;

    return {
      x: t.x + t.scale * (px * Math.cos(turn) - py * Math.sin(turn)),
      y: t.y + t.scale * (px * Math.sin(turn) + py * Math.cos(turn)),
    };
  });
}

/** True when the drawn photo covers the whole `size` square (allowing for rounding). */
function covers(crop: PhotoCrop, size: number) {
  const points = corners(crop, size);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const e = 1e-6;

  return Math.min(...xs) <= e && Math.max(...xs) >= size - e && Math.min(...ys) <= e && Math.max(...ys) >= size - e;
}

const portrait = () => PhotoCrop.start(3000, 4000);
const landscape = () => PhotoCrop.start(4000, 3000);

describe('PhotoCrop', () => {
  it('starts with the photo just covering the frame along its short side', () => {
    const xs = corners(portrait(), 320).map((p) => p.x);

    expect(Math.min(...xs)).toBeCloseTo(0);
    expect(Math.max(...xs)).toBeCloseTo(320);
  });

  it('the photo always covers the frame, however far it is dragged, zoomed or turned', () => {
    const steps = [
      (c: PhotoCrop) => c.pan(5000, -5000, 300),
      (c: PhotoCrop) => c.rotate(),
      (c: PhotoCrop) => c.zoomTo(3),
      (c: PhotoCrop) => c.pan(-9000, 9000, 300),
      (c: PhotoCrop) => c.zoomBy(0.1),
      (c: PhotoCrop) => c.rotate(),
    ];

    let crop = portrait();

    for (const step of steps) {
      crop = step(crop);
      expect(covers(crop, 320)).toBe(true);
    }
  });

  it('a portrait photo at the start only moves up and down, a landscape one only sideways', () => {
    expect(portrait().pan(100, 100, 300).view).toMatchObject({ panX: 0 });
    expect(portrait().pan(100, 100, 300).view.panY).toBeGreaterThan(0);
    expect(landscape().pan(100, 100, 300).view).toMatchObject({ panY: 0 });
    expect(landscape().pan(100, 100, 300).view.panX).toBeGreaterThan(0);
  });

  it('after a quarter turn a portrait photo moves sideways instead', () => {
    const turned = portrait().rotate().pan(100, 100, 300);

    expect(turned.view.panY).toBe(0);
    expect(turned.view.panX).toBeGreaterThan(0);
  });

  it('four quarter turns bring the photo back to where it was', () => {
    const start = portrait().zoomTo(2).pan(40, -30, 300);
    const back = start.rotate().rotate().rotate().rotate();

    expect(back.view.rotation).toBe(0);
    expect(back.view.panX).toBeCloseTo(start.view.panX);
    expect(back.view.panY).toBeCloseTo(start.view.panY);
  });

  it('zooming keeps the part of the photo in the middle of the frame in the middle', () => {
    const before = portrait().zoomTo(1.5).pan(0, 60, 300);
    const after = before.zoomTo(3);
    // The photo pixel under the frame's centre: offset from the photo's centre, in photo pixels.
    const under = (c: PhotoCrop) => -c.view.panY / c.scale;

    expect(under(after)).toBeCloseTo(under(before));
  });

  it('zoom stays between 1 and 4', () => {
    expect(portrait().zoomTo(0.2).view.zoom).toBe(1);
    expect(portrait().zoomBy(9).view.zoom).toBe(4);
  });

  it('zooming out pulls a dragged photo back so no corner is left empty', () => {
    const zoomedOut = portrait().zoomTo(4).pan(9000, 9000, 300).zoomTo(1);

    expect(covers(zoomedOut, 320)).toBe(true);
  });

  it('places the photo the same way at any frame size, so the saved picture matches the preview', () => {
    const crop = portrait().zoomTo(2.5).pan(30, 50, 280);
    const small = crop.transform(280);
    const big = crop.transform(320);

    expect(big.x / 320).toBeCloseTo(small.x / 280);
    expect(big.y / 320).toBeCloseTo(small.y / 280);
    expect(big.scale / 320).toBeCloseTo(small.scale / 280);
  });
});
