import { ICON_MAX_WIDTH_EM, WIDE_ICONS } from '../constants';

/** How much to shrink an icon glyph so it is no wider than the others: 1 for most, less for the wide ones. */
export function iconScale(name: string): number {
  const width = WIDE_ICONS[name];

  return width ? ICON_MAX_WIDTH_EM / width : 1;
}
