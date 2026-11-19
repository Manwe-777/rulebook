import type { Library } from '@rulebook/rules';
import { useContext } from 'react';

import { LibraryContext } from '../library/LibraryContext';

export function useLibrary(): Library {
  const library = useContext(LibraryContext);

  if (!library) throw new Error('useLibrary needs a LibraryContext provider');

  return library;
}
