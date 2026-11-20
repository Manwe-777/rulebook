import { useState } from 'react';

import { usePhotoUrl } from '../../hooks/usePhotoUrl';
import PhotoDialog from './PhotoDialog';

interface Props {
  faction: string;
  unit: string;
  name: string;
  /** Square size in pixels. */
  size: number;
  /** Show an add-photo button when there's no photo yet (otherwise nothing). */
  placeholder?: boolean;
  /** Only show the photo: no add or change button (play mode). */
  readOnly?: boolean;
}

/** A unit's photo as a small square, or an add-photo placeholder; opens the photo dialog unless read-only. */
export default function UnitPhoto({ readOnly = false, ...props }: Props) {
  return readOnly ? <PhotoImage {...props} /> : <EditablePhoto {...props} />;
}

/** The photo alone, or nothing when there is none. */
function PhotoImage({ faction, unit, size }: Props) {
  const url = usePhotoUrl(faction, unit);

  return url ? (
    <img src={url} alt="" className="shrink-0 rounded object-cover" style={{ width: size, height: size }} />
  ) : null;
}

/** The photo or an add-photo placeholder, opening the photo dialog. */
function EditablePhoto({ faction, unit, name, size, placeholder = true }: Props) {
  const url = usePhotoUrl(faction, unit);
  const [open, setOpen] = useState(false);

  if (!url && !placeholder) return null;

  return (
    <>
      <button
        type="button"
        aria-label={url ? `Photo of ${name}` : `Add a photo of ${name}`}
        title={url ? 'Change photo' : 'Add a photo of your models'}
        className={`shrink-0 overflow-hidden rounded ${url ? '' : 'border border-dashed border-white/40 text-white/60 hover:bg-white/10'}`}
        style={{ width: size, height: size }}
        onClick={() => setOpen(true)}
      >
        {url ? (
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <span aria-hidden className="text-lg leading-none">
            +
          </span>
        )}
      </button>
      {open && <PhotoDialog faction={faction} unit={unit} name={name} onClose={() => setOpen(false)} />}
    </>
  );
}
