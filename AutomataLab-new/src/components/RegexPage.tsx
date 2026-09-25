import { useState, useEffect } from 'react';
import DFAViewer from './DFAViewer';
import NFAViewer from './NFAViewer';
import { StateInspector } from './StateInspector';
import { ParserState, parseUnion } from '../lib/regexParser';
import { buildNFAFromRegexNode, fragmenttoNFA } from '../lib/thompsonConstruction';
import { subsetConstruction } from '../lib/subsetConstruction';
import { minimizeDFA } from '../lib/minimizeDFA';
import { relabelDFA } from '../lib/relabelDFA';
import { simulateDFA } from '../lib/simulate';
import { saveAutomaton, listAutomata, loadAutomaton } from '../lib/api';
import { ControlBar, ControlGroup } from './ui/ControlBar';
import { PipelineStepper } from './ui/PipelineStepper';
import { PartitionStepViewer } from './PartitionStepViewer';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button, Spinner } from './ui/Button';
import { EmptyState, Badge } from './ui/Composite';
import { useFocus } from '../context/FocusContext';
import type { NFA } from '../types/automaton';

const STAGES = ['NFA', 'Derived DFA', 'Minimal DFA'] as const;
type Stage = (typeof STAGES)[number];

export default function RegexPage() {
  const { focused, toggle } = useFocus();
  const [regexText, setRegexText] = useState('a(b|c)*d');
  const [regexError, setRegexError] = useState<string | null>(null);
  const [nfa, setNfa] = useState<NFA | null>(null);
  const [stage, setStage] = useState<Stage>('NFA');
  const [testInput, setTestInput] = useState('');
  const [result, setResult] = useState<{ path: string[]; accepted: boolean } | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [inspectedState, setInspectedState] = useState<string | null>(null);
  const [showPartitionSteps, setShowPartitionSteps] = useState(false);

  const [savedItems, setSavedItems] = useState<{ id: number; name: string }[]>([]);
  const [selectedSaved, setSelectedSaved] = useState('');
  const [saveName, setSaveName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const rawDerivedDfa = nfa ? subsetConstruction(nfa, 2, 'Derived DFA', '') : null;
  const relabeled = rawDerivedDfa ? relabelDFA(rawDerivedDfa) : null;
  const derivedDfa = relabeled?.dfa ?? null;
  const derivedSubsetMap = relabeled?.subsetMap ?? {};
  const minimizeResult = derivedDfa ? minimizeDFA(derivedDfa, 3, 'Minimal DFA', '') : null;
  const minimizedDfa = minimizeResult?.dfa ?? null;
  const minimizeHistory = minimizeResult?.history ?? [];

  async function refreshSaved() {
    const list = await listAutomata();
    setSavedItems(list.filter((i: any) => i.type === 'nfa'));
  }
  useEffect(() => { refreshSaved(); }, []);

  function handleBuild() {
    try {
      const state = new ParserState(regexText);
      const tree = parseUnion(state);
      const fragment = buildNFAFromRegexNode(tree);
      const built = fragmenttoNFA(fragment, 1, regexText, `NFA from ${regexText}`);
      setNfa(built);
      setRegexError(null);
      setResult(null);
      setStage('NFA');
      setInspectedState(null);
    } catch (e) {
      setRegexError(e instanceof Error ? e.message : 'Failed to parse regex');
    }
  }

  function handleRun() {
    if (!minimizedDfa || !testInput.trim()) return;
    setResult(simulateDFA(minimizedDfa, testInput));
    setStepIndex(0);
  }

  async function handleSave() {
    if (!nfa || !saveName.trim()) return;
    setSaving(true);
    try {
      await saveAutomaton('nfa', saveName, '', nfa);
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
      setNfa(record.data);
      setRegexText(record.data.name || '');
      setResult(null);
      setStage('NFA');
      setInspectedState(null);
      setMenuOpen(false);
    } finally {
      setLoadingSaved(false);
    }
  }

  function handleStageChange(s: Stage) {
    setStage(s);
    setInspectedState(null);
    setShowPartitionSteps(false);
  }

  const currentState = result?.path[stepIndex];
  const consumedSymbols = result ? [...testInput] : [];
  const activeTransition = result && stepIndex > 0
    ? { from: result.path[stepIndex - 1], symbol: consumedSymbols[stepIndex - 1] }
    : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {!focused && (
        <ControlBar>
          <ControlGroup label="Regex">
            <Input value={regexText} onChange={(e) => setRegexText(e.target.value)} placeholder="a(b|c)*d" style={{ width: 150 }} />
          </ControlGroup>
          <div style={{ paddingTop: 16 }}>
            <Button onClick={handleBuild} disabled={!regexText.trim()}>Build NFA</Button>
          </div>

          <ControlGroup label="Saved">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Select value={selectedSaved} onChange={(e) => handleLoadSaved(e.target.value)} disabled={loadingSaved} style={{ width: 150 }}>
                <option value="">{savedItems.length ? 'Select...' : 'None saved'}</option>
                {savedItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </Select>
              {loadingSaved && <Spinner />}
            </div>
          </ControlGroup>

          {nfa && (
            <ControlGroup label="Pipeline">
              <PipelineStepper current={stage} onChange={handleStageChange} disabled={false} />
            </ControlGroup>
          )}

          {minimizedDfa && (
            <>
              <ControlGroup label="Test string">
                <Input value={testInput} onChange={(e) => setTestInput(e.target.value)} placeholder="e.g. abcbd" style={{ width: 130 }} />
              </ControlGroup>
              <div style={{ paddingTop: 16 }}>
                <Button onClick={handleRun} disabled={!testInput.trim()}>▶ Run</Button>
              </div>
            </>
          )}

          {result && (
            <div style={{ paddingTop: 15 }}>
              <Badge tone={result.accepted ? 'success' : 'danger'}>{result.accepted ? 'Accepted' : 'Rejected'}</Badge>
            </div>
          )}

          <div style={{ paddingTop: 16 }}>
            <Button variant="ghost" size="sm" onClick={toggle}>⛶ Focus</Button>
          </div>

          <div style={{ marginLeft: 'auto', paddingTop: 15, position: 'relative' }}>
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen((s) => !s)} disabled={!nfa}>⋯</Button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: 12, width: 220, zIndex: 20 }}>
                <p style={{ fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Save current</p>
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

      {regexError && !focused && (
        <div style={{ padding: '8px 20px', color: 'var(--rose)', fontSize: 12.5, fontFamily: 'var(--mono)' }}>{regexError}</div>
      )}

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {!nfa ? (
            <EmptyState icon="⌁" title="No NFA built" desc="Enter a regex and click Build NFA." />
          ) : stage === 'NFA' ? (
            <NFAViewer key={nfa.name + '-' + nfa.states.length} nfa={nfa} />
          ) : stage === 'Derived DFA' && derivedDfa ? (
            <DFAViewer key={derivedDfa.name + '-' + derivedDfa.states.length} dfa={derivedDfa} onStateClick={setInspectedState} />
          ) : minimizedDfa ? (
            <DFAViewer
              key={minimizedDfa.name + '-' + minimizedDfa.states.length}
              dfa={minimizedDfa}
              currentState={currentState}
              activeTransition={activeTransition}
            />
          ) : null}

          {inspectedState && stage === 'Derived DFA' && derivedDfa && (
            <StateInspector stateId={inspectedState} dfa={derivedDfa} subsetMap={derivedSubsetMap} onClose={() => setInspectedState(null)} />
          )}

          {stage === 'Minimal DFA' && minimizedDfa && (
            <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 10 }}>
              <Button variant="ghost" size="sm" onClick={() => setShowPartitionSteps((s) => !s)}>
                {showPartitionSteps ? 'Hide' : 'Show'} Partition Steps
              </Button>
            </div>
          )}
        </div>

        {stage === 'Minimal DFA' && minimizedDfa && showPartitionSteps && (
          <div style={{ flexShrink: 0, maxHeight: 260, overflowY: 'auto', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <PartitionStepViewer history={minimizeHistory} />
          </div>
        )}
      </div>

      {result && !focused && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px 24px', background: 'var(--bg-elevated)' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.06em', marginBottom: 14 }}>
            SIMULATION (Minimal DFA)
          </p>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {result.path.map((state, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => { setStepIndex(i); setStage('Minimal DFA'); }}
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
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: i === stepIndex ? 'var(--violet)' : 'var(--text-3)', margin: '0 4px', fontWeight: i === stepIndex ? 700 : 500, opacity: i < stepIndex ? 0.55 : 1 }}>
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
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Current Step</p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--violet)', fontWeight: 700, margin: 0 }}>
                    {result.path[stepIndex]} —{consumedSymbols[stepIndex]}→ {result.path[stepIndex + 1]}
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Input</p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--text-1)', fontWeight: 600, margin: 0 }}>{consumedSymbols[stepIndex]}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Action</p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-1)', margin: 0 }}>
                    Read '{consumedSymbols[stepIndex]}' → {result.path[stepIndex] === result.path[stepIndex + 1] ? `remain in ${result.path[stepIndex + 1]}` : `move to ${result.path[stepIndex + 1]}`}
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