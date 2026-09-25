import type { DFA } from '../types/automaton';
import { minimizeDFA } from './minimizeDFA';

// Sentinel for "no transition defined" — an implicit dead/trap state that
// never accepts and always transitions back to itself.
const DEAD = '\u0000dead';

type Pair = { a: string; b: string };

function pairKey(p: Pair): string {
  return `${p.a}\u0001${p.b}`;
}

function accepts(dfa: DFA, state: string): boolean {
  return state !== DEAD && dfa.acceptStates.includes(state);
}

export function checkEquivalence(
  dfaA: DFA,
  dfaB: DFA
): { equivalent: boolean; counterexample?: string; acceptedBy?: 'A' | 'B' } {
  const minA = minimizeDFA(dfaA, dfaA.id, dfaA.name, dfaA.description).dfa;
  const minB = minimizeDFA(dfaB, dfaB.id, dfaB.name, dfaB.description).dfa;

  const alphabet = [...new Set([...minA.alphabet, ...minB.alphabet])];

  const start: Pair = { a: minA.startState, b: minB.startState };
  const startKey = pairKey(start);

  const visited = new Set([startKey]);
  const parent = new Map<string, { prevKey: string; symbol: string } | null>();
  parent.set(startKey, null);

  const queue: Pair[] = [start];

  function reconstruct(key: string): string {
    const symbols: string[] = [];
    let cur = parent.get(key);
    while (cur) {
      symbols.push(cur.symbol);
      cur = parent.get(cur.prevKey) ?? null;
    }
    return symbols.reverse().join('');
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = pairKey(current);

    const acceptA = accepts(minA, current.a);
    const acceptB = accepts(minB, current.b);
    if (acceptA !== acceptB) {
      return {
        equivalent: false,
        counterexample: reconstruct(key),
        acceptedBy: acceptA ? 'A' : 'B',
      };
    }

    for (const symbol of alphabet) {
      const nextA = (current.a !== DEAD && minA.transitions[current.a]?.[symbol]) || DEAD;
      const nextB = (current.b !== DEAD && minB.transitions[current.b]?.[symbol]) || DEAD;
      const nextPair: Pair = { a: nextA, b: nextB };
      const nextKey = pairKey(nextPair);
      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        parent.set(nextKey, { prevKey: key, symbol });
        queue.push(nextPair);
      }
    }
  }

  return { equivalent: true };
}
