import { useState } from 'react';
import DFAViewer from './components/DFAViewer';
import ManualInput from './components/ManualInput';
import type { DFA } from './types/automaton';
import { simulateDFA } from './lib/simulate';

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

console.log(simulateDFA(sampleDfa, "ab"));
console.log(simulateDFA(sampleDfa, "b"));
console.log(simulateDFA(sampleDfa, "aab"));

export default function App() {
  const [currentDfa, setCurrentDfa] = useState<DFA>(sampleDfa);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex' }}>
      <div style={{ width: 300 }}>
        <ManualInput onSubmit={setCurrentDfa} />
      </div>
      <div style={{ flex: 1 }}>
        <DFAViewer dfa={currentDfa} />
      </div>
    </div>
  );
}