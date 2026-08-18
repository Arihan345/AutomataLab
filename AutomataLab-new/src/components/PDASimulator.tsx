import { useState } from 'react';
import { simulatePDA } from '../lib/simulatePDA';
import StackPanel from './StackPanel';
import type { PDA } from '../types/pda';

export default function PDASimulator({ pda }: { pda: PDA }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof simulatePDA> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  function handleRun() {
    const res = simulatePDA(pda, input);
    setResult(res);
    setStepIndex(0);
  }

  const currentStep = result?.steps[stepIndex];

  return (
    <div style={{ padding: 10, border: '1px solid #ddd' }}>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Test string" />
      <button onClick={handleRun}>Run</button>
      {result && (
        <div style={{ marginTop: 8 }}>
          <p style={{ color: result.accepted ? 'green' : 'red', fontWeight: 'bold' }}>
            {result.accepted ? 'Accepted' : 'Rejected'}
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div>
              <p>State: {currentStep?.state}</p>
              <button disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>Prev</button>
              <button disabled={stepIndex >= (result.steps.length - 1)} onClick={() => setStepIndex((i) => i + 1)}>Next</button>
            </div>
            {currentStep && <StackPanel stack={currentStep.stack} />}
          </div>
        </div>
      )}
    </div>
  );
}