import { useState, useEffect } from 'react';
import DFAViewer from './DFAViewer';
import DFABuilder from './DFABuilder';
import { simulateDFA } from '../lib/simulate';
import { saveAutomaton, listAutomata, loadAutomaton } from '../lib/api';
import { ControlBar, ControlGroup } from './ui/ControlBar';
import { JsonPopover } from './ui/JsonPopover';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button, Spinner } from './ui/Button';
import { EmptyState, Badge } from './ui/Composite';
import { useFocus } from '../context/FocusContext';
import type { DFA } from '../types/automaton';

const BLANK_DFA: DFA = {
  id: 0,
  name: 'Untitled DFA',
  description: '',
  states: [],
  alphabet: [],
  transitions: {},
  startState: '',
  acceptStates: [],
};

export default function DFAPage() {
  const { focused, toggle } = useFocus();
  const [mode, setMode] = useState<'simulate' | 'build'>('simulate');
  const [text, setText] = useState('');
  const [textError, setTextError] = useState<string | null>(null);
  const [dfa, setDfa] = useState<DFA | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ path: string[]; accepted: boolean } | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [savedItems, setSavedItems] = useState<{ id: number; name: string }[]>([]);
  const [selectedSaved, setSelectedSaved] = useState('');
  const [saveName, setSaveName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

  async function refreshSaved() {
    const list = await listAutomata();
    setSavedItems(list.filter((i: any) => i.type === 'dfa'));
  }
  useEffect(() => { refreshSaved(); }, []);

  function handleBuild() {
    try {
      setDfa(JSON.parse(text));
      setTextError(null);
      setResult(null);
    } catch {
      setTextError('Invalid JSON.');
    }
  }

  function handleRun() {
    if (!dfa || !input.trim()) return;
    setResult(simulateDFA(dfa, input));
    setStepIndex(0);
  }

  async function handleSave() {
    if (!dfa || !saveName.trim()) return;
    setSaving(true);
    try {
      await saveAutomaton('dfa', saveName, '', dfa);
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
      setDfa(record.data);
      setText(JSON.stringify(record.data, null, 2));
      setResult(null);
    } finally {
      setLoadingSaved(false);
    }
  }

  const currentState = result?.path[stepIndex];
  const consumedSymbols = result ? [...input] : [];
  const activeTransition = result && stepIndex > 0
    ? { from: result.path[stepIndex - 1], symbol: consumedSymbols[stepIndex - 1] }
    : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {!focused && (
        <ControlBar>
          <ControlGroup label="Mode">
            <div style={{ display: 'flex', gap: 4 }}>
              <Button size="sm" variant={mode === 'build' ? 'primary' : 'secondary'} onClick={() => setMode('build')}>
                ✎ Build
              </Button>
              <Button size="sm" variant={mode === 'simulate' ? 'primary' : 'secondary'} onClick={() => setMode('simulate')}>
                ▶ Simulate
              </Button>
            </div>
          </ControlGroup>

          <ControlGroup label="DFA">
            <JsonPopover label={dfa ? 'Loaded ▾' : 'Load JSON'} text={text} onChange={setText} onBuild={handleBuild} error={textError} />
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

          {mode === 'simulate' && (
            <>
              <ControlGroup label="Test string">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. aba" style={{ width: 130 }} disabled={!dfa} />
              </ControlGroup>

              <div style={{ paddingTop: 16 }}>
                <Button onClick={handleRun} disabled={!dfa || !input.trim()}>▶ Run</Button>
              </div>

              {result && (
                <div style={{ paddingTop: 15 }}>
                  <Badge tone={result.accepted ? 'success' : 'danger'}>{result.accepted ? 'Accepted' : 'Rejected'}</Badge>
                </div>
              )}
            </>
          )}

          <div style={{ paddingTop: 16 }}>
            <Button variant="ghost" size="sm" onClick={toggle}>⛶ Focus</Button>
          </div>

          <div style={{ marginLeft: 'auto', paddingTop: 15, position: 'relative' }}>
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen((s) => !s)} disabled={!dfa}>⋯</Button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: 12, width: 220, zIndex: 20 }}>
                <p style={{ fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Save current</p>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
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

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {mode === 'build' ? (
          <DFABuilder
            dfa={dfa ?? BLANK_DFA}
            onChange={(next) => {
              setDfa(next);
              setText(JSON.stringify(next, null, 2));
              setResult(null);
            }}
          />
        ) : !dfa ? (
          <EmptyState icon="⌂" title="No DFA loaded" desc="Open the DFA control to paste a definition, or switch to Build mode." />
        ) : (
          <DFAViewer dfa={dfa} currentState={currentState} activeTransition={activeTransition} />
        )}
      </div>

      {mode === 'simulate' && result && !focused && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px 24px', background: 'var(--bg-elevated)' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.06em', marginBottom: 14 }}>SIMULATION</p>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {result.path.map((state, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setStepIndex(i)}
                  style={{
                    fontFamily: 'var(--mono)', fontSize: 13, padding: '6px 12px', borderRadius: 6,
                    border: `1px solid ${i === stepIndex ? 'var(--violet)' : 'var(--border)'}`,
                    background: i === stepIndex ? 'var(--violet-soft)' : 'transparent',
                    color: i === stepIndex ? 'var(--text-1)' : 'var(--text-2)',
                    cursor: 'pointer',
                    opacity: i < stepIndex ? 0.55 : 1,
                    boxShadow: i === stepIndex ? '0 0 0 3px var(--violet-soft)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {state}
                </button>
                {i < result.path.length - 1 && (
                  <span
                    style={{
                      fontFamily: 'var(--mono)', fontSize: 12,
                      color: i === stepIndex ? 'var(--violet)' : 'var(--text-3)',
                      margin: '0 4px',
                      fontWeight: i === stepIndex ? 700 : 500,
                      opacity: i < stepIndex ? 0.55 : 1,
                    }}
                  >
                    —{consumedSymbols[i]}→
                  </span>
                )}
              </div>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              <Button size="sm" variant="secondary" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>◀</Button>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)' }}>{stepIndex + 1} / {result.path.length}</span>
              <Button size="sm" variant="secondary" disabled={stepIndex >= result.path.length - 1} onClick={() => setStepIndex((i) => i + 1)}>▶</Button>
            </div>
          </div>
          {stepIndex < consumedSymbols.length && (
            <div style={{ marginTop: 14, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                    Current Step
                  </p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--violet)', fontWeight: 700, margin: 0 }}>
                    {result.path[stepIndex]} —{consumedSymbols[stepIndex]}→ {result.path[stepIndex + 1]}
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                    Input
                  </p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text-1)', fontWeight: 600, margin: 0 }}>
                    {consumedSymbols[stepIndex]}
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                    Action
                  </p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-1)', margin: 0 }}>
                    Read '{consumedSymbols[stepIndex]}' →{' '}
                    {result.path[stepIndex] === result.path[stepIndex + 1]
                      ? `remain in ${result.path[stepIndex + 1]}`
                      : `move to ${result.path[stepIndex + 1]}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}