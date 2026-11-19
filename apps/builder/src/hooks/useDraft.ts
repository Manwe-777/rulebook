import type { Library } from '@rulebook/rules';
import { useEffect, useState } from 'react';

import { ArmyDraft } from '../army/ArmyDraft';
import { loadSavedDraft } from '../utils/loadSavedDraft';
import { saveDraft } from '../utils/saveDraft';

/** The list being built, restored from this browser and saved after every change. */
export function useDraft(library: Library): [ArmyDraft, (draft: ArmyDraft) => void] {
  const [draft, setDraft] = useState(
    () => loadSavedDraft() ?? ArmyDraft.create(library, library.factions[0]?.id ?? ''),
  );

  useEffect(() => saveDraft(draft), [draft]);

  return [draft, setDraft];
}
