import type { NFA } from '../types/automaton';
import { EPSILON } from '../types/automaton';
import { getLayoutedElements } from './layout';

export default function nfaToFlow(nfa: NFA) {
  const nodes = nfa.states.map((state) => ({
    id: state,
    type: 'state',
    position: { x: 0, y: 0 },
    data: {
      label: state,
      isAccept: nfa.acceptStates.includes(state),
      isStart: state === nfa.startState,
    },
  }));

  const allEdges: any[] = [];
  let edgeIndex = 0;

  Object.entries(nfa.transitions).forEach(([fromState, table]) => {
    const grouped: Record<string, string[]> = {};
    const selfLoopLabels: string[] = [];

    Object.entries(table).forEach(([symbol, toStates]) => {
      const label = symbol === EPSILON ? 'ε' : symbol;
      toStates.forEach((toState) => {
        if (toState === fromState) {
          if (!selfLoopLabels.includes(label)) selfLoopLabels.push(label);
        } else {
          if (!grouped[toState]) grouped[toState] = [];
          grouped[toState].push(label);
        }
      });
    });

    Object.entries(grouped).forEach(([toState, labels]) => {
      const isEpsilonOnly = labels.every((l) => l === 'ε');
      const edgeLabel = labels.join(', '); // exact, no fallback to 'ε' ever applied here
      allEdges.push({
        // deterministic, guaranteed-unique id — index + full label baked in
        id: `nfa-${edgeIndex++}-${fromState}-${toState}-${labels.join('_')}`,
        source: fromState,
        target: toState,
        label: edgeLabel,
        data: { label: edgeLabel }, // mirrored, in case any custom edge reads data.label instead
        style: {
          stroke: 'var(--border-strong)',
          strokeWidth: isEpsilonOnly ? 1.3 : 2,
          opacity: isEpsilonOnly ? 0.55 : 1,
        },
        labelStyle: {
          fill: isEpsilonOnly ? 'var(--text-3)' : 'var(--text-1)',
          fontFamily: 'var(--mono)',
          fontSize: isEpsilonOnly ? 10 : 11.5,
          fontWeight: isEpsilonOnly ? 400 : 700,
        },
        labelBgStyle: { fill: 'var(--surface-2)' },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 10,
      });
    });

    if (selfLoopLabels.length > 0) {
      const selfLabel = selfLoopLabels.join(', ');
      allEdges.push({
        id: `nfa-${edgeIndex++}-${fromState}-self-${selfLoopLabels.join('_')}`,
        source: fromState,
        target: fromState,
        sourceHandle: 'loop-source',
        targetHandle: 'loop-target',
        type: 'selfLoop',
        label: selfLabel,
        data: { label: selfLabel },
        style: { stroke: 'var(--border-strong)', strokeWidth: 1.5 },
      });
    }
  });

  // parallel-edge lane offsetting, unchanged
  const pairCounts: Record<string, number> = {};
  allEdges.forEach((e) => {
    if (e.type === 'selfLoop') return;
    const key = `${e.source}->${e.target}`;
    pairCounts[key] = (pairCounts[key] || 0) + 1;
  });
  const pairSeen: Record<string, number> = {};
  allEdges.forEach((e) => {
    if (e.type === 'selfLoop') return;
    const key = `${e.source}->${e.target}`;
    const reverseKey = `${e.target}->${e.source}`;
    const total = (pairCounts[key] || 0) + (pairCounts[reverseKey] || 0);
    if (total > 1) {
      const index = pairSeen[key] ?? 0;
      pairSeen[key] = index + 1;
      e.pathOptions = { offset: 20 + index * 20, borderRadius: 8 };
    }
  });

  return getLayoutedElements(nodes, allEdges);
}