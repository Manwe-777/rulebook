import { DEFAULT_THEME } from '../constants';
import type { FactionTheme } from '../types';

type Themed = { color?: string; icon?: string };

/** Header colour and icon for a datasheet: the unit's own `color` / `icon` first, then its faction's, then neutral. */
export function factionTheme(unit: Themed, faction: Themed): FactionTheme {
  return {
    color: unit.color ?? faction.color ?? DEFAULT_THEME.color,
    icon: unit.icon ?? faction.icon ?? DEFAULT_THEME.icon,
  };
}
