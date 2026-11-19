import { describe, expect, it } from 'vitest';

import { splitEntries } from './splitEntries';
import { splitFrontmatter } from './splitFrontmatter';
import { splitSections } from './splitSections';

const UNIT = { abilities: 'abilities', 'wargear options': 'wargearOptions' } as const;

describe('splitFrontmatter', () => {
  it('separates the YAML block from the Markdown after it', () => {
    expect(splitFrontmatter('---\nname: Boyz\n---\n## Abilities\nText')).toEqual({
      yaml: 'name: Boyz',
      body: '## Abilities\nText',
    });
  });

  it('accepts Windows line endings and a leading byte order mark', () => {
    expect(splitFrontmatter('\uFEFF---\r\nname: Boyz\r\n---\r\nBody')).toEqual({ yaml: 'name: Boyz', body: 'Body' });
  });

  it('accepts a file that ends right after the closing fence', () => {
    expect(splitFrontmatter('---\nname: Boyz\n---')).toEqual({ yaml: 'name: Boyz', body: '' });
  });

  it('reports no YAML when the file does not start with a fence', () => {
    expect(splitFrontmatter('# Boyz\n---\nname: x\n---').yaml).toBeNull();
  });

  it('does not treat a horizontal rule later in the body as a closing fence', () => {
    expect(splitFrontmatter('---\na: 1\n---\nText\n\n---\n\nMore').body).toBe('Text\n\n---\n\nMore');
  });
});

describe('splitSections', () => {
  it('keeps each known section as trimmed Markdown, whatever the heading case', () => {
    const { sections, errors } = splitSections('## Abilities\n\n**A:** b\n\n## WARGEAR OPTIONS\n- x\n', UNIT);

    expect(errors).toEqual([]);
    expect(sections).toEqual({ abilities: '**A:** b', wargearOptions: '- x' });
  });

  it('an empty body has no sections and no errors', () => {
    expect(splitSections('\n\n', UNIT)).toEqual({ sections: {}, errors: [] });
  });

  it('flags a misspelled heading instead of dropping its text', () => {
    expect(splitSections('## Abilites\ntext', UNIT).errors).toEqual(['unknown section "## Abilites"']);
  });

  it('flags a section written twice', () => {
    expect(splitSections('## Abilities\na\n## Abilities\nb', UNIT).errors).toEqual([
      'section "## Abilities" appears more than once',
    ]);
  });

  it('flags text that sits before any heading', () => {
    expect(splitSections('Stray text\n## Abilities\na', UNIT).errors).toHaveLength(1);
  });

  it('smaller headings stay inside their section', () => {
    expect(splitSections('## Abilities\n### Aura\ntext', UNIT).sections.abilities).toBe('### Aura\ntext');
  });
});

describe('splitEntries', () => {
  it('splits a section into its ### entries, keeping text before the first one as the intro', () => {
    expect(splitEntries('Intro\n### Brace!\nText one\n\n### Fall Back\nText two\n')).toEqual({
      intro: 'Intro',
      entries: [
        { heading: 'Brace!', text: 'Text one' },
        { heading: 'Fall Back', text: 'Text two' },
      ],
    });
  });

  it('a section without entries has only an intro', () => {
    expect(splitEntries('Just text')).toEqual({ intro: 'Just text', entries: [] });
  });
});
