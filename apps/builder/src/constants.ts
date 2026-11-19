import { ownerKeyHex } from '@rulebook/sharing/keys';

/** Name shown in the page header. */
export const SITE_NAME = 'List Builder';

/** localStorage key of the list being built, and where an unreadable one is moved. */
export const STORAGE_KEY = 'rulebook-builder:list';
export const BACKUP_KEY = 'rulebook-builder:list-unreadable';

/** Battle size picked for a new list when the muster rules have it. */
export const DEFAULT_BATTLE_SIZE = 'strike-force';

/** Relays to load released rules from, set with `VITE_RELAYS` (comma separated). None means demo content only. */
export const RELAYS: string[] = (import.meta.env.VITE_RELAYS ?? '').split(',').filter(Boolean);

/** The project owner's public key (hex), set with `VITE_RULEBOOK_OWNER` (npub or hex). Must match the relay's. */
export const OWNER_KEY: string = ownerKeyHex(import.meta.env.VITE_RULEBOOK_OWNER ?? '');

/** Address of the rulebook, set with `VITE_RULEBOOK_URL`. Empty hides the link. */
export const RULEBOOK_URL: string = import.meta.env.VITE_RULEBOOK_URL ?? '';
