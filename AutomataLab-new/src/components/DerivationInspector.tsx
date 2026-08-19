import type { CFG } from '../types/cfg';

export function DerivationInspector({ cfg, accepted, input }: { cfg: CFG; accepted: boolean; input: string }) {
  return (
    <div style={{ width: 240, borderLeft: '1px solid var(--border)', padding: 20, flexShrink: 0 }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        Productions
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
        {cfg.productions.map((p, i) => (
          <p key={i} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
            <span style={{ color: 'var(--violet)' }}>{p.left}</span> → {p.right.join('')}
          </p>
        ))}
      </div>

      <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        Match
      </p>
      <div
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
          fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 600,
          background: accepted ? 'var(--teal-soft)' : 'var(--rose-soft)',
          color: accepted ? 'var(--teal)' : 'var(--rose)',
          border: `1px solid ${accepted ? 'var(--teal)' : 'var(--rose)'}`,
        }}
      >
        {accepted ? '✓' : '✕'} "{input}"
      </div>
    </div>
  );
}