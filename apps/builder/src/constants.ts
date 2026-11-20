import { projectSettings } from '@rulebook/sharing/project';
import { loadKnownRelays } from '@rulebook/sharing/relays';

/** Name shown in the page header. */
export const SITE_NAME = 'List Builder';

/** localStorage key of the saved armies, and where saved data that can't be read at all is moved. */
export const ARMIES_KEY = 'rulebook-builder:armies';
export const ARMIES_BACKUP_KEY = 'rulebook-builder:armies-unreadable';

/** Key of the single list saved by earlier versions; moved into the saved armies on first load. */
export const LEGACY_LIST_KEY = 'rulebook-builder:list';

/** Battle size picked for a new list when the muster rules have it. */
export const DEFAULT_BATTLE_SIZE = 'strike-force';

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

/** Address of the rulebook, set with `VITE_RULEBOOK_URL`. Empty hides the link. */
export const RULEBOOK_URL: string = import.meta.env.VITE_RULEBOOK_URL ?? '';

/** IndexedDB database of players' photos of their own models (never uploaded anywhere). */
export const PHOTO_DB = 'rulebook-photos';

/** Saved photos are squares this many pixels wide. */
export const PHOTO_SIZE = 320;

/** WebP quality of saved photos (0–1). */
export const PHOTO_QUALITY = 0.85;

/** Zoom range of the photo crop: 1 just covers the square. */
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

/** Contrast that white text on a faction's colour must reach (WCAG AA for normal text). */
export const MIN_TEXT_CONTRAST = 4.5;

/** Credit line for the faction icon font. */
export const ICON_CREDIT = {
  label: 'wh40k-icon by Certseeds (OFL 1.1)',
  url: 'https://github.com/Certseeds/wh40k-icon',
};

/** Address parameters: the open army and the unit open in the play view. */
export const ARMY_PARAM = 'army';
export const UNIT_PARAM = 'unit';

/** Address parameter for the army page's mode; `?mode=play` hides every control that changes the list. */
export const MODE_PARAM = 'mode';
export const PLAY_MODE = 'play';

/** Query parameter that shows the stratagems in play mode (`?stratagems=1`). */
export const STRATAGEMS_PARAM = 'stratagems';

/** Query parameter that also shows the core stratagems among them (`?core=1`); hidden by default. */
export const CORE_STRATAGEMS_PARAM = 'core';

/** localStorage key that is `'1'` while this device syncs its lists through the relays. */
export const SYNC_KEY = 'rulebook:sync';

/** How often a syncing device checks the relays for changes from other devices, in milliseconds. */
export const SYNC_INTERVAL_MS = 60_000;

/** How long after a change on this device it is sent, in milliseconds, so typing doesn't send every keystroke. */
export const SYNC_DEBOUNCE_MS = 2_000;

/** Characters of the code that unlocks a device link: no 0/O, 1/I/L, so it is easy to read out and type. */
export const LINK_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const LINK_CODE_LENGTH = 6;

/** Address hash that carries a device link: `#link=<ncryptsec>`. */
export const LINK_HASH = 'link';

/** scrypt cost (log2 N) of the key in a device link: strong enough for a short code, fast enough on a phone. */
export const LINK_KEY_LOGN = 16;

/** How long the "unit added" message stays up, in milliseconds. */
export const ADDED_TOAST_MS = 2_500;

/** How long an add button shows its tick after a press, in milliseconds. */
export const ADDED_TICK_MS = 600;

/** localStorage key of the unit cards folded down to their title, by army id. */
export const COLLAPSED_KEY = 'rulebook-builder:collapsed';

/** Where the community's datasheets, stratagems and codex rules are sourced from. */
export const DATA_SOURCE = { label: '40k.app', url: 'https://40k.app' };
