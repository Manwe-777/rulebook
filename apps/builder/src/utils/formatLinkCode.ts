/** A link code split in two halves to read out: `K7QMRB` → `K7Q-MRB`. */
export function formatLinkCode(code: string): string {
  const half = Math.ceil(code.length / 2);

  return `${code.slice(0, half)}-${code.slice(half)}`;
}
