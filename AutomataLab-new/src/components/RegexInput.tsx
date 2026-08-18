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
      console.log(JSON.stringify(nfa.transitions, null, 2));  // <-- moved here
      onSubmit(nfa);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse regex');
    }
}
  return (
    <div style={{ padding: 10 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter regex, e.g. a(b|c)*d"
        style={{ width: 250 }}
      />
      <button onClick={handleSubmit}>Build NFA</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}