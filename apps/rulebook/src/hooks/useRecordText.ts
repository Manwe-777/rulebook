import { useContext } from 'react';

import { recordSource } from '../editor/recordSource';
import { recordTemplate } from '../editor/recordTemplate';
import type { EditableKind } from '../editor/types';
import { useAccount } from '../identity/useAccount';
import { FilesContext } from '../library/FilesContext';
import { useAsync } from './useAsync';
import { useLibrary } from './useLibrary';

/**
 * The text to start editing from: the accepted version on the relays, else the loaded file, else a template for a new
 * unit or detachment named `name`.
 */
export function useRecordText(faction: string, kind: EditableKind, id: string, name: string) {
  const { client } = useAccount();
  const files = useContext(FilesContext);
  const keyword = useLibrary().faction(faction)?.factionKeyword ?? '';

  return useAsync(async () => {
    const head = client ? await client.head(faction, kind, id) : null;
    const remote = head && client ? await client.getBlob(head) : null;
    const local = recordSource(files, faction, kind, id);
    const fresh = kind === 'unit' || kind === 'detachment' ? recordTemplate(kind, name || id, keyword) : '';

    return { text: remote ?? local ?? fresh, isNew: !remote && !local };
  }, [client, faction, kind, id]);
}
