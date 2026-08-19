export default function StackPanel({ stack }: { stack: string[] }) {
  return (
    <div style={{ width: 110 }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px', fontWeight: 600 }}>
        Stack
      </p>
      <div style={{ display: 'flex', flexDirection: 'column-reverse' }}>
        {stack.length === 0 && (
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>empty</p>
        )}
        {stack.map((symbol, i) => {
          const isTop = i === stack.length - 1;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `1px solid ${isTop ? 'var(--violet)' : 'var(--border)'}`,
                borderTop: i < stack.length - 1 ? 'none' : undefined,
                padding: '6px 9px',
                fontFamily: 'var(--mono)',
                fontSize: 12.5,
                fontWeight: isTop ? 700 : 400,
                color: isTop ? 'var(--violet)' : 'var(--text-1)',
                background: isTop ? 'var(--violet-soft)' : 'transparent',
              }}
            >
              <span>{symbol}</span>
              {isTop && <span style={{ fontSize: 9, color: 'var(--violet)', letterSpacing: '0.05em' }}>TOP</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}