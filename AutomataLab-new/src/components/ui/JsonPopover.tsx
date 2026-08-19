import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';

export function JsonPopover({
  label,
  text,
  onChange,
  onBuild,
  error,
}: {
  label: string;
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

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 6,
          color: 'var(--text-1)', padding: '7px 12px', fontFamily: 'var(--mono)', fontSize: 12.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, minWidth: 140,
        }}
      >
        <span>{label}</span>
        <span style={{ color: 'var(--text-3)', marginLeft: 'auto' }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 20,
            width: 380, background: 'var(--surface)', border: '1px solid var(--border-strong)',
            borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 14,
          }}
        >
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            rows={12}
            style={{
              width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text-1)', fontFamily: 'var(--mono)', fontSize: 12, padding: 10, lineHeight: 1.5, resize: 'vertical',
            }}
          />
          <Button size="sm" style={{ width: '100%', marginTop: 10 }} onClick={() => { onBuild(); setOpen(false); }}>
            Load
          </Button>
          {error && <p style={{ color: 'var(--rose)', fontSize: 11.5, marginTop: 6 }}>{error}</p>}
        </div>
      )}
    </div>
  );
}