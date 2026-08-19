import type { TM } from '../types/tm';
import { BLANK } from '../types/tm';

export type TMStep = {
  tape: string[];
  headPosition: number;
  state: string;
};

export function simulateTM(
  tm: TM,
  input: string
): { steps: TMStep[]; accepted: boolean; halted: boolean } {
  const MAX_STEPS = 500;

  let tape = input.split('');
  if (tape.length === 0) tape = [tm.blankSymbol];
  let headPosition = 0;
  let state = tm.startState;

  const steps: TMStep[] = [{ tape: [...tape], headPosition, state }];

  let stepCount = 0;
  let halted = false;

  while (stepCount < MAX_STEPS) {
    stepCount++;

    if (tm.acceptStates.includes(state) || tm.rejectStates.includes(state)) {
      halted = true;
      break;
    }

    const currentSymbol = tape[headPosition] ?? tm.blankSymbol;
    const transition = tm.transitions[state]?.[currentSymbol];

    if (!transition) {
      halted = true;
      break;
    }

    tape[headPosition] = transition.write;

    if (transition.move === 'R') {
      headPosition++;
      if (headPosition >= tape.length) tape.push(tm.blankSymbol);
    } else {
      headPosition--;
      if (headPosition < 0) {
        tape.unshift(tm.blankSymbol);
        headPosition = 0;
      }
    }

    state = transition.newState;
    steps.push({ tape: [...tape], headPosition, state });
  }

  const accepted = tm.acceptStates.includes(state);
  return { steps, accepted, halted };
}