import { useEffect, useState } from 'react';

import { PhotoStore, photoStore } from '../photos/PhotoStore';

/** An object URL of the unit's saved photo (null when there's none); follows saves and removals anywhere in the app. */
export function usePhotoUrl(faction: string, unit: string): string | null {
  const [photo, setPhoto] = useState<{ key: string; url: string | null } | null>(null);
  const key = PhotoStore.key(faction, unit);

  useEffect(() => {
    let current: string | null = null;
    let closed = false;

    const load = () =>
      photoStore.get(faction, unit).then((blob) => {
        if (closed) return;
        if (current) URL.revokeObjectURL(current);

        current = blob ? URL.createObjectURL(blob) : null;
        setPhoto({ key, url: current });
      });

    load();

    const stop = photoStore.subscribe((changed) => changed === key && load());

    return () => {
      closed = true;
      stop();
      if (current) URL.revokeObjectURL(current);
    };
  }, [faction, unit, key]);

  return photo?.key === key ? photo.url : null;
}
