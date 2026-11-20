import { splitOptions } from './splitOptions';

/** What `publish` was asked to do. */
export interface PublishRequest {
  /** Content folder: one folder per faction (and `core`), one `.md` file per record. */
  folder: string;
  /** Release version, free text (e.g. `2026-11`). */
  version: string;
  /** Password-protected key file to sign with; RULEBOOK_SECRET is used without it. */
  keyFile?: string;
  /** Release notes. */
  notes: string;
}

const USAGE = 'Usage: npm run publish -w @rulebook/relay -- <folder> <version> [--key key.ncryptsec] [--notes "…"]';

/** Reads `publish`'s arguments, or says what is missing. */
export function parsePublishArgs(argv: string[]): PublishRequest | { error: string } {
  const { options, rest, missing } = splitOptions(argv, ['--key', '--notes']);
  const [folder, version] = rest;

  if (!folder || !version || missing.length) return { error: USAGE };

  return { folder, version, keyFile: options['--key'], notes: options['--notes'] ?? '' };
}
