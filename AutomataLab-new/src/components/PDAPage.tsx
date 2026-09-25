import { useState, useEffect } from 'react';
import PDAViewer from './PDAViewer';
import StackPanel from './StackPanel';
import { simulatePDA } from '../lib/simulatePDA';
import { saveAutomaton, listAutomata, loadAutomaton } from '../lib/api';
import { ControlBar, ControlGroup } from './ui/ControlBar';
import { JsonPopover } from './ui/JsonPopover';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button, Spinner } from './ui/Button';
import { EmptyState, Badge } from './ui/Composite';
import { useFocus } from '../context/FocusContext';
import type { PDA } from '../types/pda';
import { EPSILON_PDA } from '../types/pda';

export default function PDAPage() {
  const { focused, toggle } = useFocus();
  const [text, setText] = useState('');
  const [textError, setTextError] = useState<string | null>(null);
  const [pda, setPda] = useState<PDA | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof simulatePDA> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [savedItems, setSavedItems] = useState<{ id: number; name: string }[]>([]);
  const [selectedSaved, setSelectedSaved] = useState('');
  const [saveName, setSaveName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

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
    setSaving(true);
    try {
      await saveAutomaton('pda', saveName, '', pda);
      setSaveName('');
      setMenuOpen(false);
      await refreshSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleLoadSaved(id: string) {
    setSelectedSaved(id);
    if (!id) return;
    setLoadingSaved(true);
    try {
      const record = await loadAutomaton(Number(id));
      setPda(record.data);
      setText(JSON.stringify(record.data, null, 2));
      setResult(null);
    } finally {
      setLoadingSaved(false);
    }
  }

  const currentStep = result?.steps[stepIndex];
  const prevStep = stepIndex > 0 ? result?.steps[stepIndex - 1] : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {!focused && (
        <ControlBar>
          <ControlGroup label="PDA">
            <JsonPopover label={pda ? 'Loaded ▾' : 'Load PDA JSON'} text={text} onChange={setText} onBuild={handleBuild} error={textError} />
          </ControlGroup>

          <ControlGroup label="Saved">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Select value={selectedSaved} onChange={(e) => handleLoadSaved(e.target.value)} disabled={loadingSaved} style={{ width: 150 }}>
                <option value="">{savedItems.length ? 'Select...' : 'None saved'}</option>
                {savedItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </Select>
              {loadingSaved && <Spinner />}
            </div>
          </ControlGroup>

          <ControlGroup label="Test string">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. ()" style={{ width: 130 }} disabled={!pda} />
          </ControlGroup>

          <div style={{ paddingTop: 16 }}>
            <Button onClick={handleRun} disabled={!pda || !input.trim()}>▶ Run</Button>
          </div>

          {result && (
            <div style={{ paddingTop: 15 }}>
              <Badge tone={result.accepted ? 'success' : 'danger'}>{result.accepted ? 'Accepted' : 'Rejected'}</Badge>
            </div>
          )}

          <div style={{ paddingTop: 16 }}>
            <Button variant="ghost" size="sm" onClick={toggle}>⛶ Focus</Button>
          </div>

          <div style={{ marginLeft: 'auto', paddingTop: 15, position: 'relative' }}>
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen((s) => !s)} disabled={!pda}>⋯</Button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: 12, width: 200, zIndex: 20 }}>
                <p style={{ fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Save as</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Name..." style={{ flex: 1 }} />
                  <Button size="sm" onClick={handleSave} loading={saving} disabled={!saveName.trim() || saving}>Save</Button>
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

      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {!pda ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState icon="⌂" title="No PDA loaded" desc="Open the PDA control to paste a definition, or load a saved one." />
          </div>
        ) : (
          <>
            <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
              <PDAViewer pda={pda} />
            </div>
            {currentStep && (
              <div style={{ borderLeft: '1px solid var(--border)', padding: '16px 20px', minHeight: 0, overflowY: 'auto', background: 'var(--bg-elevated)' }}>
                <StackPanel stack={currentStep.stack} />
              </div>
            )}
          </>
        )}
      </div>

      {result && !focused && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px', background: 'var(--bg-elevated)', flexShrink: 0 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.06em', marginBottom: 12 }}>SIMULATION</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Button size="sm" variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>◀</Button>
              <Button size="sm" variant="secondary" disabled={stepIndex >= result.steps.length - 1} onClick={() => setStepIndex((i) => i + 1)}>▶</Button>
            </div>
            {[
              { label: 'Input', value: input },
              { label: 'State', value: currentStep?.state, accent: true },
              { label: 'Stack', value: currentStep?.stack.join('') || 'empty' },
              { label: 'Step', value: `${stepIndex + 1} / ${result.steps.length}` },
            ].map(({ label, value, accent }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: accent ? 'var(--violet)' : 'var(--text-1)', fontWeight: accent ? 700 : 500 }}>{value}</span>
              </div>
            ))}
          </div>
          {currentStep && (() => {
            if (prevStep) {
              const consumed = currentStep.inputIndex > prevStep.inputIndex;
              const symbol = consumed ? input[prevStep.inputIndex] : EPSILON_PDA;
              const prevTop = prevStep.stack[prevStep.stack.length - 1] ?? 'empty';
              const pushed = currentStep.stack.slice(prevStep.stack.length - 1);
              return (
                <div style={{ marginTop: 14, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                        Current Step
                      </p>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--violet)', fontWeight: 700, margin: 0 }}>
                        {prevStep.state} —{symbol}→ {currentStep.state}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                        Input
                      </p>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text-1)', fontWeight: 600, margin: 0 }}>
                        {consumed ? symbol : 'ε (no symbol consumed)'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                        Action
                      </p>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-1)', margin: 0 }}>
                        Pop '{prevTop}' → push '{pushed.join('') || '∅'}'
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // Step 0 with no prior step: the initial configuration. Still
            // worth explaining, especially when the simulation halted here
            // immediately (e.g. no valid transition existed at all).
            //
            // `result.steps.length === 1` is NOT a reliable signal for this:
            // simulatePDA's backtracking search can explore an epsilon
            // branch that consumes no input before dead-ending, which
            // produces a 2-step (or longer) trace that still made no real
            // progress on the input string. What actually matters is
            // whether any input was ever consumed — i.e. whether the final
            // recorded inputIndex is still 0. A genuine multi-step
            // rejection (several real symbols consumed before getting
            // stuck) always has a final inputIndex > 0, so this correctly
            // tells the two cases apart.
            const stackTop = currentStep.stack[currentStep.stack.length - 1] ?? 'empty';
            const madeProgress = result.steps[result.steps.length - 1].inputIndex > 0;
            const haltedImmediately = !result.accepted && !madeProgress;
            return (
              <div style={{ marginTop: 14, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                      Current Step
                    </p>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--violet)', fontWeight: 700, margin: 0 }}>
                      Start: {currentStep.state}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                      Stack Top
                    </p>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text-1)', fontWeight: 600, margin: 0 }}>
                      {stackTop}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                      Action
                    </p>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-1)', margin: 0 }}>
                      {haltedImmediately
                        ? 'No valid transition was found from this configuration — the simulation halted immediately.'
                        : 'Simulation begins here.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}