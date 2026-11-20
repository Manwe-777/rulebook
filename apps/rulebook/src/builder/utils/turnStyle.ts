import type { StratagemTurn } from '@rulebook/rules';

/** How a stratagem's turn is shown: its words and its colour classes. */
const TURN_STYLES: Record<StratagemTurn, { label: string; bar: string; border: string }> = {
  your: { label: 'Your turn', bar: 'bg-turn-your', border: 'border-turn-your' },
  opponent: { label: "Opponent's turn", bar: 'bg-turn-opponent', border: 'border-turn-opponent' },
  either: { label: "Either player's turn", bar: 'bg-turn-either', border: 'border-turn-either' },
};

/** The words and colour classes for a stratagem's turn. */
export function turnStyle(turn: StratagemTurn) {
  return TURN_STYLES[turn];
}
