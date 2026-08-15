import type { DFA } from '../types/automaton';

export function simulateDFA(dfa: DFA, input: string): {path: string[], accepted: boolean} {
  let currentState = dfa.startState;
  const path = [currentState];

  for (const symbol of input) {
    const transitions = dfa.transitions[currentState];
    if (!transitions || !transitions[symbol]) {
      return { path, accepted: false }; // No valid transition, reject the input
    }
    currentState = transitions[symbol];
    path.push(currentState);
  }

  const accepted = dfa.acceptStates.includes(currentState);
  return { path, accepted };
}