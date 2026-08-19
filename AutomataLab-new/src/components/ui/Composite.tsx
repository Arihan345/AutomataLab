import { useState } from 'react';

export function Card({ children, style, hoverable }: { children: React.ReactNode; style?: React.CSSProperties; hoverable?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-5)',
        transition: hoverable ? 'border-color 0.15s var(--ease), transform 0.15s var(--ease)' : undefined,
        ...style,
      }}
      onMouseEnter={hoverable ? (e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)'; } : undefined}
      onMouseLeave={hoverable ? (e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; } : undefined}
    >
      {children}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'danger'; children: React.ReactNode }) {
  const tones = {
    neutral: { bg: 'var(--surface-2)', fg: 'var(--text-2)', border: 'var(--border-strong)' },
    success: { bg: 'var(--teal-soft)', fg: 'var(--teal)', border: 'var(--teal)' },
    danger: { bg: 'var(--rose-soft)', fg: 'var(--rose)', border: 'var(--rose)' },
  }[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontFamily: 'var(--mono)', fontWeight: 600, background: tones.bg, color: tones.fg, border: `1px solid ${tones.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, desc }: { icon?: string; title: string; desc?: string }) {
  return (
    <div style={{ height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32, textAlign: 'center' }}>
      {icon && <div style={{ fontSize: 24, color: 'var(--text-3)', marginBottom: 4 }}>{icon}</div>}
      <p style={{ color: 'var(--text-1)', fontSize: 14, fontWeight: 500 }}>{title}</p>
      {desc && <p style={{ color: 'var(--text-2)', fontSize: 12.5, maxWidth: 260, lineHeight: 1.5 }}>{desc}</p>}
    </div>
  );
}

export function Skeleton({ height = 14, width = '100%' }: { height?: number; width?: number | string }) {
  return (
    <div style={{ height, width, borderRadius: 4, background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--overlay) 50%, var(--surface-2) 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease infinite' }} />
  );
}

export function PageHeader({ eyebrow, title, desc, accent = 'var(--violet)' }: { eyebrow: string; title: string; desc: string; accent?: string }) {
  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: accent, margin: '0 0 8px', letterSpacing: '0.08em' }}>{eyebrow}</p>
      <h1 style={{ fontSize: 26, margin: '0 0 8px' }}>{title}</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 520, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

export function Tabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', padding: '0 var(--space-4)', flexShrink: 0 }}>
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: active === i ? '2px solid var(--violet)' : '2px solid transparent', color: active === i ? 'var(--text-1)' : 'var(--text-2)', padding: '12px 10px', fontSize: 13, fontFamily: 'var(--sans)', fontWeight: active === i ? 600 : 400, marginBottom: -1 }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, animation: 'fadeUp 0.2s var(--ease)' }}>{tabs[active].content}</div>
    </div>
  );
}