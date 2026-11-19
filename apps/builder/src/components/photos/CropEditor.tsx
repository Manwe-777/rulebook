import { useEffect, useRef, useState } from 'react';

import { MAX_ZOOM, MIN_ZOOM } from '../../constants';
import { useCropGesture } from '../../hooks/useCropGesture';
import { drawCrop } from '../../photos/drawCrop';
import { PhotoCrop } from '../../photos/PhotoCrop';
import { BUTTON, BUTTON_QUIET } from '../styles';

interface Props {
  photo: ImageBitmap;
  onSave: (crop: PhotoCrop) => void;
  onCancel: () => void;
  busy: boolean;
}

/** Frame size on screen, in CSS pixels. */
const FRAME = 288;

/** Square crop of a new photo: drag or pinch to place it, zoom with the slider or the wheel, turn in quarter turns. */
export default function CropEditor({ photo, onSave, onCancel, busy }: Props) {
  const [crop, setCrop] = useState(() => PhotoCrop.start(photo.width, photo.height));
  const canvas = useRef<HTMLCanvasElement>(null);
  const gesture = useCropGesture(({ dx, dy, zoom }) => setCrop((c) => c.zoomBy(zoom).pan(dx, dy, FRAME)));

  // The preview is drawn by the same code as the saved picture, so they always match.
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    const pixels = Math.round(FRAME * window.devicePixelRatio);

    if (!ctx || !canvas.current) return;

    canvas.current.width = pixels;
    canvas.current.height = pixels;
    drawCrop(ctx, photo, crop, pixels);
  }, [photo, crop]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvas}
        aria-label="Photo crop: drag to move, pinch or scroll to zoom"
        className="cursor-grab touch-none rounded-lg bg-black/40 active:cursor-grabbing"
        style={{ width: FRAME, height: FRAME }}
        {...gesture}
      />
      <div className="flex w-full items-center gap-3" style={{ maxWidth: FRAME }}>
        <label className="flex flex-1 items-center gap-2 text-sm font-semibold uppercase">
          Zoom
          <input
            type="range"
            className="flex-1 accent-bar"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={crop.view.zoom}
            onChange={(e) => setCrop((c) => c.zoomTo(Number(e.target.value)))}
          />
        </label>
        <button
          type="button"
          className={BUTTON_QUIET}
          aria-label="Turn a quarter"
          onClick={() => setCrop((c) => c.rotate())}
        >
          ↻
        </button>
      </div>
      <div className="flex gap-2">
        <button type="button" className={BUTTON_QUIET} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={BUTTON} disabled={busy} onClick={() => onSave(crop)}>
          Save photo
        </button>
      </div>
    </div>
  );
}
