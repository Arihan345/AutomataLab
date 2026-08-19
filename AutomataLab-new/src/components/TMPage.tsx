import { useState, useEffect } from 'react';
import TapeViewer from './TapeViewer';
import { simulateTM } from '../lib/simulateTM';
import { saveAutomaton, listAutomata, loadAutomaton } from '../lib/api';
import { ControlBar, ControlGroup } from './ui/ControlBar';
import { JsonPopover } from './ui/JsonPopover';
import { BottomInspector } from './ui/BottomInspector';
import { Input, Select } from './ui/Input';
import { Button } from './ui/Button';
import { EmptyState } from './ui/Composite';
import type { TM } from '../types/tm';

export default function TMPage() {
  const [text, setText] = useState('');
  const [textError, setTextError] = useState<string | null>(null);
  const [tm, setTm] = useState<TM | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof simulateTM> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [savedItems, setSavedItems] = useState<{ id: number; name: string }[]>([]);
  const [selectedSaved, setSelectedSaved] = useState('');
  const [saveName, setSaveName] = useState('');

  async function refreshSaved() {
    const list = await listAutomata();
    setSavedItems(list.filter((i: any) => i.type === 'tm'));
  }
  useEffect(() => { refreshSaved(); }, []);

  function handleBuild() {
    try {
      setTm(JSON.parse(text));
      setTextError(null);
      setResult(null);
    } catch {
      setTextError('Invalid JSON.');
    }
  }

  function handleRun() {
    if (!tm || !input.trim()) return;
    setResult(simulateTM(tm, input));
    setStepIndex(0);
  }

  async function handleSave() {
    if (!tm || !saveName.trim()) return;
    await saveAutomaton('tm', saveName, '', tm);
    setSaveName('');
    refreshSaved();
  }

  async function handleLoadSaved(id: string) {
    setSelectedSaved(id);
    if (!id) return;
    const record = await loadAutomaton(Number(id));
    setTm(record.data);
    setText(JSON.stringify(record.data, null, 2));
    setResult(null);
  }

  const currentStep = result?.steps[stepIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ControlBar>
        <ControlGroup label="TM">
          <JsonPopover label={tm ? 'Loaded' : 'Load TM JSON'} text={text} onChange={setText} onBuild={handleBuild} error={textError} />
        </ControlGroup>

        <ControlGroup label="Saved">
          <Select value={selectedSaved} onChange={(e) => handleLoadSaved(e.target.value)} style={{ width: 160 }}>
            <option value="">{savedItems.length ? 'Load saved...' : 'None saved'}</option>
            {savedItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
        </ControlGroup>

        <ControlGroup label="Tape input">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 11" style={{ width: 140 }} />
        </ControlGroup>

        <div style={{ paddingTop: 16 }}>
          <Button onClick={handleRun} disabled={!tm || !input.trim()}>▶ Run</Button>
        </div>

        {result && (
          <div style={{ paddingTop: 14 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: result.accepted ? 'var(--teal)' : 'var(--rose)' }}>
              {result.accepted ? '✓ Accepted' : result.halted ? '✕ Rejected' : '… Step limit reached'}
            </span>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, paddingTop: 16 }}>
          <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Save as..." style={{ width: 140 }} />
          <Button variant="secondary" size="sm" onClick={handleSave} disabled={!tm || !saveName.trim()}>Save</Button>
        </div>
      </ControlBar>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!tm ? (
          <EmptyState icon="⌂" title="No Turing Machine loaded" desc="Open the TM control to paste a definition." />
        ) : currentStep ? (
          <TapeViewer tape={currentStep.tape} headPosition={currentStep.headPosition} />
        ) : (
          <EmptyState icon="▶" title="Ready" desc="Enter tape input above and run." />
        )}
      </div>

      {result && (
        <BottomInspector
          tabs={[
            {
              label: 'Steps',
              content: (
                <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--mono)', fontSize: 13 }}>
                  <Button size="sm" variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>Prev</Button>
                  <Button size="sm" variant="secondary" disabled={stepIndex >= result.steps.length - 1} onClick={() => setStepIndex((i) => i + 1)}>Next</Button>
                  <span style={{ color: 'var(--text-2)' }}>Step {stepIndex + 1} / {result.steps.length} — state: {currentStep?.state}</span>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}