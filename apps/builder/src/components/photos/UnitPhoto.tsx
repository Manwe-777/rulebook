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
}

/** A unit's photo as a small square, or an add-photo placeholder; opens the photo dialog. */
export default function UnitPhoto({ faction, unit, name, size, placeholder = true }: Props) {
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
