export function EmptyState({ icon, label }: { icon?: string; label: string }) {
  return (
    <div style={{ height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-2)', padding: 24, textAlign: 'center' }}>
      {icon && <div style={{ fontSize: 22, opacity: 0.5 }}>{icon}</div>}
      <p style={{ fontFamily: 'var(--mono)', fontSize: 13, margin: 0, maxWidth: 280 }}>{label}</p>
    </div>
  );
}