export default function StackPanel({ stack }: { stack: string[] }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 10, width: 100 }}>
      <strong>Stack</strong>
      <div style={{ display: 'flex', flexDirection: 'column-reverse', marginTop: 6 }}>
        {stack.map((symbol, i) => (
          <div
            key={i}
            style={{
              border: '1px solid #999',
              padding: '4px 8px',
              textAlign: 'center',
              background: i === stack.length - 1 ? '#eef' : '#fff',
            }}
          >
            {symbol}
          </div>
        ))}
      </div>
    </div>
  );
}