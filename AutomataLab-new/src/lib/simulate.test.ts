import { describe, it, expect } from 'vitest';
import { simulateDFA } from './simulate';
import type { DFA } from '../types/automaton';

// Language: contains at least one 'a'
const containsA: DFA = {
  id: 1,
  name: 'contains-a',
  description: 'accepts strings containing at least one a',
  states: ['q0', 'q1'],
  alphabet: ['a', 'b'],
  transitions: {
    q0: { a: 'q1', b: 'q0' },
    q1: { a: 'q1', b: 'q1' },
  },
  startState: 'q0',
  acceptStates: ['q1'],
};

describe('simulateDFA', () => {
  it.each([
    ['a', true],
    ['ba', true],
    ['', false],
    ['b', false],
    ['bb', false],
  ] as const)('input %j -> accepted=%s', (input, expected) => {
    expect(simulateDFA(containsA, input).accepted).toBe(expected);
  });

  it('rejects and stops on a symbol with no defined transition', () => {
    const { path, accepted } = simulateDFA(containsA, 'ac');
    expect(accepted).toBe(false);
    // 'a' is consumed (q0 -> q1), then 'c' has no transition from q1
    expect(path).toEqual(['q0', 'q1']);
  });
});
