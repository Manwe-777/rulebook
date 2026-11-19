import type { RulesFile } from '@rulebook/rules';

const files = import.meta.glob<string>('../../../../packages/rules/content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Every rules file of the demo content that ships with the repo. */
export function loadBundledFiles(): RulesFile[] {
  return Object.entries(files).map(([path, source]) => ({ path, source }));
}
