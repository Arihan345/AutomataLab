import { useState } from 'react';

export function BottomInspector({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
      <div style={{ display: 'flex', gap: 2, padding: '0 20px' }}>
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              borderTop: active === i ? '2px solid var(--violet)' : '2px solid transparent',
              color: active === i ? 'var(--text-1)' : 'var(--text-2)',
              padding: '10px 12px', fontSize: 12.5, fontFamily: 'var(--sans)',
              fontWeight: active === i ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ maxHeight: 260, overflow: 'auto' }}>{tabs[active].content}</div>
    </div>
  );
}