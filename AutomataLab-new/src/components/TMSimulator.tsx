import { useState } from 'react';
import { simulateTM } from '../lib/simulateTM';
import TapeViewer from './TapeViewer';
import type { TM } from '../types/tm';

export default function TMSimulator({ tm }: { tm: TM }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof simulateTM> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  function handleRun() {
    const res = simulateTM(tm, input);
    setResult(res);
    setStepIndex(0);
  }

  const currentStep = result?.steps[stepIndex];

  return (
    <div style={{ padding: 10, border: '1px solid #ddd', marginTop: 10 }}>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tape input" />
      <button onClick={handleRun}>Run</button>
      {result && (
        <div style={{ marginTop: 8 }}>
          <p style={{ color: result.accepted ? 'green' : 'red', fontWeight: 'bold' }}>
            {result.accepted ? 'Accepted' : result.halted ? 'Rejected (halted)' : 'Did not halt (step limit reached)'}
          </p>
          <div>
            <button disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>Prev</button>
            <button disabled={!result || stepIndex >= result.steps.length - 1} onClick={() => setStepIndex((i) => i + 1)}>Next</button>
            <span style={{ marginLeft: 8 }}>Step {stepIndex + 1} / {result.steps.length}, state: {currentStep?.state}</span>
          </div>
          {currentStep && <TapeViewer tape={currentStep.tape} headPosition={currentStep.headPosition} />}
        </div>
      )}
    </div>
  );
}