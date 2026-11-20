import { PHOTO_QUALITY, PHOTO_SIZE } from '../constants';
import { drawCrop } from './drawCrop';
import type { PhotoCrop } from './PhotoCrop';

/** Encodes the canvas; null when the browser can't produce `type`. */
function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob?.type === type ? blob : null), type, PHOTO_QUALITY),
  );
}

/** The cropped square photo as a small WebP (JPEG where the browser can't write WebP). */
export async function renderPhoto(photo: ImageBitmap, crop: PhotoCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');

  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;

  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('This browser cannot edit photos.');

  drawCrop(ctx, photo, crop, PHOTO_SIZE);

  const blob = (await encode(canvas, 'image/webp')) ?? (await encode(canvas, 'image/jpeg'));

  if (!blob) throw new Error('This browser cannot save photos.');

  return blob;
}
