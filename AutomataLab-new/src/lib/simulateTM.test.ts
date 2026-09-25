import { describe, it, expect } from 'vitest';
import { simulateTM } from './simulateTM';
import { BLANK } from '../types/tm';
import type { TM } from '../types/tm';

// Binary increment: scan right to the end of the number, then carry
// leftwards (1 -> 0 with carry, 0 -> 1 stop, or blank -> 1 stop for
// an all-ones input like "111" -> "1000").
const binaryIncrement: TM = {
  id: 1,
  name: 'binary-increment',
  description: '',
  states: ['scan', 'carry', 'accept'],
  tapeAlphabet: ['0', '1', BLANK],
  blankSymbol: BLANK,
  startState: 'scan',
  acceptStates: ['accept'],
  rejectStates: [],
  transitions: {
    scan: {
      '0': { write: '0', move: 'R', newState: 'scan' },
      '1': { write: '1', move: 'R', newState: 'scan' },
      [BLANK]: { write: BLANK, move: 'L', newState: 'carry' },
    },
    carry: {
      '1': { write: '0', move: 'L', newState: 'carry' },
      '0': { write: '1', move: 'R', newState: 'accept' },
      [BLANK]: { write: '1', move: 'R', newState: 'accept' },
    },
  },
};

function tapeString(tape: string[]): string {
  return tape.join('').replace(new RegExp(`${BLANK}+$`), '').replace(new RegExp(`^${BLANK}+`), '');
}

describe('simulateTM — binary increment', () => {
  it('halts and accepts, producing input + 1 (101 -> 110)', () => {
    const { accepted, halted, steps } = simulateTM(binaryIncrement, '101');
    expect(halted).toBe(true);
    expect(accepted).toBe(true);
    expect(tapeString(steps[steps.length - 1].tape)).toBe('110');
  });

  it('handles the all-ones carry case (111 -> 1000)', () => {
    const { accepted, steps } = simulateTM(binaryIncrement, '111');
    expect(accepted).toBe(true);
    expect(tapeString(steps[steps.length - 1].tape)).toBe('1000');
  });

  it('hits the step limit without halting on a non-terminating machine', () => {
    const loopingTM: TM = {
      id: 2,
      name: 'infinite-right-scan',
      description: '',
      states: ['q0'],
      tapeAlphabet: [BLANK],
      blankSymbol: BLANK,
      startState: 'q0',
      acceptStates: [],
      rejectStates: [],
      transitions: {
        q0: { [BLANK]: { write: BLANK, move: 'R', newState: 'q0' } },
      },
    };
    const { accepted, halted, steps } = simulateTM(loopingTM, '');
    expect(halted).toBe(false);
    expect(accepted).toBe(false);
    expect(steps.length).toBe(501); // initial snapshot + 500 steps, MAX_STEPS reached
  });
});
