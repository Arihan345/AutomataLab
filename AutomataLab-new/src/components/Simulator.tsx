import { useState } from 'react';
import { simulateDFA } from '../lib/simulate';
import type { DFA } from '../types/automaton';

export default function Simulator({ dfa }: { dfa: DFA }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ path: string[]; accepted: boolean } | null>(null);

  function handleRun() {
    setResult(simulateDFA(dfa, input));
  }

  return (
    <div className="panel">
      <h4 style={{ margin: '0 0 12px', fontSize: 13, color: '#ffb454', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Simulate a String
      </h4>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. aab"
          style={{ flex: 1 }}
        />
        <button onClick={handleRun}>Run</button>
      </div>
      {result && (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: result.accepted ? '#5eead4' : '#f87171', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
            {result.accepted ? '✓ ACCEPTED' : '✗ REJECTED'}
          </p>
          <p style={{ fontSize: 12, color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>
            {result.path.join(' → ')}
          </p>
        </div>
      )}
    </div>
  );
}