/**
 * Maps every item with an async function, running at most `size` at a time, and keeps the results in input order.
 * Relays drop or time out reads when too many are asked for at once.
 */
export async function mapInBatches<T, R>(items: T[], size: number, map: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += size) results.push(...(await Promise.all(items.slice(i, i + size).map(map))));

  return results;
}
