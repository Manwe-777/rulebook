import { MAX_ZOOM, MIN_ZOOM } from '../constants';

/** Quarter turns clockwise. */
export type Rotation = 0 | 90 | 180 | 270;

/**
 * How a photo sits in the square crop frame, which is 1 × 1: `zoom` 1 is the smallest size that still covers it, and
 * `panX`/`panY` move the photo's centre away from the frame's centre, in frame widths.
 */
export interface CropView {
  rotation: Rotation;
  zoom: number;
  panX: number;
  panY: number;
}

const clamp = (value: number, max: number) => Math.min(max, Math.max(-max, value));

/**
 * A photo being cropped to a square. Every change returns a new crop and keeps the photo covering the whole frame, so
 * the saved square never has empty corners.
 */
export class PhotoCrop {
  private constructor(
    readonly width: number,
    readonly height: number,
    readonly view: CropView,
  ) {}

  /** The photo centred, as small as still covers the frame. */
  static start(width: number, height: number): PhotoCrop {
    return new PhotoCrop(width, height, { rotation: 0, zoom: MIN_ZOOM, panX: 0, panY: 0 });
  }

  /** The photo's size once turned: a quarter turn swaps width and height. */
  get turned(): { width: number; height: number } {
    const { width, height } = this;

    return this.view.rotation % 180 === 0 ? { width, height } : { width: height, height: width };
  }

  /** Frame widths per pixel of the photo. */
  get scale(): number {
    return this.view.zoom / Math.min(this.turned.width, this.turned.height);
  }

  /** Moves the photo by a drag of `dx`, `dy` pixels in a frame `frame` pixels wide. */
  pan(dx: number, dy: number, frame: number): PhotoCrop {
    return this.with({ panX: this.view.panX + dx / frame, panY: this.view.panY + dy / frame });
  }

  /** Zooms around the middle of the frame: the part of the photo there stays there. */
  zoomTo(zoom: number): PhotoCrop {
    const target = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
    const factor = target / this.view.zoom;

    return this.with({ zoom: target, panX: this.view.panX * factor, panY: this.view.panY * factor });
  }

  zoomBy(factor: number): PhotoCrop {
    return this.zoomTo(this.view.zoom * factor);
  }

  /** Turns the photo a quarter clockwise; the pan turns with it so the same part stays in view. */
  rotate(): PhotoCrop {
    const rotation = ((this.view.rotation + 90) % 360) as Rotation;

    return this.with({ rotation, panX: -this.view.panY, panY: this.view.panX });
  }

  /**
   * Where to draw the photo in a frame `size` pixels wide: translate to `x`, `y` (the photo's centre), turn by
   * `rotation` degrees, scale by `scale`, then draw the photo centred on the origin.
   */
  transform(size: number): { x: number; y: number; rotation: Rotation; scale: number } {
    return {
      x: size / 2 + this.view.panX * size,
      y: size / 2 + this.view.panY * size,
      rotation: this.view.rotation,
      scale: this.scale * size,
    };
  }

  /** A crop with the change applied, zoom kept in range and the pan pulled back so the photo still covers the frame. */
  private with(change: Partial<CropView>): PhotoCrop {
    const next = { ...this.view, ...change };
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.zoom));
    const sized = new PhotoCrop(this.width, this.height, { ...next, zoom });
    const maxX = (sized.turned.width * sized.scale - 1) / 2;
    const maxY = (sized.turned.height * sized.scale - 1) / 2;

    return new PhotoCrop(this.width, this.height, {
      ...sized.view,
      panX: clamp(next.panX, maxX),
      panY: clamp(next.panY, maxY),
    });
  }
}
