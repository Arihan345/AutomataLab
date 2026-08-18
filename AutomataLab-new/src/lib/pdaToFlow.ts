import type { PDA } from '../types/pda';
import { EPSILON_PDA } from '../types/pda';
import { getLayoutedElements } from './layout';

export default function pdaToFlow(pda: PDA) {
  const nodes = pda.states.map((state) => ({
    id: state,
    type: 'state',
    position: { x: 0, y: 0 },
    data: { label: state, isAccept: pda.acceptStates.includes(state), selfLoops: [] as string[] },
  }));

  const edgeGroups: Record<string, string[]> = {};
  Object.entries(pda.transitions).forEach(([fromState, symbolTable]) => {
    Object.entries(symbolTable).forEach(([symbol, stackTable]) => {
      Object.entries(stackTable).forEach(([stackTop, results]) => {
        results.forEach((r) => {
          const key = `${fromState}|${r.newState}`;
          const label = `${symbol === EPSILON_PDA ? 'ε' : symbol}, ${stackTop} → ${r.push.join('') || 'ε'}`;
          if (!edgeGroups[key]) edgeGroups[key] = [];
          edgeGroups[key].push(label);
        });
      });
    });
  });

  const edges = Object.entries(edgeGroups).map(([key, labels]) => {
    const [source, target] = key.split('|');
    return {
      id: key,
      source,
      target,
      label: labels.join(' | '),
    };
  });

  return getLayoutedElements(nodes, edges);
}