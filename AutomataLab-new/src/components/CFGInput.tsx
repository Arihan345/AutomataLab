import { useState } from 'react';
import { parseGrammar } from '../lib/parseGrammar';
import { Button } from './ui/Button';
import type { CFG } from '../types/cfg';

export default function CFGInput({ onSubmit }: { onSubmit: (cfg: CFG) => void }) {
  const [text, setText] = useState('S -> AB | a\nA -> a\nB -> b');
  const [error, setError] = useState<string | null>(null);
  const lines = text.split('\n');

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
    <div className="panel">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, fontFamily: 'var(--mono)', fontWeight: 600 }}>
          Grammar
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>CNF</p>
      </div>
      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--surface)' }}>
        <div style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: 12.5, userSelect: 'none', borderRight: '1px solid var(--border)' }}>
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={Math.max(6, lines.length)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'vertical',
            color: 'var(--text-1)', fontFamily: 'var(--mono)', fontSize: 12.5, padding: 10, lineHeight: 1.5,
          }}
        />
      </div>
      <Button onClick={handleSubmit} disabled={text.trim().length === 0} style={{ marginTop: 12, width: '100%' }}>
        Build Grammar
      </Button>
      {error && <p style={{ color: 'var(--rose)', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </div>
  );
}