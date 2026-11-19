import { useContext, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { checkChange } from '../../editor/checkChange';
import type { EditableKind } from '../../editor/types';
import { useRecordText } from '../../hooks/useRecordText';
import { useRole } from '../../hooks/useRole';
import { FilesContext } from '../../library/FilesContext';
import { INPUT } from '../common/styles';
import SectionPanel from '../datasheet/SectionPanel';
import EditorTabs, { type EditorView } from './EditorTabs';
import ProblemList from './ProblemList';
import RecordPreview from './RecordPreview';
import SubmitBar from './SubmitBar';

interface Props {
  faction: string;
  kind: EditableKind;
  id: string;
  initial: string;
}

/** The editing area once the starting text is known: text or full-width preview, then the checks and the send bar. */
function EditorBody({ faction, kind, id, initial }: Props) {
  const files = useContext(FilesContext);
  const { role } = useRole(faction);
  const [text, setText] = useState(initial);
  const [view, setView] = useState<EditorView>('text');
  const check = useMemo(() => checkChange(files, faction, kind, id, text), [files, faction, kind, id, text]);

  return (
    <div className="flex flex-col gap-3">
      <EditorTabs view={view} onChange={setView} />
      {view === 'text' ? (
        <textarea
          aria-label="Record text"
          spellCheck={false}
          className={`${INPUT} min-h-[32rem] font-mono text-sm`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      ) : (
        <RecordPreview library={check.library} faction={faction} kind={kind} id={check.id} />
      )}
      <SectionPanel title="Checks">
        <ProblemList errors={check.errors} issues={check.issues} />
      </SectionPanel>
      <SubmitBar
        role={role}
        faction={faction}
        kind={kind}
        id={check.id}
        text={text}
        blocked={check.errors.length > 0}
      />
    </div>
  );
}

const KINDS: EditableKind[] = ['faction', 'unit', 'detachment'];

/** Edits one record's Markdown with live checks and a preview. */
export default function RecordEditor() {
  const { faction = '', kind = '', id = '' } = useParams();
  const [search] = useSearchParams();
  const editable = KINDS.includes(kind as EditableKind) ? (kind as EditableKind) : 'unit';
  const { data } = useRecordText(faction, editable, id, search.get('name') ?? '');

  return (
    <article className="sheet-paper flex flex-col gap-3 rounded-xl p-4 font-sans text-ink shadow-2xl">
      <h2 className="text-2xl font-extrabold uppercase">
        {data?.isNew ? 'New' : 'Edit'} {editable} {id}
      </h2>
      <p className="text-sm text-ink-muted">
        Write rules in your own words; never paste text from codices or other sites. The format is described in the
        project's docs (data-model.md).
      </p>
      {data ? (
        <EditorBody key={`${faction}/${kind}/${id}`} faction={faction} kind={editable} id={id} initial={data.text} />
      ) : (
        <p>Loading…</p>
      )}
    </article>
  );
}
