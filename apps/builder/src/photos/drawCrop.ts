import type { PhotoCrop } from './PhotoCrop';

/** Draws the photo as `crop` places it into a square canvas context `size` pixels wide. */
export function drawCrop(ctx: CanvasRenderingContext2D, photo: ImageBitmap, crop: PhotoCrop, size: number): void {
  const t = crop.transform(size);

  ctx.save();
  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(t.x, t.y);
  ctx.rotate((t.rotation * Math.PI) / 180);
  ctx.scale(t.scale, t.scale);
  ctx.drawImage(photo, -photo.width / 2, -photo.height / 2);
  ctx.restore();
}
