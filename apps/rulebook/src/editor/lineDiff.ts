export interface DiffLine {
  type: 'same' | 'added' | 'removed';
  text: string;
}

/** Length of the longest common subsequence of a[i…] and b[j…], for every i and j. */
function commonLengths(a: string[], b: string[]): number[][] {
  const table = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  return table;
}

/** Which step the diff takes at a[i], b[j]. */
function step(a: string[], b: string[], table: number[][], i: number, j: number): DiffLine['type'] {
  if (i < a.length && j < b.length && a[i] === b[j]) return 'same';
  if (j >= b.length) return 'removed';
  if (i >= a.length) return 'added';

  return table[i][j + 1] >= table[i + 1][j] ? 'added' : 'removed';
}

/** Line by line differences between two texts (longest common subsequence), for reviewing proposals. */
export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const table = commonLengths(a, b);
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < a.length || j < b.length) {
    const type = step(a, b, table, i, j);

    out.push({ type, text: type === 'added' ? b[j] : a[i] });
    if (type !== 'added') i += 1;
    if (type !== 'removed') j += 1;
  }

  return out;
}
