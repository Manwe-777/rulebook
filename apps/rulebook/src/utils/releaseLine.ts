import { formatAgo } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';

/** What a faction card says about its rules data: version, how long ago it was released and how many records. */
export function releaseLine(release: ReleaseInfo | undefined, now: number): string {
  if (!release) return 'Built-in demo';

  const records = `${release.records} record${release.records === 1 ? '' : 's'}`;

  return `${release.version} · released ${formatAgo(Date.parse(release.date), now)} · ${records}`;
}
