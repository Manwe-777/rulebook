import type { CSSProperties } from 'react';

import { MIN_TEXT_CONTRAST } from '../constants';

type Rgb = [number, number, number];

const toRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;

const toHex = (rgb: Rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;

/** WCAG relative luminance. */
function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;

    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast of white text on this colour. */
export function contrastWithWhite(hex: string): number {
  return 1.05 / (luminance(toRgb(hex)) + 0.05);
}

const darker = (rgb: Rgb, amount: number): Rgb => rgb.map((c) => c * (1 - amount)) as Rgb;

/**
 * The faction's colour as the builder's accent: bars, headers and buttons inside the element take it. Colours too
 * light for white text are darkened just enough, so any colour a faction picks stays readable. No colour (or an
 * invalid one) keeps the default accent.
 */
export function factionTint(color: string | undefined): CSSProperties {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return {};

  let rgb = toRgb(color);

  for (let step = 0; step < 50 && contrastWithWhite(toHex(rgb)) < MIN_TEXT_CONTRAST; step += 1) rgb = darker(rgb, 0.05);

  return { '--color-bar': toHex(rgb), '--color-bar-dark': toHex(darker(rgb, 0.3)) } as CSSProperties;
}
