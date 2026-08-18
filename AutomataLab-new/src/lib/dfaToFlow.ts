import type { DFA } from '../types/automaton';
import { getLayoutedElements } from './layout';

export default function dfatoFlow(dfa: DFA) {
  const nodes = dfa.states.map((state) => {
    const selfLoops = Object.entries(dfa.transitions[state] ?? {})
      .filter(([, target]) => target === state)
      .map(([symbol]) => symbol);

    return {
      id: state,
      type: 'state',
      position: { x: 0, y: 0 },
      data: { label: state, isAccept: dfa.acceptStates.includes(state), selfLoops },
    };
  });

  const edges = Object.entries(dfa.transitions).flatMap(([fromState, table]) => {
    const entries = Object.entries(table).filter(([, toState]) => toState !== fromState);

    return entries.map(([symbol, toState]) => {
      const sameTargetSymbols = entries.filter(([, t]) => t === toState);
      const symbolIndex = sameTargetSymbols.findIndex(([s]) => s === symbol);
      const totalWithSameTarget = sameTargetSymbols.length;
      // spread curvature evenly: e.g. 2 edges -> -0.3 and +0.3
      const curvature = totalWithSameTarget > 1
        ? (symbolIndex - (totalWithSameTarget - 1) / 2) * 0.6
        : 0;

      return {
        id: `${fromState}-${symbol}-${toState}`,
        source: fromState,
        target: toState,
        label: symbol,
        type: 'default',
        pathOptions: { curvature },
      };
    });
  });

  return getLayoutedElements(nodes, edges);
}