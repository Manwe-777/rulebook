import { ownerKeyHex } from '@rulebook/sharing/keys';

/** Name shown in the page header. */
export const SITE_NAME = 'List Builder';

/** localStorage key of the saved armies, and where saved data that can't be read at all is moved. */
export const ARMIES_KEY = 'rulebook-builder:armies';
export const ARMIES_BACKUP_KEY = 'rulebook-builder:armies-unreadable';

/** Key of the single list saved by earlier versions; moved into the saved armies on first load. */
export const LEGACY_LIST_KEY = 'rulebook-builder:list';

/** Battle size picked for a new list when the muster rules have it. */
export const DEFAULT_BATTLE_SIZE = 'strike-force';

/** Relays to load released rules from, set with `VITE_RELAYS` (comma separated). None means demo content only. */
export const RELAYS: string[] = (import.meta.env.VITE_RELAYS ?? '').split(',').filter(Boolean);

/** The project owner's public key (hex), set with `VITE_RULEBOOK_OWNER` (npub or hex). Must match the relay's. */
export const OWNER_KEY: string = ownerKeyHex(import.meta.env.VITE_RULEBOOK_OWNER ?? '');

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
