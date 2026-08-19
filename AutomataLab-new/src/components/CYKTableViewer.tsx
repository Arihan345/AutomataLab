import type { CYKCell } from '../lib/cyk';

export default function CYKTableViewer({ table, input }: { table: CYKCell[][]; input: string }) {
  const n = input.length;
  const rows = [...Array(n).keys()].reverse();

  return (
    <div style={{ padding: '6px 16px', whiteSpace: 'nowrap' }}>
      <table style={{ borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ padding: 3 }} />
            {[...input].map((ch, i) => (
              <th key={i} style={{ padding: 3, color: 'var(--text-2)', fontWeight: 400 }}>{ch}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((lenIdx) => (
            <tr key={lenIdx}>
              <td style={{ padding: 3, color: 'var(--text-3)', textAlign: 'right' }}>len {lenIdx + 1}</td>
              {[...Array(n - lenIdx).keys()].map((i) => {
                const cell = table[i]?.[lenIdx];
                const hasContent = cell && cell.symbols.length > 0;
                return (
                  <td key={i} style={{ padding: 2 }}>
                    <div
                      style={{
                        minWidth: 36, minHeight: 24,
                        border: `1px solid ${hasContent ? 'var(--violet)' : 'var(--border)'}`,
                        borderRadius: 4,
                        background: hasContent ? 'var(--violet-soft)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: hasContent ? 'var(--text-1)' : 'var(--text-3)',
                        padding: '2px 4px',
                        fontWeight: hasContent ? 600 : 400,
                        fontSize: 10.5,
                      }}
                    >
                      {hasContent ? cell.symbols.join(',') : '·'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}