import { useState } from 'react';
import type { DFA } from '../types/automaton';

export default function ManualInput({ onSubmit }: { onSubmit: (dfa: DFA) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    try {
      const parsed = JSON.parse(text);
      onSubmit(parsed);
      setError(null);
    } catch (e) {
      setError('Invalid JSON — check your syntax.');
    }
  }

  return (
    <div className="panel">
      <h4 style={{ margin: '0 0 12px', fontSize: 13, color: '#ffb454', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Manual DFA Input
      </h4>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        style={{ width: '100%' }}
        placeholder="Paste your DFA JSON here"
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleSubmit}>Load DFA</button>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </div>
  );
}