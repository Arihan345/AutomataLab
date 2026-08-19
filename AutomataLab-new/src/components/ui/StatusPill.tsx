export function StatusPill({ accepted }: { accepted: boolean }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontFamily: 'var(--mono)',
        fontWeight: 600,
        background: accepted ? 'rgba(45,212,191,0.12)' : 'rgba(251,113,133,0.12)',
        color: accepted ? 'var(--teal)' : 'var(--rose)',
        border: `1px solid ${accepted ? 'var(--teal)' : 'var(--rose)'}`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {accepted ? 'Accepted' : 'Rejected'}
    </div>
  );
}