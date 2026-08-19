import { useState } from 'react';
import { parseGrammar } from '../lib/parseGrammar';
import type { CFG } from '../types/cfg';

export default function CFGInput({ onSubmit }: { onSubmit: (cfg: CFG) => void }) {
  const [text, setText] = useState('S -> AB | a\nA -> a\nB -> b');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    try {
      const cfg = parseGrammar(text, 1, 'My Grammar', 'Grammar in CNF');
      onSubmit(cfg);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse grammar');
    }
  }

  return (
    <div style={{ padding: 10 }}>
      <p style={{ fontSize: 12, color: '#555' }}>
        Enter grammar in Chomsky Normal Form, one rule per line: "S -&gt; AB | a"
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        cols={40}
      />
      <br />
      <button onClick={handleSubmit}>Build Grammar</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}