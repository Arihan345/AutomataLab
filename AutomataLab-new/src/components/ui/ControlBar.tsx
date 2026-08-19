export function ControlBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(8,8,12,0.85)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </div>
  );
}

export function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'var(--mono)' }}>
        {label}
      </span>
      {children}
    </div>
  );
}