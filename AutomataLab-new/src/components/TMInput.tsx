import { useState } from 'react';
import type { TM } from '../types/tm';

export default function TMInput({ onSubmit }: { onSubmit: (tm: TM) => void }) {
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
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} cols={40} placeholder="Paste your TM JSON here" />
      <br />
      <button onClick={handleSubmit}>Load TM</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}