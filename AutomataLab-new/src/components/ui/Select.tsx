import type { SelectHTMLAttributes } from 'react';

const fieldBase: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-1)',
  padding: '9px 12px',
  fontFamily: 'var(--mono)',
  fontSize: 13,
  width: '100%',
};

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...fieldBase, cursor: 'pointer', outline: 'none', ...props.style }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--violet)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--violet-soft)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
        props.onBlur?.(e);
      }}
    />
  );
}