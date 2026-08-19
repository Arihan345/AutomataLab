import type { DFA } from '../types/automaton';

export type SubsetMap = Record<string, string[]>; // clean id -> original NFA states

export function relabelDFA(dfa: DFA): { dfa: DFA; subsetMap: SubsetMap } {
  const idMap: Record<string, string> = {};
  const subsetMap: SubsetMap = {};

  dfa.states.forEach((oldId, i) => {
    const cleanId = `q${i}`;
    idMap[oldId] = cleanId;
    subsetMap[cleanId] = oldId.split(',');
  });

  const newTransitions: DFA['transitions'] = {};
  Object.entries(dfa.transitions).forEach(([fromOld, table]) => {
    const fromNew = idMap[fromOld];
    newTransitions[fromNew] = {};
    Object.entries(table).forEach(([symbol, toOld]) => {
      newTransitions[fromNew][symbol] = idMap[toOld];
    });
  });

  return {
    dfa: {
      ...dfa,
      states: dfa.states.map((s) => idMap[s]),
      transitions: newTransitions,
      startState: idMap[dfa.startState],
      acceptStates: dfa.acceptStates.map((s) => idMap[s]),
    },
    subsetMap,
  };
}