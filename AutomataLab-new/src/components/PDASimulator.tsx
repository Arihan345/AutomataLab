import { useState } from 'react';
import { simulatePDA } from '../lib/simulatePDA';
import StackPanel from './StackPanel';
import Spinner from './Spinner';
import type { PDA } from '../types/pda';

export default function PDASimulator({ pda }: { pda: PDA }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof simulatePDA> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  function handleRun() {
    setLoading(true);
    // simulatePDA is synchronous, but we defer one tick so the spinner
    // actually paints for very fast runs — also future-proofs this if
    // simulation logic ever becomes async (e.g. server-side execution)
    setTimeout(() => {
      const res = simulatePDA(pda, input);
      setResult(res);
      setStepIndex(0);
      setLoading(false);
    }, 0);
  }

  const currentStep = result?.steps[stepIndex];

  return (
    <div className="panel">
      <h4 style={{ margin: '0 0 12px', fontSize: 13, color: '#ffb454', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Simulate a String
      </h4>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. ()"
          style={{ flex: 1 }}
        />
        <button onClick={handleRun} disabled={input.trim().length === 0 || loading}>
          {loading ? <Spinner /> : 'Run'}
        </button>
      </div>

      {!result && !loading && (
        <p style={{ marginTop: 12, fontSize: 12, color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>
          No string loaded — enter a string above to step through the stack execution.
        </p>
      )}

      {result && (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: result.accepted ? '#5eead4' : '#f87171', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
            {result.accepted ? '✓ ACCEPTED' : '✗ REJECTED'}
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 10 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>
                Step {stepIndex + 1} / {result.steps.length} · state: {currentStep?.state}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>Prev</button>
                <button disabled={stepIndex >= result.steps.length - 1} onClick={() => setStepIndex((i) => i + 1)}>Next</button>
              </div>
            </div>
            {currentStep && <StackPanel stack={currentStep.stack} />}
          </div>
        </div>
      )}
    </div>
  );
}