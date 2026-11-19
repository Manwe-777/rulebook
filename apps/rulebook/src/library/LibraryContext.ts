import type { Library } from '@rulebook/rules';
import { createContext } from 'react';

/** The library every page reads from. Provided once at the top of the app. */
export const LibraryContext = createContext<Library | null>(null);
