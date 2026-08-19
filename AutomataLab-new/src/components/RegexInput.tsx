import { useState } from 'react';
import { ParserState, parseUnion } from '../lib/regexParser';
import { buildNFAFromRegexNode, fragmenttoNFA } from '../lib/thompsonConstruction';
import type { NFA } from '../types/automaton';

export default function RegexInput({ onSubmit }: { onSubmit: (nfa: NFA) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    try {
      const state = new ParserState(text);
      const tree = parseUnion(state);
      const fragment = buildNFAFromRegexNode(tree);
      const nfa = fragmenttoNFA(fragment, 1, text, `NFA generated from regex: ${text}`);
      onSubmit(nfa);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse regex');
    }
  }

  return (
    <div className="panel">
      <h4 style={{ margin: '0 0 12px', fontSize: 13, color: '#ffb454', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Regex Input
      </h4>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. a(b|c)*d"
          style={{ flex: 1 }}
        />
        <button onClick={handleSubmit}>Build NFA</button>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{error}</p>}
    </div>
  );
}