import { useState } from 'react';
import DFAViewer from './components/DFAViewer';
import ManualInput from './components/ManualInput';
import RegexInput from './components/RegexInput';
import NFAViewer from './components/NFAViewer';
import AlgorithmInspector from './components/AlgorithmInspector';
import SaveLoadPanel from './components/SaveLoadPanel';
import { subsetConstruction } from './lib/subsetConstruction';
import { minimizeDFA } from './lib/minimizeDFA';
import type { DFA, NFA } from './types/automaton';

const sampleDfa: DFA = {
  id: 1,
  name: 'Contains at least one a',
  description: 'Accepts any string over {a,b} containing at least one a',
  states: ['q0', 'q1'],
  alphabet: ['a', 'b'],
  transitions: {
    q0: { a: 'q1', b: 'q0' },
    q1: { a: 'q1', b: 'q1' },
  },
  startState: 'q0',
  acceptStates: ['q1'],
};

export default function App() {
  const [currentDfa, setCurrentDfa] = useState<DFA>(sampleDfa);
  const [currentNfa, setCurrentNfa] = useState<NFA | null>(null);

  const derivedDfa = currentNfa
    ? subsetConstruction(currentNfa, 2, 'Derived DFA', 'From NFA via subset construction')
    : null;

  const minimizedDfa = derivedDfa
    ? minimizeDFA(derivedDfa, 3, 'Minimal DFA', 'Minimized via partition refinement')
    : null;

  return (
    <div style={{ width: '100vw', display: 'flex', flexDirection: 'column' }}>
      {/* Manual DFA section */}
      <div style={{ display: 'flex', minHeight: '50vh' }}>
        <div style={{ width: 300 }}>
          <ManualInput onSubmit={setCurrentDfa} />
          <SaveLoadPanel type="dfa" currentData={currentDfa} onLoad={setCurrentDfa} />
        </div>
        <div style={{ flex: 1 }}>
          <DFAViewer dfa={currentDfa} />
        </div>
      </div>

      {/* Regex -> NFA section */}
      <div style={{ display: 'flex', minHeight: '50vh' }}>
        <div style={{ width: 300 }}>
          <RegexInput onSubmit={setCurrentNfa} />
          {currentNfa && (
            <SaveLoadPanel type="nfa" currentData={currentNfa} onLoad={setCurrentNfa} />
          )}
        </div>
        {currentNfa && (
          <div style={{ flex: 1 }}>
            <NFAViewer nfa={currentNfa} />
          </div>
        )}
      </div>

      {/* Derived DFA (subset construction) */}
      {derivedDfa && (
        <div style={{ minHeight: '50vh' }}>
          <h4 style={{ margin: 4 }}>Derived DFA (subset construction)</h4>
          <div style={{ height: '45vh' }}>
            <DFAViewer dfa={derivedDfa} />
          </div>
        </div>
      )}

      {/* Minimal DFA */}
      {minimizedDfa && (
        <div style={{ minHeight: '50vh' }}>
          <h4 style={{ margin: 4 }}>Minimal DFA</h4>
          <div style={{ height: '45vh' }}>
            <DFAViewer dfa={minimizedDfa} />
          </div>
        </div>
      )}

      {/* Algorithm Inspector */}
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