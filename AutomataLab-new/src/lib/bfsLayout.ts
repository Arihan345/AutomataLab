import type { DFA } from '../types/automaton';

const X_GAP = 220;
const Y_BASE = 250;

export function bfsLayout(dfa: DFA) {
  // BFS from start state to assign each state a horizontal "rank" (column)
  const rank: Record<string, number> = { [dfa.startState]: 0 };
  const queue = [dfa.startState];
  const visited = new Set([dfa.startState]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentRank = rank[current];
    Object.values(dfa.transitions[current] ?? {}).forEach((next) => {
      if (!visited.has(next)) {
        visited.add(next);
        rank[next] = currentRank + 1;
        queue.push(next);
      }
    });
  }

  // any unreached states (shouldn't normally happen for a total DFA) get placed at the end
  let maxRank = Math.max(0, ...Object.values(rank));
  dfa.states.forEach((s) => {
    if (!(s in rank)) {
      maxRank += 1;
      rank[s] = maxRank;
    }
  });

  const positions: Record<string, { x: number; y: number }> = {};
  dfa.states.forEach((s) => {
    positions[s] = { x: rank[s] * X_GAP, y: Y_BASE };
  });

  return { positions, rank };
}