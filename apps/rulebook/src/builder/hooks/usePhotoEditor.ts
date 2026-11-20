import { useState } from 'react';

import type { PhotoCrop } from '../photos/PhotoCrop';
import { photoStore } from '../photos/PhotoStore';
import { renderPhoto } from '../photos/renderPhoto';

/** Picking, cropping, saving and removing a unit's photo. `onDone` runs after a save or removal. */
export function usePhotoEditor(faction: string, unit: string, onDone: () => void) {
  const [picked, setPicked] = useState<ImageBitmap | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    setError(null);

    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong with the photo.');
    } finally {
      setBusy(false);
    }
  };

  const drop = () => {
    picked?.close();
    setPicked(null);
  };

  return {
    picked,
    busy,
    error,
    /** Opens a photo file for cropping; the browser applies the camera's orientation. */
    pick: (file: File) =>
      run(async () => {
        try {
          setPicked(await createImageBitmap(file, { imageOrientation: 'from-image' }));
        } catch {
          throw new Error('That file is not a photo this browser can open.');
        }
      }),
    save: (crop: PhotoCrop) =>
      run(async () => {
        if (!picked) return;

        await photoStore.set(faction, unit, await renderPhoto(picked, crop));
        drop();
        onDone();
      }),
    remove: () =>
      run(async () => {
        await photoStore.remove(faction, unit);
        onDone();
      }),
    cancel: drop,
  };
}
