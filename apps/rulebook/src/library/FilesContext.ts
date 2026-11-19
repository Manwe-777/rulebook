import type { RulesFile } from '@rulebook/rules';
import { createContext } from 'react';

/** The rules files the library was built from, for the editor to start from their text. */
export const FilesContext = createContext<RulesFile[]>([]);
