import { useState, useEffect } from 'react';
import { parseGrammar } from '../lib/parseGrammar';
import { cykParse } from '../lib/cyk';
import InteractiveParseTree from './InteractiveParseTree';
import CYKTableViewer from './CYKTableViewer';
import { DerivationInspector } from './DerivationInspector';
import { ControlBar, ControlGroup } from './ui/ControlBar';
import { GrammarPopover } from './ui/GrammarPopover';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { EmptyState, Badge } from './ui/Composite';
import { saveAutomaton, listAutomata, loadAutomaton } from '../lib/api';
import { useFocus } from '../context/FocusContext';
import type { CFG } from '../types/cfg';

export default function CFGPage() {
  const { focused, toggle } = useFocus();
  const [grammarText, setGrammarText] = useState('S -> AB | a\nA -> a\nB -> b');
  const [grammarError, setGrammarError] = useState<string | null>(null);
  const [cfg, setCfg] = useState<CFG | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof cykParse> | null>(null);

  const [savedItems, setSavedItems] = useState<{ id: number; name: string }[]>([]);
  const [selectedSaved, setSelectedSaved] = useState('');
  const [saveName, setSaveName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  async function refreshSaved() {
    const list = await listAutomata();
    setSavedItems(list.filter((i: any) => i.type === 'cfg'));
  }
  useEffect(() => { refreshSaved(); }, []);

  function handleBuild() {
    try {
      const built = parseGrammar(grammarText, 1, 'My Grammar', 'CNF');
      setCfg(built);
      setGrammarError(null);
      setResult(null);
    } catch (e) {
      setGrammarError(e instanceof Error ? e.message : 'Failed to parse grammar');
    }
  }

  function handleRun() {
    if (!cfg || !input.trim()) return;
    setResult(cykParse(cfg, input));
  }

  async function handleSave() {
    if (!cfg || !saveName.trim()) return;
    await saveAutomaton('cfg', saveName, '', cfg);
    setSaveName('');
    setMenuOpen(false);
    refreshSaved();
  }

  async function handleLoadSaved(id: string) {
    setSelectedSaved(id);
    if (!id) return;
    const record = await loadAutomaton(Number(id));
    setCfg(record.data);
    const grouped = record.data.productions.reduce((acc: Record<string, string[]>, p: any) => {
      acc[p.left] = [...(acc[p.left] || []), p.right.join('')];
      return acc;
    }, {});
    setGrammarText(Object.entries(grouped).map(([left, rights]) => `${left} -> ${(rights as string[]).join(' | ')}`).join('\n'));
    setResult(null);
  }

  const nonTerminalCount = cfg?.variables.length ?? 0;
  const terminalCount = cfg?.terminals.length ?? 0;
  const productionCount = cfg?.productions.length ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {!focused && (
        <ControlBar>
          <ControlGroup label="Grammar">
            <GrammarPopover text={grammarText} onChange={setGrammarText} onBuild={handleBuild} error={grammarError} />
          </ControlGroup>

          <ControlGroup label="Saved">
            <Select value={selectedSaved} onChange={(e) => handleLoadSaved(e.target.value)} style={{ width: 150 }}>
              <option value="">{savedItems.length ? 'Select...' : 'None saved'}</option>
              {savedItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </Select>
          </ControlGroup>

          <ControlGroup label="Test string">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. ab" style={{ width: 130 }} disabled={!cfg} />
          </ControlGroup>

          <div style={{ paddingTop: 16 }}>
            <Button onClick={handleRun} disabled={!cfg || !input.trim()}>▶ Run CYK</Button>
          </div>

          {result && (
            <div style={{ paddingTop: 15 }}>
              <Badge tone={result.accepted ? 'success' : 'danger'}>{result.accepted ? 'Accepted' : 'Rejected'}</Badge>
            </div>
          )}

          {cfg && (
            <span style={{ marginLeft: 12, paddingTop: 17, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>
              {nonTerminalCount} nonterminals · {terminalCount} terminals · {productionCount} productions
            </span>
          )}

          <div style={{ paddingTop: 16 }}>
            <Button variant="ghost" size="sm" onClick={toggle}>⛶ Focus</Button>
          </div>

          <div style={{ marginLeft: 'auto', paddingTop: 15, position: 'relative' }}>
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen((s) => !s)} disabled={!cfg}>⋯</Button>
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

      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {!cfg ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState icon="⌂" title="No grammar loaded" desc="Open the Grammar control to define one and click Build." />
          </div>
        ) : !result ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState icon="▶" title="Ready to parse" desc="Enter a test string above and run CYK." />
          </div>
        ) : result.accepted && result.tree ? (
          <>
            <div style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
              <InteractiveParseTree tree={result.tree} />
            </div>
            <div style={{ minHeight: 0, overflowY: 'auto' }}>
              <DerivationInspector cfg={cfg} accepted={result.accepted} input={input} />
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState icon="✕" title="Rejected" desc="No derivation from the start symbol was found. Check the CYK table below." />
          </div>
        )}
      </div>

      {result && !focused && (
        <div
          style={{
            height: 200,
            minHeight: 0,
            flexShrink: 0,
            borderTop: '1px solid var(--border)',
            overflow: 'hidden',
            background: 'var(--bg-elevated)',
          }}
        >
          <div style={{ padding: '8px 16px 0' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
              CYK TABLE — STRING: "{input}"
            </p>
          </div>
          <div className="cyk-scroll" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
            <CYKTableViewer table={result.table} input={input} />
          </div>
        </div>
      )}
    </div>
  );
}