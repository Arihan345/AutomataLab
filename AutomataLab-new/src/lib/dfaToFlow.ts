import type { DFA } from '../types/automaton';
import { getLayoutedElements } from './layout';

const dfatoFlow = (dfa:DFA) => {
    const nodes=dfa.states.map((state)=>({
  id: state,
  type: 'state',
  position: { x: 0, y: 0 },
  data: { label: state, isAccept: dfa.acceptStates.includes(state) },
}));
    const edges = Object.entries(dfa.transitions).flatMap(([fromState, transitions]) =>
        Object.entries(transitions).map(([symbol, toState]) => ({
  id: `${fromState}-${symbol}-${toState}`,
  source: fromState,
  target: toState,
  label: symbol,
}))
    );
    return getLayoutedElements( nodes, edges);
}
 
export default dfatoFlow;