import type { Stratagem } from '../types';

export type StratagemTurn = 'your' | 'opponent' | 'either';

const OPPONENT = /(your |the )?opponent['’]s ([\w-]+(?: or [\w-]+)? (phase|step)|turn)/gi;
const OWN = /your ([\w-]+(?: or [\w-]+)? (phase|step)|turn)/gi;
/** What is left after both: any other phase (one both players have, like the Fight phase) or "any phase". */
const SHARED = /\bphase\b|\bany\b|\beither\b/i;

/** The text of a stratagem's **When:** line, or its whole text when it has none. */
function whenLine(text: string): string {
  return /\*\*When:\*\*\s*([^\n]*)/i.exec(text)?.[1] ?? text;
}

/**
 * Whose turn a stratagem is used in, as codices colour it: the `turn` its data gives, or else read from its **When:**
 * line. Only the opponent's turn or phases is `opponent`; only your own is `your`; a mix, "any phase" or a phase
 * both players have (the Fight phase) is `either`.
 */
export function stratagemTurn(stratagem: Pick<Stratagem, 'turn' | 'text'>): StratagemTurn {
  if (stratagem.turn) return stratagem.turn;

  const when = whenLine(stratagem.text ?? '');
  const withoutOpponent = when.replace(OPPONENT, '');
  const opponent = withoutOpponent !== when;
  const rest = withoutOpponent.replace(OWN, '');
  const own = rest !== withoutOpponent;
  const shared = SHARED.test(rest);

  if (opponent && !own && !shared) return 'opponent';
  if (own && !opponent && !shared) return 'your';

  return 'either';
}
