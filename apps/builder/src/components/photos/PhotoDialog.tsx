import { useEffect, useRef } from 'react';

import { usePhotoEditor } from '../../hooks/usePhotoEditor';
import { usePhotoUrl } from '../../hooks/usePhotoUrl';
import { BUTTON, BUTTON_QUIET, PANEL_TITLE } from '../styles';
import CropEditor from './CropEditor';

interface Props {
  faction: string;
  unit: string;
  name: string;
  onClose: () => void;
}

/** Shows a unit's photo of the player's own models, and lets them add, replace (with a crop step) or remove it. */
export default function PhotoDialog({ faction, unit, name, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const url = usePhotoUrl(faction, unit);
  const editor = usePhotoEditor(faction, unit, onClose);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-label={`Photo of ${name}`}
      className="m-auto w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg bg-panel p-0 text-text shadow-2xl backdrop:bg-black/70"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      <h2 className={PANEL_TITLE}>{name}</h2>
      <div className="flex flex-col gap-3 p-3">
        {editor.picked ? (
          <CropEditor photo={editor.picked} busy={editor.busy} onSave={editor.save} onCancel={editor.cancel} />
        ) : (
          <>
            {url ? (
              <img src={url} alt={`Your ${name}`} className="aspect-square w-full rounded-lg object-cover" />
            ) : (
              <p className="text-sm text-text/70">Add a photo of your own models to spot this unit at a glance.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <label className={`${BUTTON} cursor-pointer`}>
                {url ? 'Replace photo' : 'Choose photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && editor.pick(e.target.files[0])}
                />
              </label>
              {url && (
                <button type="button" className={BUTTON_QUIET} disabled={editor.busy} onClick={editor.remove}>
                  Remove
                </button>
              )}
              <button type="button" className={`${BUTTON_QUIET} ml-auto`} onClick={() => dialog.current?.close()}>
                Close
              </button>
            </div>
          </>
        )}
        {editor.error && <p className="text-sm text-red-300">{editor.error}</p>}
        <p className="text-xs text-text/60">Photos stay on this device; they are never uploaded.</p>
      </div>
    </dialog>
  );
}
