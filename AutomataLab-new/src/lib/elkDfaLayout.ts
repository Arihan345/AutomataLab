import ELK from 'elkjs/lib/elk.bundled.js';
import type { DFA } from '../types/automaton';

const elk = new ELK();

export async function elkDfaLayout(dfa: DFA) {
  const nonSelfLoopTargets: { source: string; target: string }[] = [];
  Object.entries(dfa.transitions).forEach(([from, table]) => {
    Object.values(table).forEach((to) => {
      if (to !== from) nonSelfLoopTargets.push({ source: from, target: to });
    });
  });

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '90',
      'elk.layered.spacing.nodeNodeBetweenLayers': '140',
      'elk.edgeRouting': 'SPLINES',
    },
    children: dfa.states.map((s) => ({ id: s, width: 70, height: 70 })),
    edges: nonSelfLoopTargets.map((e, i) => ({
      id: `e${i}`,
      sources: [e.source],
      targets: [e.target],
    })),
  };

  const result = await elk.layout(graph);

  const positions: Record<string, { x: number; y: number }> = {};
  (result.children ?? []).forEach((node) => {
    positions[node.id!] = { x: node.x ?? 0, y: node.y ?? 0 };
  });

  return positions;
}