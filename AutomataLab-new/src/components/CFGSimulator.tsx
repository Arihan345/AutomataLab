import { useState } from 'react';
import { cykParse } from '../lib/cyk';
import ParseTreeViewer from './ParseTreeViewer';
import type { CFG } from '../types/cfg';

export default function CFGSimulator({ cfg }: { cfg: CFG }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof cykParse> | null>(null);

  function handleRun() {
    setResult(cykParse(cfg, input));
  }

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', marginTop: 10 }}>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Test string" />
      <button onClick={handleRun}>Run CYK</button>
      {result && (
        <div style={{ marginTop: 8 }}>
          <p style={{ color: result.accepted ? 'green' : 'red', fontWeight: 'bold' }}>
            {result.accepted ? 'Accepted' : 'Rejected'}
          </p>
          {result.accepted && <ParseTreeViewer tree={result.tree} />}
        </div>
      )}
    </div>
  );
}