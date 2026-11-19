import type { Issue } from '../types';

/** An error raised by a core check. */
export function issue(code: string, message: string, entries: string[] = [], source = 'core'): Issue {
  return { code, severity: 'error', message, entries, source };
}
