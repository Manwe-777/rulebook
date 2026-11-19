/** How keywords are compared: ignoring case, accents and extra spaces, so `KÂHL` matches `kahl`. */
export function keywordKey(keyword: string): string {
  return keyword.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
}
