import type { DFA } from '../types/automaton';
import { getLayoutedElements } from './layout';

export default function dfatoFlow(dfa: DFA, currentState?: string, activeTransition?: { from: string; symbol: string }) {
  const nodes = dfa.states.map((state) => ({
    id: state,
    type: 'state',
    position: { x: 0, y: 0 },
    data: {
      label: state,
      isAccept: dfa.acceptStates.includes(state),
      isStart: state === dfa.startState,
      isCurrent: state === currentState,
    },
  }));

  const allEdges: any[] = [];

  Object.entries(dfa.transitions).forEach(([fromState, table]) => {
    const grouped: Record<string, string[]> = {};
    const selfLoopSymbols: string[] = [];

    Object.entries(table).forEach(([symbol, toState]) => {
      if (toState === fromState) {
        selfLoopSymbols.push(symbol);
      } else {
        if (!grouped[toState]) grouped[toState] = [];
        grouped[toState].push(symbol);
      }
    });

    Object.entries(grouped).forEach(([toState, symbols]) => {
      const isActive = activeTransition?.from === fromState && symbols.includes(activeTransition.symbol);
      allEdges.push({
        id: `${fromState}-${symbols.join('_')}-${toState}`,
        source: fromState,
        target: toState,
        label: symbols.join(', '),
        style: { stroke: isActive ? 'var(--violet)' : 'var(--border-strong)', strokeWidth: isActive ? 2.5 : 1 },
        labelStyle: { fill: isActive ? 'var(--violet)' : 'var(--text-1)', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700 },
        labelBgStyle: { fill: isActive ? 'var(--violet-soft)' : 'var(--surface-2)' },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 10,
        animated: isActive,
      });
    });

    if (selfLoopSymbols.length > 0) {
      const isActive = activeTransition?.from === fromState && selfLoopSymbols.includes(activeTransition.symbol);
      allEdges.push({
        id: `${fromState}-self-${selfLoopSymbols.join('_')}`,
        source: fromState,
        target: fromState,
        sourceHandle: 'loop-source',
        targetHandle: 'loop-target',
        type: 'selfLoop',
        label: selfLoopSymbols.join(', '),
        style: { stroke: isActive ? 'var(--violet)' : 'var(--border-strong)', strokeWidth: isActive ? 2.5 : 1.5 },
      });
    }
  });

  return getLayoutedElements(nodes, allEdges);
}