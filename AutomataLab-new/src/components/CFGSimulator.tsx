import { useState } from 'react';
import { cykParse } from '../lib/cyk';
import CYKTableViewer from './CYKTableViewer';
import InteractiveParseTree from './InteractiveParseTree';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Tabs } from './ui/Composite';
import type { CFG } from '../types/cfg';

export default function CFGSimulator({ cfg }: { cfg: CFG }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof cykParse> | null>(null);

  function handleRun() {
    setResult(cykParse(cfg, input));
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 14, borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. ab" style={{ maxWidth: 200 }} />
        <Button size="sm" onClick={handleRun} disabled={!input.trim()}>Run CYK</Button>
        {result && (
          <div style={{ marginLeft: 4 }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: result.accepted ? 'var(--teal)' : 'var(--rose)', margin: 0 }}>
              {result.accepted ? '✓ Accepted' : '✕ Rejected'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>
              {result.accepted ? `String belongs to L(G)` : 'No derivation from start symbol found'}
            </p>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {!result ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--mono)' }}>
            Run a string to see the CYK table and parse tree.
          </div>
        ) : !result.accepted ? (
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>No parse tree — but here's the CYK table showing why:</p>
            <CYKTableViewer table={result.table} input={input} />
          </div>
        ) : (
          <Tabs
            tabs={[
              { label: 'Parse Tree', content: result.tree ? <InteractiveParseTree tree={result.tree} /> : null },
              { label: 'CYK Table', content: <CYKTableViewer table={result.table} input={input} /> },
            ]}
          />
        )}
      </div>
    </div>
  );
}