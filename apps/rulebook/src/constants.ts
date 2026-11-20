import { projectSettings } from '@rulebook/sharing/project';
import { loadKnownRelays } from '@rulebook/sharing/relays';

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

/**
 * The project owner's public key (hex) and the relays to load released rules from: `project.json` at the repository
 * root, unless the build sets `VITE_RULEBOOK_OWNER` (npub or hex) or `VITE_RELAYS` (comma separated). No relays means
 * demo content only.
 */
const PROJECT = projectSettings({ owner: import.meta.env.VITE_RULEBOOK_OWNER, relays: import.meta.env.VITE_RELAYS });

/** The project's relays (project.json or the build's), always used. */
export const FIXED_RELAYS: string[] = PROJECT.relays;

/** The project's relays plus the ones this browser found announced and that still answer. */
export const RELAYS: string[] = [...new Set([...PROJECT.relays, ...loadKnownRelays().urls])];

/** Must match the relays' owner key. */
export const OWNER_KEY: string = PROJECT.owner;

/** scrypt cost for password-protected keys (2^16: about 100 ms and 64 MB). */
export const KEY_PROTECTION_LOGN = 16;

/** Address of the list builder, set with `VITE_BUILDER_URL`. Empty hides the link. */
export const BUILDER_URL: string = import.meta.env.VITE_BUILDER_URL ?? '';

/** localStorage key of the print page's include options (a per-browser convenience). */
export const PRINT_OPTIONS_KEY = 'rulebook:print-options';

/**
 * How long to wait for a Nostr browser extension to share its public key, in milliseconds. Past that the app reads the
 * relays without signing, so a missing or stuck extension never blocks reading.
 */
export const EXTENSION_TIMEOUT_MS = 15_000;

/** Where the community's datasheets, stratagems and codex rules are sourced from. */
export const DATA_SOURCE = { label: '40k.app', url: 'https://40k.app' };
