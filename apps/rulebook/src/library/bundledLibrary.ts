import { Library } from '@rulebook/rules';

import { loadBundledFiles } from '../sources/loadBundledFiles';

/** The library built from the demo content that ships with the repo. */
export const bundledLibrary = Library.fromFiles(loadBundledFiles());
