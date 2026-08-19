import { useState } from 'react';
import DFAViewer from './DFAViewer';
import ManualInput from './ManualInput';
import RegexInput from './RegexInput';
import NFAViewer from './NFAViewer';
import AlgorithmInspector from './AlgorithmInspector';
import SaveLoadPanel from './SaveLoadPanel';
import Simulator from './Simulator';
import { subsetConstruction } from '../lib/subsetConstruction';
import { minimizeDFA } from '../lib/minimizeDFA';
import type { DFA, NFA } from '../types/automaton';

const sampleDfa: DFA = {
  id: 1, name: 'Contains at least one a', description: 'Accepts any string over {a,b} containing at least one a',
  states: ['q0', 'q1'], alphabet: ['a', 'b'],
  transitions: { q0: { a: 'q1', b: 'q0' }, q1: { a: 'q1', b: 'q1' } },
  startState: 'q0', acceptStates: ['q1'],
};

export default function RegexPage() {
  const [currentDfa, setCurrentDfa] = useState<DFA>(sampleDfa);
  const [currentNfa, setCurrentNfa] = useState<NFA | null>(null);

  const derivedDfa = currentNfa ? subsetConstruction(currentNfa, 2, 'Derived DFA', 'From NFA via subset construction') : null;
  const minimizedDfa = derivedDfa ? minimizeDFA(derivedDfa, 3, 'Minimal DFA', 'Minimized via partition refinement') : null;

  return (
    <div>
      <div style={{ display: 'flex', minHeight: '50vh' }}>
        <div style={{ width: 300 }}>
          <ManualInput onSubmit={setCurrentDfa} />
          <SaveLoadPanel type="dfa" currentData={currentDfa} onLoad={setCurrentDfa} />
          <Simulator dfa={currentDfa} />
        </div>
        <div style={{ flex: 1 }}><DFAViewer dfa={currentDfa} /></div>
      </div>

      <div style={{ display: 'flex', minHeight: '50vh' }}>
        <div style={{ width: 300 }}>
          <RegexInput onSubmit={setCurrentNfa} />
          {currentNfa && <SaveLoadPanel type="nfa" currentData={currentNfa} onLoad={setCurrentNfa} />}
        </div>
        {currentNfa && <div style={{ flex: 1 }}><NFAViewer nfa={currentNfa} /></div>}
      </div>

      {derivedDfa && (
        <div style={{ display: 'flex', minHeight: '50vh' }}>
          <div style={{ width: 300 }}>
            <h4 style={{ margin: 4 }}>Derived DFA</h4>
            <Simulator dfa={derivedDfa} />
          </div>
          <div style={{ flex: 1, height: '45vh' }}><DFAViewer dfa={derivedDfa} /></div>
        </div>
      )}

      {minimizedDfa && (
        <div style={{ display: 'flex', minHeight: '50vh' }}>
          <div style={{ width: 300 }}>
            <h4 style={{ margin: 4 }}>Minimal DFA</h4>
            <Simulator dfa={minimizedDfa} />
          </div>
          <div style={{ flex: 1, height: '45vh' }}><DFAViewer dfa={minimizedDfa} /></div>
        </div>
      )}

      {minimizedDfa && currentNfa && derivedDfa && (
        <AlgorithmInspector
          steps={[
            `Parsed regex: ${currentNfa.name}`,
            `Built NFA with ${currentNfa.states.length} states via Thompson's Construction`,
            `Subset construction produced DFA with ${derivedDfa.states.length} states`,
            `Minimization reduced to ${minimizedDfa.states.length} states`,
          ]}
        />
      )}
    </div>
  );
}