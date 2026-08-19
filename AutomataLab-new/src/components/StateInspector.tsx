import type { DFA } from '../types/automaton';
import type { SubsetMap } from '../lib/relabelDFA';

export function StateInspector({
  stateId,
  dfa,
  subsetMap,
  onClose,
}: {
  stateId: string;
  dfa: DFA;
  subsetMap: SubsetMap;
  onClose: () => void;
}) {
  const subset = subsetMap[stateId] ?? [];
  const transitions = dfa.transitions[stateId] ?? {};

  return (
    <div
      style={{
        position: 'absolute', top: 50, right: 16, zIndex: 6, width: 220,
        background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 8,
        padding: 14, boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--violet)', margin: 0 }}>State {stateId}</p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 13, padding: 0 }}>✕</button>
      </div>
      <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>NFA subset</p>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-1)', margin: '0 0 12px', wordBreak: 'break-word' }}>
        {'{' + subset.join(', ') + '}'}
      </p>
      <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Transitions</p>
      {Object.entries(transitions).length === 0 ? (
        <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>none</p>
      ) : (
        Object.entries(transitions).map(([symbol, target]) => (
          <p key={symbol} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)', margin: '2px 0' }}>
            {symbol} → <span style={{ color: 'var(--text-1)' }}>{target}</span>
          </p>
        ))
      )}
    </div>
  );
}