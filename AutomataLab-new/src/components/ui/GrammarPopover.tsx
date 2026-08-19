import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';

export function GrammarPopover({
  text,
  onChange,
  onBuild,
  error,
}: {
  text: string;
  onChange: (v: string) => void;
  onBuild: () => void;
  error: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const lines = text.split('\n');

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 6,
          color: 'var(--text-1)', padding: '7px 12px', fontFamily: 'var(--mono)', fontSize: 12.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, maxWidth: 220,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lines[0] || 'No grammar'}{lines.length > 1 ? ` +${lines.length - 1}` : ''}
        </span>
        <span style={{ color: 'var(--text-3)' }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20,
            width: 360, background: 'var(--surface)', border: '1px solid var(--border-strong)',
            borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 14,
          }}
        >
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
            <div style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: 12, userSelect: 'none', borderRight: '1px solid var(--border)' }}>
              {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              value={text}
              onChange={(e) => onChange(e.target.value)}
              rows={Math.max(5, lines.length)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'vertical', color: 'var(--text-1)', fontFamily: 'var(--mono)', fontSize: 12.5, padding: 10, lineHeight: 1.5 }}
            />
          </div>
          <Button size="sm" style={{ width: '100%', marginTop: 10 }} onClick={() => { onBuild(); setOpen(false); }}>
            Build Grammar
          </Button>
          {error && <p style={{ color: 'var(--rose)', fontSize: 11.5, marginTop: 6 }}>{error}</p>}
        </div>
      )}
    </div>
  );
}