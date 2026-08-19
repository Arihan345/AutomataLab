export function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="panel" style={style}>{children}</div>;
}

export function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '0 0 14px', fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
      {children}
    </p>
  );
}