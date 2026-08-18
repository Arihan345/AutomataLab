import type { NFA, DFA } from '../types/automaton';
import { EPSILON } from '../types/automaton';

function epsilonClosure(nfa: NFA, states: string[]): string[] {
  const closure = new Set(states);
  const stack = [...states];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const epsilonTargets = nfa.transitions[current]?.[EPSILON] ?? [];
    for (const target of epsilonTargets) {
      if (!closure.has(target)) {
        closure.add(target);
        stack.push(target);
      }
    }
  }

  return [...closure].sort();
}

function move(nfa: NFA, states: string[], symbol: string): string[] {
  const result = new Set<string>();
  for (const state of states) {
    const targets = nfa.transitions[state]?.[symbol] ?? [];
    targets.forEach((t) => result.add(t));
  }
  return [...result];
}

function stateSetId(states: string[]): string {
  return states.slice().sort().join(',');
}

export function subsetConstruction(nfa: NFA, id: number, name: string, description: string): DFA {
  const startSet = epsilonClosure(nfa, [nfa.startState]);
  const startId = stateSetId(startSet);

  const dfaStates: string[] = [startId];
  const dfaTransitions: Record<string, Record<string, string>> = {};
  const dfaAccept: string[] = [];
  const stateSetMap: Record<string, string[]> = { [startId]: startSet };

  const worklist = [startSet];
  const visited = new Set([startId]);

  while (worklist.length > 0) {
    const currentSet = worklist.pop()!;
    const currentId = stateSetId(currentSet);

    if (currentSet.some((s) => nfa.acceptStates.includes(s))) {
      dfaAccept.push(currentId);
    }

    for (const symbol of nfa.alphabet) {
      const moved = move(nfa, currentSet, symbol);
      if (moved.length === 0) continue;

      const closed = epsilonClosure(nfa, moved);
      const closedId = stateSetId(closed);

      if (!dfaTransitions[currentId]) dfaTransitions[currentId] = {};
      dfaTransitions[currentId][symbol] = closedId;

      if (!visited.has(closedId)) {
        visited.add(closedId);
        dfaStates.push(closedId);
        stateSetMap[closedId] = closed;
        worklist.push(closed);
      }
    }
  }

  return {
    id,
    name,
    description,
    states: dfaStates,
    alphabet: nfa.alphabet,
    transitions: dfaTransitions,
    startState: startId,
    acceptStates: dfaAccept,
  };
}