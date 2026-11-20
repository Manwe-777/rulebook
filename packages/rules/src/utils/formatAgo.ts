const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now", "5 min ago", "3 h ago", "2 days ago", then the date. */
export function formatAgo(then: number, now: number): string {
  const gone = Math.max(0, now - then);

  if (gone < MINUTE) return 'just now';
  if (gone < HOUR) return `${Math.floor(gone / MINUTE)} min ago`;
  if (gone < DAY) return `${Math.floor(gone / HOUR)} h ago`;
  if (gone < 7 * DAY) return `${Math.floor(gone / DAY)} day${gone < 2 * DAY ? '' : 's'} ago`;

  return new Date(then).toLocaleDateString();
}
