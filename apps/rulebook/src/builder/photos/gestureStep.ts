export interface Point {
  x: number;
  y: number;
}

const centre = (points: Point[]): Point => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
});

const spread = ([a, b]: Point[]) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * The pan and zoom between two moments of a touch or mouse gesture, given the same pointers (by id, in the same
 * order) before and after: one pointer drags; two also pinch, zooming by how much farther apart they got.
 */
export function gestureStep(before: Point[], after: Point[]): { dx: number; dy: number; zoom: number } {
  if (before.length === 0 || before.length !== after.length) return { dx: 0, dy: 0, zoom: 1 };

  const from = centre(before);
  const to = centre(after);
  const pinch = before.length >= 2 && spread(before) > 0 ? spread(after) / spread(before) : 1;

  return { dx: to.x - from.x, dy: to.y - from.y, zoom: pinch };
}
