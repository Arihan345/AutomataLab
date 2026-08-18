import type { PDA } from '../types/pda';
import { EPSILON_PDA } from '../types/pda';

type PDAStep = { state: string; stack: string[]; inputIndex: number };

export function simulatePDA(pda: PDA, input: string): { steps: PDAStep[]; accepted: boolean } {
  const MAX_STEPS = 1000;
  const steps: PDAStep[] = [];

  let state = pda.startState;
  let stack = [pda.startStackSymbol];
  let inputIndex = 0;
  let stepCount = 0;

  steps.push({ state, stack: [...stack], inputIndex });

  while (stepCount < MAX_STEPS) {
    stepCount++;
    const stackTop = stack[stack.length - 1];
    const currentSymbol = input[inputIndex];

    // Try consuming a real input symbol first
    const consumingOptions = currentSymbol
      ? pda.transitions[state]?.[currentSymbol]?.[stackTop]
      : undefined;

    // Try epsilon transition
    const epsilonOptions = pda.transitions[state]?.[EPSILON_PDA]?.[stackTop];

    const chosen = consumingOptions?.[0] ?? epsilonOptions?.[0];
    const isConsuming = !!consumingOptions?.[0];

    if (!chosen) {
      // stuck — no valid move
      break;
    }

    stack.pop();
stack.push(...chosen.push.slice().reverse());
    state = chosen.newState;
    if (isConsuming) inputIndex++;

    steps.push({ state, stack: [...stack], inputIndex });

    if (inputIndex >= input.length && !pda.transitions[state]?.[EPSILON_PDA]?.[stack[stack.length - 1]]) {
      break; // input consumed and no more forced epsilon moves
    }
  }

  const accepted = inputIndex >= input.length && pda.acceptStates.includes(state);
  return { steps, accepted };
}