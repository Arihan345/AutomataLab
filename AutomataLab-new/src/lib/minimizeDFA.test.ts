import { describe, it, expect } from 'vitest';
import { minimizeDFA } from './minimizeDFA';
import { simulateDFA } from './simulate';
import type { DFA } from '../types/automaton';

// Deliberately non-minimal: q1 and q2 are provably equivalent (identical
// transition signatures and both accepting) but were never merged.
const nonMinimal: DFA = {
  id: 1,
  name: 'redundant-contains-a',
  description: '',
  states: ['q0', 'q1', 'q2'],
  alphabet: ['a', 'b'],
  transitions: {
    q0: { a: 'q1', b: 'q0' },
    q1: { a: 'q1', b: 'q2' },
    q2: { a: 'q1', b: 'q2' },
  },
  startState: 'q0',
  acceptStates: ['q1', 'q2'],
};

describe('minimizeDFA', () => {
  const { dfa: minimized, history } = minimizeDFA(nonMinimal, 2, 'minimized', '');

  it('merges provably equivalent states, reducing the state count', () => {
    expect(minimized.states.length).toBeLessThan(nonMinimal.states.length);
    expect(minimized.states).toHaveLength(2);
  });

  it.each(['', 'a', 'b', 'ab', 'ba', 'aab', 'bba', 'abba'])(
    'agrees with the original DFA on %j',
    (input) => {
      expect(simulateDFA(minimized, input).accepted).toBe(simulateDFA(nonMinimal, input).accepted);
    }
  );

  it('records round 0 as the initial accept/non-accept split', () => {
    expect(history[0].partitions).toHaveLength(2);
    const groups = history[0].partitions.map((g) => new Set(g));
    expect(groups).toContainEqual(new Set(['q1', 'q2']));
    expect(groups).toContainEqual(new Set(['q0']));
  });

  it('records a final round whose partition count matches the minimized state count', () => {
    const finalRound = history[history.length - 1];
    expect(finalRound.partitions).toHaveLength(minimized.states.length);
  });

  it('never merges q1 and q2 into different rounds — they stay together from round 0 (already provably equivalent)', () => {
    for (const round of history) {
      const groupWithQ1 = round.partitions.find((g) => g.includes('q1'))!;
      expect(groupWithQ1).toContain('q2');
    }
  });
});
