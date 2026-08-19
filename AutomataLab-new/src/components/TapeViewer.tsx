export default function TapeViewer({ tape, headPosition }: { tape: string[]; headPosition: number }) {
  return (
    <div style={{ overflowX: 'auto', padding: 10 }}>
      <div style={{ display: 'flex' }}>
        {tape.map((symbol, i) => (
          <div
            key={i}
            style={{
              width: 32,
              height: 32,
              border: '1px solid #999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: i === headPosition ? '#eef' : '#fff',
              fontWeight: i === headPosition ? 'bold' : 'normal',
            }}
          >
            {symbol}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        {tape.map((_, i) => (
          <div key={i} style={{ width: 32, textAlign: 'center', fontSize: 12 }}>
            {i === headPosition ? '↑' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}