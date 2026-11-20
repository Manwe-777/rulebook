import { encode } from 'uqr';

/** A QR code for `text` as one SVG path of its dark squares, and its width in squares (for the viewBox). */
export function qrPath(text: string): { size: number; d: string } {
  const { data, size } = encode(text);
  const d = data.flatMap((row, y) => row.flatMap((dark, x) => (dark ? [`M${x} ${y}h1v1h-1z`] : []))).join('');

  return { size, d };
}
