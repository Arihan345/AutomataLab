import { useState, useEffect } from 'react';
import PDAViewer from './PDAViewer';
import StackPanel from './StackPanel';
import { simulatePDA } from '../lib/simulatePDA';
import { saveAutomaton, listAutomata, loadAutomaton } from '../lib/api';
import { ControlBar, ControlGroup } from './ui/ControlBar';
import { JsonPopover } from './ui/JsonPopover';
import { BottomInspector } from './ui/BottomInspector';
import { Input, Select } from './ui/Input';
import { Button } from './ui/Button';
import { EmptyState } from './ui/Composite';
import type { PDA } from '../types/pda';

export default function PDAPage() {
  const [text, setText] = useState('');
  const [textError, setTextError] = useState<string | null>(null);
  const [pda, setPda] = useState<PDA | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof simulatePDA> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [savedItems, setSavedItems] = useState<{ id: number; name: string }[]>([]);
  const [selectedSaved, setSelectedSaved] = useState('');
  const [saveName, setSaveName] = useState('');

  async function refreshSaved() {
    const list = await listAutomata();
    setSavedItems(list.filter((i: any) => i.type === 'pda'));
  }
  useEffect(() => { refreshSaved(); }, []);

  function handleBuild() {
    try {
      setPda(JSON.parse(text));
      setTextError(null);
      setResult(null);
    } catch {
      setTextError('Invalid JSON.');
    }
  }

  function handleRun() {
    if (!pda || !input.trim()) return;
    setResult(simulatePDA(pda, input));
    setStepIndex(0);
  }

  async function handleSave() {
    if (!pda || !saveName.trim()) return;
    await saveAutomaton('pda', saveName, '', pda);
    setSaveName('');
    refreshSaved();
  }

  async function handleLoadSaved(id: string) {
    setSelectedSaved(id);
    if (!id) return;
    const record = await loadAutomaton(Number(id));
    setPda(record.data);
    setText(JSON.stringify(record.data, null, 2));
    setResult(null);
  }

  const currentStep = result?.steps[stepIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ControlBar>
        <ControlGroup label="PDA">
          <JsonPopover label={pda ? 'Loaded' : 'Load PDA JSON'} text={text} onChange={setText} onBuild={handleBuild} error={textError} />
        </ControlGroup>

        <ControlGroup label="Saved">
          <Select value={selectedSaved} onChange={(e) => handleLoadSaved(e.target.value)} style={{ width: 160 }}>
            <option value="">{savedItems.length ? 'Load saved...' : 'None saved'}</option>
            {savedItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
        </ControlGroup>

        <ControlGroup label="Test string">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. ()" style={{ width: 140 }} />
        </ControlGroup>

        <div style={{ paddingTop: 16 }}>
          <Button onClick={handleRun} disabled={!pda || !input.trim()}>▶ Run</Button>
        </div>

        {result && (
          <div style={{ paddingTop: 14 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: result.accepted ? 'var(--teal)' : 'var(--rose)' }}>
              {result.accepted ? '✓ Accepted' : '✕ Rejected'}
            </span>
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, paddingTop: 16 }}>
          <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Save as..." style={{ width: 140 }} />
          <Button variant="secondary" size="sm" onClick={handleSave} disabled={!pda || !saveName.trim()}>Save</Button>
        </div>
      </ControlBar>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex' }}>
        {!pda ? (
          <EmptyState icon="⌂" title="No PDA loaded" desc="Open the PDA control to paste a definition." />
        ) : (
          <>
            <div style={{ flex: 1 }}><PDAViewer pda={pda} /></div>
            {currentStep && (
              <div style={{ borderLeft: '1px solid var(--border)', padding: 16 }}>
                <StackPanel stack={currentStep.stack} />
              </div>
            )}
          </>
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