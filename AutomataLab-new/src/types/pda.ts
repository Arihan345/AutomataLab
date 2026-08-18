export const EPSILON_PDA = 'ε';

export type PDATransitionResult = {
  newState: string;
  push: string[]; // symbols to push, in order; empty array means "pop only, push nothing"
};

export type PDA = {
  id: number;
  name: string;
  description: string;
  states: string[];
  inputAlphabet: string[];
  stackAlphabet: string[];
  startState: string;
  startStackSymbol: string;
  acceptStates: string[];
  // transitions[state][inputSymbolOrEpsilon][stackTopSymbol] = list of possible results
  transitions: Record<string, Record<string, Record<string, PDATransitionResult[]>>>;
};