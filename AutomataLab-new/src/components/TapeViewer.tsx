export default function TapeViewer({ tape, headPosition }: { tape: string[]; headPosition: number }) {
  return (
    <div style={{ overflowX: 'auto', padding: 20 }}>
      <div style={{ display: 'flex' }}>
        {tape.map((symbol, i) => {
          const isHead = i === headPosition;
          return (
            <div
              key={i}
              style={{
                width: 52,
                height: 52,
                border: `1.5px solid ${isHead ? 'var(--violet)' : 'var(--border-strong)'}`,
                background: isHead ? 'var(--violet-soft)' : 'var(--surface)',
                boxShadow: isHead ? '0 0 10px rgba(139,124,246,0.3)' : 'none',
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--mono)',
                fontSize: 18,
                fontWeight: isHead ? 700 : 400,
                color: isHead ? 'var(--violet)' : 'var(--text-1)',
                transition: 'all 0.15s ease',
              }}
            >
              {symbol}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex' }}>
        {tape.map((_, i) => (
          <div
            key={i}
            style={{
              width: 52,
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--violet)',
              marginTop: 2,
              lineHeight: 1,
            }}
          >
            {i === headPosition ? '↑' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}