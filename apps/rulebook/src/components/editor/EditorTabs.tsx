export type EditorView = 'text' | 'preview';

const TABS: { view: EditorView; label: string }[] = [
  { view: 'text', label: 'Text' },
  { view: 'preview', label: 'Preview' },
];

/** Switches the editor between the record text and the full-width preview. */
export default function EditorTabs({ view, onChange }: { view: EditorView; onChange: (view: EditorView) => void }) {
  return (
    <div role="tablist" className="flex gap-1 border-b-2 border-bar">
      {TABS.map((t) => (
        <button
          key={t.view}
          type="button"
          role="tab"
          aria-selected={view === t.view}
          className={`rounded-t px-4 py-1 font-bold tracking-wide uppercase ${
            view === t.view ? 'bg-bar text-white' : 'text-bar hover:bg-bar/10'
          }`}
          onClick={() => onChange(t.view)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
