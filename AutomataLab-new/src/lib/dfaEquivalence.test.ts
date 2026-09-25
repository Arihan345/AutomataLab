import { describe, it, expect } from 'vitest';
import { checkEquivalence } from './dfaEquivalence';
import { simulateDFA } from './simulate';
import type { DFA } from '../types/automaton';

// Minimal 2-state "contains at least one a"
const containsA: DFA = {
  id: 1,
  name: 'contains-a-min',
  description: '',
  states: ['q0', 'q1'],
  alphabet: ['a', 'b'],
  transitions: {
    q0: { a: 'q1', b: 'q0' },
    q1: { a: 'q1', b: 'q1' },
  },
  startState: 'q0',
  acceptStates: ['q1'],
};

// Same language, but with a redundant extra state (q1/q2 are equivalent)
const containsARedundant: DFA = {
  id: 2,
  name: 'contains-a-redundant',
  description: '',
  states: ['p0', 'p1', 'p2'],
  alphabet: ['a', 'b'],
  transitions: {
    p0: { a: 'p1', b: 'p0' },
    p1: { a: 'p1', b: 'p2' },
    p2: { a: 'p1', b: 'p2' },
  },
  startState: 'p0',
  acceptStates: ['p1', 'p2'],
};

// Contains at least one 'a' AND ends with 'b' — a strictly smaller language
const containsAEndsB: DFA = {
  id: 3,
  name: 'contains-a-ends-b',
  description: '',
  states: ['r0', 'r1', 'r2'],
  alphabet: ['a', 'b'],
  transitions: {
    r0: { a: 'r1', b: 'r0' },
    r1: { a: 'r1', b: 'r2' },
    r2: { a: 'r1', b: 'r2' },
  },
  startState: 'r0',
  acceptStates: ['r2'],
};

describe('checkEquivalence', () => {
  it('reports equivalent for two DFAs with different state counts but the same language', () => {
    const result = checkEquivalence(containsA, containsARedundant);
    expect(result.equivalent).toBe(true);
    expect(result.counterexample).toBeUndefined();
  });

  it('reports not equivalent with the expected counterexample when languages differ', () => {
    const result = checkEquivalence(containsA, containsAEndsB);
    expect(result.equivalent).toBe(false);
    // "a" is accepted by containsA but rejected by containsAEndsB (doesn't end in b)
    expect(result.counterexample).toBe('a');
    expect(result.acceptedBy).toBe('A');
    expect(simulateDFA(containsA, result.counterexample!).accepted).toBe(true);
    expect(simulateDFA(containsAEndsB, result.counterexample!).accepted).toBe(false);
  });

  it('reports equivalent for two DFAs that both accept the empty language', () => {
    const emptyA: DFA = {
      id: 4, name: 'empty-a', description: '',
      states: ['x0'], alphabet: ['a'],
      transitions: { x0: { a: 'x0' } },
      startState: 'x0', acceptStates: [],
    };
    const emptyB: DFA = {
      id: 5, name: 'empty-b', description: '',
      states: ['y0', 'y1'], alphabet: ['a', 'b'],
      transitions: { y0: { a: 'y1', b: 'y0' }, y1: { a: 'y0', b: 'y1' } },
      startState: 'y0', acceptStates: [],
    };
    const result = checkEquivalence(emptyA, emptyB);
    expect(result.equivalent).toBe(true);
  });

  it('handles DFAs with different alphabets, correctly treating missing transitions as an implicit dead state', () => {
    // dfaA: even number of a's, over {a} only
    const evenAs: DFA = {
      id: 6, name: 'even-as', description: '',
      states: ['s0', 's1'], alphabet: ['a'],
      transitions: { s0: { a: 's1' }, s1: { a: 's0' } },
      startState: 's0', acceptStates: ['s0'],
    };
    // dfaB: same language, but explicitly defines a dead state for 'b'
    const evenAsWithDeadB: DFA = {
      id: 7, name: 'even-as-with-b', description: '',
      states: ['t0', 't1', 'dead'], alphabet: ['a', 'b'],
      transitions: {
        t0: { a: 't1', b: 'dead' },
        t1: { a: 't0', b: 'dead' },
        dead: { a: 'dead', b: 'dead' },
      },
      startState: 't0', acceptStates: ['t0'],
    };
    expect(checkEquivalence(evenAs, evenAsWithDeadB).equivalent).toBe(true);

    // But if dfaB actually accepts on 'b' from the start, they diverge
    const acceptsB: DFA = {
      id: 8, name: 'accepts-b', description: '',
      states: ['t0', 't1'], alphabet: ['a', 'b'],
      transitions: { t0: { a: 't1', b: 't0' }, t1: { a: 't0', b: 't1' } },
      startState: 't0', acceptStates: ['t0'],
    };
    const result = checkEquivalence(evenAs, acceptsB);
    expect(result.equivalent).toBe(false);
    expect(result.counterexample).toBe('b');
    expect(result.acceptedBy).toBe('B');
  });
});
