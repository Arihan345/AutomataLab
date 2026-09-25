import type { PDA, PDATransitionResult } from '../types/pda';
import { EPSILON_PDA } from '../types/pda';

type PDAStep = { state: string; stack: string[]; inputIndex: number };
type Config = { state: string; stack: string[]; inputIndex: number };

// PDA transitions are genuinely nondeterministic: a configuration can have
// several available options (a consuming transition, an epsilon transition,
// or several entries in either list for the same state/symbol/stack-top).
// The previous implementation always greedily took the first available
// option with no way to recover, so it silently rejected strings that were
// only reachable via a non-first branch.
//
// This version explores the nondeterminism via backtracking DFS: at each
// configuration it tries every available transition in turn (consuming
// options before epsilon options, so it still finds the "obvious" path
// first when there's no ambiguity), and backtracks to the next option when
// a branch doesn't lead to acceptance. A visited-(state, stack, inputIndex)
// set prevents infinite loops through epsilon cycles, and a shared
// expansion budget bounds the total search size.
//
// (The alternative — tracking the full *set* of reachable configurations
// simultaneously, subset-construction style — would avoid redundant work
// on shared prefixes, but backtracking was chosen because it keeps the
// single linear `steps` path the existing step-through UI expects, with no
// changes needed to PDAPage's rendering.)
export function simulatePDA(pda: PDA, input: string): { steps: PDAStep[]; accepted: boolean } {
  const MAX_EXPANSIONS = 1000;
  let budget = MAX_EXPANSIONS;
  const visited = new Set<string>();

  const toStep = (c: Config): PDAStep => ({ state: c.state, stack: [...c.stack], inputIndex: c.inputIndex });

  const initial: Config = { state: pda.startState, stack: [pda.startStackSymbol], inputIndex: 0 };
  // Tracks the deepest configuration reached across the whole search, so a
  // rejected input still has a representative path to show in the UI.
  let longestPath: PDAStep[] = [toStep(initial)];

  function isAccepting(c: Config): boolean {
    return c.inputIndex >= input.length && pda.acceptStates.includes(c.state);
  }

  function search(config: Config, path: PDAStep[]): PDAStep[] | null {
    if (path.length > longestPath.length) longestPath = path;
    if (isAccepting(config)) return path;
    if (budget-- <= 0) return null;

    const key = `${config.state}\u0001${config.stack.join(',')}\u0001${config.inputIndex}`;
    if (visited.has(key)) return null;
    visited.add(key);

    const { state, stack, inputIndex } = config;
    const stackTop = stack[stack.length - 1];
    const currentSymbol = input[inputIndex];

    const branches: { result: PDATransitionResult; consuming: boolean }[] = [];
    if (currentSymbol !== undefined) {
      for (const result of pda.transitions[state]?.[currentSymbol]?.[stackTop] ?? []) {
        branches.push({ result, consuming: true });
      }
    }
    for (const result of pda.transitions[state]?.[EPSILON_PDA]?.[stackTop] ?? []) {
      branches.push({ result, consuming: false });
    }

    for (const { result, consuming } of branches) {
      const nextStack = [...stack.slice(0, -1), ...result.push.slice().reverse()];
      const nextConfig: Config = {
        state: result.newState,
        stack: nextStack,
        inputIndex: consuming ? inputIndex + 1 : inputIndex,
      };
      const found = search(nextConfig, [...path, toStep(nextConfig)]);
      if (found) return found;
    }
    return null;
  }

  const accepting = search(initial, [toStep(initial)]);
  if (accepting) return { steps: accepting, accepted: true };
  return { steps: longestPath, accepted: false };
}
