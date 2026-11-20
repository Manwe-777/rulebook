import { describe, expect, it } from 'vitest';

import { stratagemTurn } from './stratagemTurn';

const when = (line: string) => stratagemTurn({ text: `**When:** ${line}\n\n**Target:** One unit.` });

describe('stratagemTurn', () => {
  it('your own phases are your turn', () => {
    expect(when('Your Shooting phase.')).toBe('your');
    expect(when('Battle-shock step of your Command phase, just before you roll.')).toBe('your');
    expect(when('Your Charge phase, just after a friendly unit ends a charge move.')).toBe('your');
    expect(when('Your Movement or Charge phase, when a unit is picked to move.')).toBe('your');
  });

  it("the opponent's phases are their turn", () => {
    expect(when("End of your opponent's Movement phase.")).toBe('opponent');
    expect(when("Fight step of your opponent's Fight phase, just after an enemy unit has fought.")).toBe('opponent');
    expect(when("Start of your opponent's Shooting phase.")).toBe('opponent');
    expect(when("Start of the opponent's Reinforcements step.")).toBe('opponent');
  });

  it('any phase, a phase both players have, or a mix is either turn', () => {
    expect(when('Any phase, just after you make a hit roll.')).toBe('either');
    expect(when('Fight phase, just after a friendly CHARACTER unit is selected to fight.')).toBe('either');
    expect(when("Your opponent's Shooting phase or the Fight phase, when an enemy unit targets yours.")).toBe('either');
    expect(when('Start of any phase.')).toBe('either');
  });

  it('a turn written in the data wins over the text', () => {
    expect(stratagemTurn({ turn: 'opponent', text: '**When:** Your Shooting phase.' })).toBe('opponent');
  });
});
