import { useState, useEffect } from 'react';
import TapeViewer from './TapeViewer';
import { simulateTM } from '../lib/simulateTM';
import { saveAutomaton, listAutomata, loadAutomaton } from '../lib/api';
import { ControlBar, ControlGroup } from './ui/ControlBar';
import { JsonPopover } from './ui/JsonPopover';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { EmptyState, Badge } from './ui/Composite';
import { useFocus } from '../context/FocusContext';
import type { TM } from '../types/tm';

export default function TMPage() {
  const { focused, toggle } = useFocus();
  const [text, setText] = useState('');
  const [textError, setTextError] = useState<string | null>(null);
  const [tm, setTm] = useState<TM | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof simulateTM> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [savedItems, setSavedItems] = useState<{ id: number; name: string }[]>([]);
  const [selectedSaved, setSelectedSaved] = useState('');
  const [saveName, setSaveName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {!focused && (
        <ControlBar>
          <ControlGroup label="Machine">
            <JsonPopover label={tm ? 'Loaded ▾' : 'Load TM JSON'} text={text} onChange={setText} onBuild={handleBuild} error={textError} />
          </ControlGroup>

          <ControlGroup label="Saved">
            <Select value={selectedSaved} onChange={(e) => handleLoadSaved(e.target.value)} style={{ width: 150 }}>
              <option value="">{savedItems.length ? 'Select...' : 'None saved'}</option>
              {savedItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </Select>
          </ControlGroup>

          <ControlGroup label="Tape input">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. 11" style={{ width: 130 }} disabled={!tm} />
          </ControlGroup>

          <div style={{ paddingTop: 16 }}>
            <Button onClick={handleRun} disabled={!tm || !input.trim()}>▶ Run</Button>
          </div>

          {result && (
            <div style={{ paddingTop: 15 }}>
              <Badge tone={result.accepted ? 'success' : 'danger'}>
                {result.accepted ? 'Accepted' : result.halted ? 'Rejected' : 'Step limit reached'}
              </Badge>
            </div>
          )}

          <div style={{ paddingTop: 16 }}>
            <Button variant="ghost" size="sm" onClick={toggle}>⛶ Focus</Button>
          </div>

          <div style={{ marginLeft: 'auto', paddingTop: 15, position: 'relative' }}>
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen((s) => !s)} disabled={!tm}>⋯</Button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: 12, width: 200, zIndex: 20 }}>
                <p style={{ fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Save as</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Name..." style={{ flex: 1 }} />
                  <Button size="sm" onClick={handleSave} disabled={!saveName.trim()}>Save</Button>
                </div>
              </div>
            )}
          </div>
        </ControlBar>
      )}

      {focused && (
        <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 30 }}>
          <Button variant="secondary" size="sm" onClick={toggle}>Esc · Exit Focus</Button>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
        {!tm ? (
          <EmptyState icon="⌂" title="No Turing Machine loaded" desc="Open the Machine control to paste a definition, or load a saved one." />
        ) : currentStep ? (
          <TapeViewer tape={currentStep.tape} headPosition={currentStep.headPosition} />
        ) : (
          <EmptyState icon="▶" title="Ready" desc="Enter tape input above and run." />
        )}
      </div>

      {result && !focused && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', background: 'var(--bg-elevated)', flexShrink: 0 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.06em', marginBottom: 10 }}>SIMULATION</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button size="sm" variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>◀</Button>
            <Button size="sm" variant="secondary" disabled={stepIndex >= result.steps.length - 1} onClick={() => setStepIndex((i) => i + 1)}>▶</Button>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)' }}>
              Step {stepIndex + 1} / {result.steps.length} · state:{' '}
              <span style={{ color: 'var(--violet)', fontWeight: 700 }}>{currentStep?.state}</span>
            </span>
          </div>
          {stepIndex > 0 && currentStep && (
            <div style={{ marginTop: 14, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                Current Step
              </p>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--violet)', fontWeight: 700, margin: 0 }}>
                Head at position {currentStep.headPosition}, reading '{currentStep.tape[currentStep.headPosition]}'
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}