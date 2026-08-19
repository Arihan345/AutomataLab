import type { DFA } from '../types/automaton';
import { bfsLayout } from './bfsLayout';

export default function dfatoFlow(dfa: DFA, currentState?: string, activeTransition?: { from: string; symbol: string }) {
  const { positions, rank } = bfsLayout(dfa);

  const nodes = dfa.states.map((state) => ({
    id: state,
    type: 'state',
    position: positions[state],
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
      const isBackward = rank[toState] <= rank[fromState];

      allEdges.push({
        id: `${fromState}-${symbols.join('_')}-${toState}`,
        source: fromState,
        target: toState,
        type: isBackward ? 'backward' : 'default',
        label: symbols.join(', '),
        _span: isBackward ? Math.abs(rank[fromState] - rank[toState]) : undefined,
        style: {
          stroke: isActive ? 'var(--violet)' : 'var(--border-strong)',
          strokeWidth: isActive ? 2.5 : isBackward ? 1 : 1.4,
          opacity: isActive ? 1 : currentState ? 0.25 : isBackward ? 0.4 : 0.85,
        },
        labelStyle: {
          fill: isActive ? 'var(--violet)' : isBackward ? 'var(--text-2)' : 'var(--text-1)',
          fontFamily: 'var(--mono)',
          fontSize: isActive ? 13 : isBackward ? 11 : 13,
          fontWeight: isActive ? 700 : isBackward ? 500 : 700,
        },
        labelBgStyle: { fill: isActive ? 'var(--violet-soft)' : 'var(--surface-2)', fillOpacity: isBackward ? 0.7 : 1 },
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
        style: {
          stroke: isActive ? 'var(--violet)' : 'var(--border-strong)',
          strokeWidth: isActive ? 2.5 : 1.3,
          opacity: isActive ? 1 : currentState ? 0.25 : 0.55,
        },
      });
    }
  });

  const BASE_HEIGHT = 45;
  const HEIGHT_PER_SPAN = 55;
  const backwardEdges = allEdges.filter((e) => e.type === 'backward');
  const spanGroups: Record<number, typeof backwardEdges> = {};
  backwardEdges.forEach((e) => {
    if (!spanGroups[e._span]) spanGroups[e._span] = [];
    spanGroups[e._span].push(e);
  });
  Object.entries(spanGroups).forEach(([spanStr, group]) => {
    const span = Number(spanStr);
    group.forEach((e, i) => {
      e.data = { ...(e.data ?? {}), laneHeight: BASE_HEIGHT + span * HEIGHT_PER_SPAN + i * 22 };
    });
  });

  return { nodes, edges: allEdges };
}