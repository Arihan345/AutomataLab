import { describe, it, expect } from 'vitest';
import { simulatePDA } from './simulatePDA';
import { EPSILON_PDA } from '../types/pda';
import type { PDA } from '../types/pda';

// Balanced-parentheses PDA, final-state acceptance.
// q0 pushes 'X' for '(' and pops it for ')'; it only moves to the accept
// state qf via an epsilon-move once the stack has unwound back to 'Z',
// so an unbalanced/incomplete input never reaches qf.
const balancedParens: PDA = {
  id: 1,
  name: 'balanced-parens',
  description: '',
  states: ['q0', 'qf'],
  inputAlphabet: ['(', ')'],
  stackAlphabet: ['Z', 'X'],
  startState: 'q0',
  startStackSymbol: 'Z',
  acceptStates: ['qf'],
  transitions: {
    q0: {
      '(': {
        Z: [{ newState: 'q0', push: ['X', 'Z'] }],
        X: [{ newState: 'q0', push: ['X', 'X'] }],
      },
      ')': {
        X: [{ newState: 'q0', push: [] }],
      },
      [EPSILON_PDA]: {
        Z: [{ newState: 'qf', push: ['Z'] }],
      },
    },
  },
};

describe('simulatePDA', () => {
  it('accepts "()"', () => {
    expect(simulatePDA(balancedParens, '()').accepted).toBe(true);
  });

  it('rejects ")(" (closes before anything is open)', () => {
    expect(simulatePDA(balancedParens, ')(').accepted).toBe(false);
  });

  it('rejects "((" (incomplete — stack never unwinds to Z)', () => {
    const { accepted, steps } = simulatePDA(balancedParens, '((');
    expect(accepted).toBe(false);
    // gets stuck: q0 with 'X' on top and no more input, no valid move
    expect(steps[steps.length - 1].stack).toEqual(['Z', 'X', 'X']);
  });
});

// This PDA nondeterministically guesses (via epsilon) between two mutually
// exclusive modes at the very first step: mode A only accepts "a", mode B
// only accepts "ab". Both alternatives sit in the SAME transitions list
// (q0's epsilon options on stack-top 'Z'), with mode A listed first.
//
// A greedy "always take option [0]" simulator commits to mode A, gets stuck
// after consuming "a" (mode A has no transition for the trailing 'b'), and
// incorrectly rejects "ab" — even though "ab" is accepted via mode B. This
// is exactly the class of bug backtracking fixes: it must retry option [1]
// after option [0] dead-ends.
const nondeterministicModes: PDA = {
  id: 2,
  name: 'nondeterministic-mode-guess',
  description: '',
  states: ['q0', 'qa', 'qb', 'qaAccept', 'qbMid', 'qbAccept'],
  inputAlphabet: ['a', 'b'],
  stackAlphabet: ['Z'],
  startState: 'q0',
  startStackSymbol: 'Z',
  acceptStates: ['qaAccept', 'qbAccept'],
  transitions: {
    q0: {
      [EPSILON_PDA]: {
        // mode A (listed first) and mode B (listed second) — a greedy
        // simulator would only ever try mode A.
        Z: [
          { newState: 'qa', push: ['Z'] },
          { newState: 'qb', push: ['Z'] },
        ],
      },
    },
    qa: { a: { Z: [{ newState: 'qaAccept', push: ['Z'] }] } },
    qb: { a: { Z: [{ newState: 'qbMid', push: ['Z'] }] } },
    qbMid: { b: { Z: [{ newState: 'qbAccept', push: ['Z'] }] } },
  },
};

describe('simulatePDA — nondeterministic backtracking', () => {
  it('accepts "a" via mode A', () => {
    expect(simulatePDA(nondeterministicModes, 'a').accepted).toBe(true);
  });

  it('accepts "ab" by backtracking out of mode A and into mode B', () => {
    expect(simulatePDA(nondeterministicModes, 'ab').accepted).toBe(true);
  });

  it('rejects a string neither mode accepts', () => {
    expect(simulatePDA(nondeterministicModes, 'abb').accepted).toBe(false);
  });
});
