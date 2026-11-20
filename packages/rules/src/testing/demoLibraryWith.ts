import { Library } from '../library/Library';
import { loadDemoFiles } from './loadDemoFiles';

/** The demo library with some files' Markdown changed first, keyed by the end of their path (`demo-host/x.md`). */
export function demoLibraryWith(edits: Record<string, (source: string) => string>): Library {
  return Library.fromFiles(
    loadDemoFiles().map((file) => {
      const edit = Object.entries(edits).find(([path]) => file.path.endsWith(path))?.[1];

      return edit ? { ...file, source: edit(file.source) } : file;
    }),
  );
}
