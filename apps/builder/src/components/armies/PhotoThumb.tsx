import { usePhotoUrl } from '../../hooks/usePhotoUrl';

/** A unit's photo as a small square; nothing when there is none. */
export default function PhotoThumb({ faction, unit, size }: { faction: string; unit: string; size: number }) {
  const url = usePhotoUrl(faction, unit);

  return url ? <img src={url} alt="" className="rounded object-cover" style={{ width: size, height: size }} /> : null;
}
