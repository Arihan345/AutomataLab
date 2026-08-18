import type { NFA } from '../types/automaton';
import { EPSILON } from '../types/automaton';
import { getLayoutedElements } from './layout';

export default function nfaToFlow(nfa: NFA) {
  const nodes = nfa.states.map((state) => {
    const selfLoops = Object.entries(nfa.transitions[state] ?? {})
      .flatMap(([symbol, targets]) =>
        targets.includes(state) ? [symbol === EPSILON ? 'ε' : symbol] : []
      );

    return {
      id: state,
      type: 'state',
      position: { x: 0, y: 0 },
      data: { label: state, isAccept: nfa.acceptStates.includes(state), selfLoops },
    };
  });

  const edges = Object.entries(nfa.transitions).flatMap(([fromState, table]) => {
    const flatEntries: [string, string][] = Object.entries(table).flatMap(([symbol, toStates]) =>
      toStates.filter((t) => t !== fromState).map((t) => [symbol, t] as [string, string])
    );

    return flatEntries.map(([symbol, toState], i) => {
      const sameTargetSymbols = flatEntries.filter(([, t]) => t === toState);
      const symbolIndex = sameTargetSymbols.findIndex(([s], j) => s === symbol && j === sameTargetSymbols.indexOf(sameTargetSymbols[j]));
      const totalWithSameTarget = sameTargetSymbols.length;
      const idx = sameTargetSymbols.findIndex((entry) => entry[0] === symbol);
      const curvature = totalWithSameTarget > 1
        ? (idx - (totalWithSameTarget - 1) / 2) * 0.6
        : 0;

      return {
        id: `${fromState}-${symbol}-${toState}-${i}`,
        source: fromState,
        target: toState,
        label: symbol === EPSILON ? 'ε' : symbol,
        type: 'default',
        pathOptions: { curvature },
      };
    });
  });

  return getLayoutedElements(nodes, edges);
}