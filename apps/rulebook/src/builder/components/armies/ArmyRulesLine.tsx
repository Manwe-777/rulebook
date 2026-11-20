import { formatAgo } from '@rulebook/rules';
import type { ReleaseInfo } from '@rulebook/sharing';

interface Props {
  /** The release the faction is on now. */
  release: ReleaseInfo;
  /** The release the army was last edited with, if known. */
  editedWith: string | undefined;
  now: number;
}

/** The rules version an army uses, and a warning when the rules changed since it was last edited. */
export default function ArmyRulesLine({ release, editedWith, now }: Props) {
  return (
    <span className="text-xs text-text/60">
      Rules {release.version}, released {formatAgo(Date.parse(release.date), now)}
      {editedWith && editedWith !== release.hash && (
        <span className="ml-2 font-semibold text-amber-300">· updated since your last edit</span>
      )}
    </span>
  );
}
