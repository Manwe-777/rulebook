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
  /** Only these faction folders; every folder when empty. */
  only: string[];
}

const USAGE =
  'Usage: npm run publish -w @rulebook/relay -- <folder> <version> [--key key.ncryptsec] [--notes "…"] [--only a,b]';

/** Reads `publish`'s arguments, or says what is missing. */
export function parsePublishArgs(argv: string[]): PublishRequest | { error: string } {
  const { options, rest, missing } = splitOptions(argv, ['--key', '--notes', '--only']);
  const [folder, version] = rest;

  if (!folder || !version || missing.length) return { error: USAGE };

  const only = (options['--only'] ?? '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  return { folder, version, keyFile: options['--key'], notes: options['--notes'] ?? '', only };
}
