export function PageHeader({ eyebrow, title, desc, accent }: { eyebrow: string; title: string; desc: string; accent: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: accent, margin: '0 0 8px', letterSpacing: '0.08em' }}>{eyebrow}</p>
      <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>{title}</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0, maxWidth: 560 }}>{desc}</p>
    </div>
  );
}