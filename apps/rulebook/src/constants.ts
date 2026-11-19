import { ownerKeyHex } from '@rulebook/sharing';

import type { FactionTheme } from './types';

/** Name shown in the page header. */
export const SITE_NAME = 'Rulebook';

/** Theme when neither the unit nor its faction sets one. */
export const DEFAULT_THEME: FactionTheme = { color: '#3a3f44', icon: null };

/** Shown under the weapon tables when a weapon has several profiles. */
export const PROFILE_GROUP_NOTE =
  'Before selecting targets for this weapon, select one of its profiles to make attacks with.';

/** Credit line for the icon font. */
export const ICON_CREDIT = {
  label: 'wh40k-icon by Certseeds (OFL 1.1)',
  url: 'https://github.com/Certseeds/wh40k-icon',
};

/** Relays to load released rules from, set with `VITE_RELAYS` (comma separated). None means demo content only. */
export const RELAYS: string[] = (import.meta.env.VITE_RELAYS ?? '').split(',').filter(Boolean);

/** The project owner's public key (hex), set with `VITE_RULEBOOK_OWNER` (npub or hex). Must match the relay's. */
export const OWNER_KEY: string = ownerKeyHex(import.meta.env.VITE_RULEBOOK_OWNER ?? '');

/** localStorage key of how this browser signs. */
export const IDENTITY_KEY = 'rulebook:identity';

/** scrypt cost for password-protected keys (2^16: about 100 ms and 64 MB). */
export const KEY_PROTECTION_LOGN = 16;

/** Address of the list builder, set with `VITE_BUILDER_URL`. Empty hides the link. */
export const BUILDER_URL: string = import.meta.env.VITE_BUILDER_URL ?? '';
