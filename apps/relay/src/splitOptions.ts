/**
 * Splits command-line arguments into `--flag value` options (for the given flags) and the rest, in order. A flag
 * given without a value is reported in `missing`.
 */
export function splitOptions(
  argv: string[],
  flags: string[],
): { options: Record<string, string>; rest: string[]; missing: string[] } {
  const options: Record<string, string> = {};
  const rest: string[] = [];
  const missing: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    if (!flags.includes(argv[i])) rest.push(argv[i]);
    else if (i + 1 < argv.length) options[argv[i]] = argv[++i];
    else missing.push(argv[i]);
  }

  return { options, rest, missing };
}
