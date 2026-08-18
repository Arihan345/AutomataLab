import { useState } from 'react';
import { simulateDFA } from '../lib/simulate';
import type { DFA } from '../types/automaton';

export default function Simulator({ dfa }: { dfa: DFA }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ path: string[]; accepted: boolean } | null>(null);

  function handleRun() {
    const res = simulateDFA(dfa, input);
    setResult(res);
  }

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', marginTop: 10 }}>
      <strong>Simulate a string</strong>
      <div style={{ marginTop: 6 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. aab"
          style={{ marginRight: 6 }}
        />
        <button onClick={handleRun}>Run</button>
      </div>
      {result && (
        <div style={{ marginTop: 8 }}>
          <p style={{ color: result.accepted ? 'green' : 'red', fontWeight: 'bold' }}>
            {result.accepted ? 'Accepted' : 'Rejected'}
          </p>
          <p style={{ fontSize: 12, color: '#555' }}>
            Path: {result.path.join(' → ')}
          </p>
        </div>
      )}
    </div>
  );
}