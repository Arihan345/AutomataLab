import { useState } from 'react';

export function Tabs({ tabs }: { tabs: { label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className="secondary"
            style={{
              border: 'none',
              borderBottom: active === i ? '2px solid var(--violet)' : '2px solid transparent',
              borderRadius: 0,
              background: 'transparent',
              color: active === i ? 'var(--text-1)' : 'var(--text-2)',
              padding: '10px 16px',
              fontSize: 13,
              textTransform: 'none',
              letterSpacing: 0,
              fontFamily: 'var(--sans)',
              fontWeight: active === i ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ animation: 'fadeUp 0.25s ease' }}>{tabs[active].content}</div>
    </div>
  );
}