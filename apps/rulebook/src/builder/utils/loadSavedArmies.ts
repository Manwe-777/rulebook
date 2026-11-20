import { ArmyDraft } from '../army/ArmyDraft';
import { SavedArmies } from '../army/SavedArmies';
import { ARMIES_BACKUP_KEY, ARMIES_KEY, LEGACY_LIST_KEY } from '../constants';
import { newArmyId } from './newArmyId';

function parse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** The single list saved by earlier versions, as the first saved army (the old key is removed once moved). */
function migrateLegacy(): SavedArmies {
  const text = localStorage.getItem(LEGACY_LIST_KEY);
  const draft = text === null ? null : ArmyDraft.fromSave(parse(text));

  if (!draft) return SavedArmies.empty();

  const saved = SavedArmies.empty().put(newArmyId(), draft, Date.now());

  localStorage.setItem(ARMIES_KEY, JSON.stringify(saved));
  localStorage.removeItem(LEGACY_LIST_KEY);

  return saved;
}

/**
 * The armies saved in this browser. Data that can't be read at all is moved to a backup key so it isn't lost, and
 * storage that can't be used (private mode, blocked) gives no armies.
 */
export function loadSavedArmies(): SavedArmies {
  try {
    const text = localStorage.getItem(ARMIES_KEY);

    if (text === null) return migrateLegacy();

    const saved = SavedArmies.fromSave(parse(text));

    if (saved) return saved;

    localStorage.setItem(ARMIES_BACKUP_KEY, text);
    localStorage.removeItem(ARMIES_KEY);

    return SavedArmies.empty();
  } catch {
    return SavedArmies.empty();
  }
}
