export const BLANK = '_';

export type TMTransition = {
  write: string;
  move: 'L' | 'R';
  newState: string;
};

export type TM = {
  id: number;
  name: string;
  description: string;
  states: string[];
  tapeAlphabet: string[];
  blankSymbol: string;
  startState: string;
  acceptStates: string[];
  rejectStates: string[];
  // transitions[state][readSymbol] = { write, move, newState }
  transitions: Record<string, Record<string, TMTransition>>;
};