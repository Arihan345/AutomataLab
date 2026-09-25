import { useState } from 'react';
import { Button } from './ui/Button';
import type { PartitionRound } from '../lib/minimizeDFA';

const GROUP_COLORS = ['var(--violet)', 'var(--teal)', 'var(--rose)', 'var(--amber)'];

export function PartitionStepViewer({ history }: { history: PartitionRound[] }) {
  const [roundIndex, setRoundIndex] = useState(0);

  if (history.length === 0) return null;

  const clampedIndex = Math.min(roundIndex, history.length - 1);
  const round = history[clampedIndex];
  const isFirst = clampedIndex === 0;
  const isLast = clampedIndex === history.length - 1;

  return (
    <div style={{ padding: '14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Button size="sm" variant="secondary" disabled={clampedIndex === 0} onClick={() => setRoundIndex((i) => i - 1)}>◀</Button>
        <Button size="sm" variant="secondary" disabled={clampedIndex >= history.length - 1} onClick={() => setRoundIndex((i) => i + 1)}>▶</Button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)' }}>
          Round {clampedIndex + 1} / {history.length}
          {isFirst && ' — initial accept/non-accept split'}
          {isLast && !isFirst && ' — stable (final partitions)'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {round.partitions.map((group, idx) => {
          const color = GROUP_COLORS[idx % GROUP_COLORS.length];
          return (
            <div
              key={idx}
              style={{
                minWidth: 140,
                padding: 12,
                background: 'var(--surface)',
                border: `1px solid ${color}`,
                borderRadius: 8,
              }}
            >
              <p style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontWeight: 700 }}>
                Group {idx + 1}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {group.map((state) => (
                  <span
                    key={state}
                    style={{
                      fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-1)',
                      background: 'var(--bg-elevated)', border: `1px solid ${color}`,
                      borderRadius: 999, padding: '3px 9px',
                    }}
                  >
                    {state}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
