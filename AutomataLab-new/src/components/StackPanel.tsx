export default function StackPanel({ stack }: { stack: string[] }) {
  return (
    <div className="panel" style={{ width: 120 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 12, color: '#ffb454', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Stack
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2 }}>
        {stack.length === 0 && (
          <p style={{ fontSize: 12, color: '#6b7280', fontFamily: "'JetBrains Mono', monospace" }}>empty</p>
        )}
        {stack.map((symbol, i) => (
          <div
            key={i}
            style={{
              border: `1px solid ${i === stack.length - 1 ? '#ffb454' : '#262a31'}`,
              borderRadius: 4,
              padding: '6px 8px',
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              color: i === stack.length - 1 ? '#ffb454' : '#e8eaed',
              background: i === stack.length - 1 ? 'rgba(255,180,84,0.06)' : 'transparent',
            }}
          >
            {symbol}
          </div>
        ))}
      </div>
    </div>
  );
}