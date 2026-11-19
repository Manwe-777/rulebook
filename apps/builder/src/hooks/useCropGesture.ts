import { type PointerEvent, useRef, type WheelEvent } from 'react';

import { gestureStep, type Point } from '../photos/gestureStep';

/** How much one wheel notch zooms. */
const WHEEL_ZOOM = 1.1;

/**
 * Pointer and wheel handlers for the crop frame: drag with a mouse or one finger, pinch with two, or scroll to zoom.
 * Each movement is reported as a step of pan (pixels) and zoom (factor).
 */
export function useCropGesture(onStep: (step: { dx: number; dy: number; zoom: number }) => void) {
  const pointers = useRef(new Map<number, Point>());

  const end = (e: PointerEvent) => pointers.current.delete(e.pointerId);

  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    },
    onPointerMove: (e: PointerEvent) => {
      if (!pointers.current.has(e.pointerId)) return;

      const before = [...pointers.current.values()];

      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      onStep(gestureStep(before, [...pointers.current.values()]));
    },
    onPointerUp: end,
    onPointerCancel: end,
    onWheel: (e: WheelEvent) => onStep({ dx: 0, dy: 0, zoom: e.deltaY < 0 ? WHEEL_ZOOM : 1 / WHEEL_ZOOM }),
  };
}
