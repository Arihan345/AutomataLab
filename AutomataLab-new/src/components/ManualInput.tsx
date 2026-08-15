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
    <div style={{ padding: 10 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        cols={50}
        placeholder="Paste your DFA JSON here"
      />
      <br />
      <button onClick={handleSubmit}>Load DFA</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}