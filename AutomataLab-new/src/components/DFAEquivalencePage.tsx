import { useState, useEffect } from 'react';
import { checkEquivalence } from '../lib/dfaEquivalence';
import { listAutomata, loadAutomaton } from '../lib/api';
import { PageHeader } from './ui/PageHeader';
import { Textarea } from './ui/Input';
import { Select } from './ui/Select';
import { Button, Spinner } from './ui/Button';
import { Badge } from './ui/Composite';
import type { DFA } from '../types/automaton';

function DFAInputPanel({
  label,
  text,
  onText,
  error,
  savedItems,
  onLoadSaved,
  loading,
}: {
  label: string;
  text: string;
  onText: (v: string) => void;
  error: string | null;
  savedItems: { id: number; name: string }[];
  onLoadSaved: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Select onChange={(e) => onLoadSaved(e.target.value)} defaultValue="" disabled={loading} style={{ width: 160 }}>
            <option value="">{savedItems.length ? 'Load saved…' : 'None saved'}</option>
            {savedItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
          {loading && <Spinner />}
        </div>
      </div>
      <Textarea
        value={text}
        onChange={(e) => onText(e.target.value)}
        rows={14}
        placeholder="Paste a DFA JSON definition…"
        style={{ fontSize: 12 }}
      />
      {error && <p style={{ color: 'var(--rose)', fontSize: 11.5, marginTop: 6 }}>{error}</p>}
    </div>
  );
}

export default function DFAEquivalencePage() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [dfaA, setDfaA] = useState<DFA | null>(null);
  const [dfaB, setDfaB] = useState<DFA | null>(null);
  const [savedItems, setSavedItems] = useState<{ id: number; name: string }[]>([]);
  const [result, setResult] = useState<ReturnType<typeof checkEquivalence> | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  useEffect(() => {
    listAutomata().then((list) => setSavedItems(list.filter((i: any) => i.type === 'dfa')));
  }, []);

  function parse(text: string, setDfa: (d: DFA | null) => void, setError: (e: string | null) => void) {
    if (!text.trim()) { setDfa(null); setError(null); return; }
    try {
      setDfa(JSON.parse(text));
      setError(null);
    } catch {
      setDfa(null);
      setError('Invalid JSON.');
    }
  }

  useEffect(() => { parse(textA, setDfaA, setErrorA); setResult(null); }, [textA]);
  useEffect(() => { parse(textB, setDfaB, setErrorB); setResult(null); }, [textB]);

  async function handleLoadSavedA(id: string) {
    if (!id) return;
    setLoadingA(true);
    try {
      const record = await loadAutomaton(Number(id));
      setTextA(JSON.stringify(record.data, null, 2));
    } finally {
      setLoadingA(false);
    }
  }
  async function handleLoadSavedB(id: string) {
    if (!id) return;
    setLoadingB(true);
    try {
      const record = await loadAutomaton(Number(id));
      setTextB(JSON.stringify(record.data, null, 2));
    } finally {
      setLoadingB(false);
    }
  }

  function handleCheck() {
    if (!dfaA || !dfaB) return;
    setResult(checkEquivalence(dfaA, dfaB));
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 'var(--space-7)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <PageHeader
          eyebrow="DFA TOOLS"
          title="Equivalence Checker"
          desc="Compare two DFAs for language equivalence. Both are minimized and compared via a product-automaton BFS; if they disagree, the shortest distinguishing string is returned as a counterexample."
          accent="var(--violet)"
        />

        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <DFAInputPanel label="DFA A" text={textA} onText={setTextA} error={errorA} savedItems={savedItems} onLoadSaved={handleLoadSavedA} loading={loadingA} />
          <DFAInputPanel label="DFA B" text={textB} onText={setTextB} error={errorB} savedItems={savedItems} onLoadSaved={handleLoadSavedB} loading={loadingB} />
        </div>

        <Button onClick={handleCheck} disabled={!dfaA || !dfaB}>Check Equivalence</Button>

        {result && (
          <div style={{ marginTop: 24, padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <Badge tone={result.equivalent ? 'success' : 'danger'}>
              {result.equivalent ? 'Equivalent' : 'Not Equivalent'}
            </Badge>

            {!result.equivalent && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                  Counterexample
                </p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'var(--text-1)', fontWeight: 700, margin: '0 0 8px' }}>
                  {result.counterexample === '' ? 'ε (empty string)' : `"${result.counterexample}"`}
                </p>
                <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0 }}>
                  {result.acceptedBy === 'A'
                    ? 'DFA A accepts this string; DFA B rejects it.'
                    : 'DFA B accepts this string; DFA A rejects it.'}
                </p>
              </div>
            )}

            {result.equivalent && (
              <p style={{ color: 'var(--text-2)', fontSize: 13, margin: '12px 0 0' }}>
                No distinguishing string exists — both DFAs recognize the same language.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
