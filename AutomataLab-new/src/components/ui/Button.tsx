import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
};

export function Spinner() {
  return <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />;
}

export function Button({ variant = 'primary', size = 'md', loading, children, disabled, style, ...rest }: Props) {
  const base: React.CSSProperties = {
    fontFamily: 'var(--sans)', fontWeight: 600,
    fontSize: size === 'sm' ? 12.5 : 13.5,
    padding: size === 'sm' ? '6px 12px' : '9px 16px',
    borderRadius: 'var(--radius-sm)', border: '1px solid transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    transition: 'transform 0.12s var(--ease)', opacity: disabled ? 0.4 : 1,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--violet)', color: '#0a0a10' },
    secondary: { background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--text-2)' },
  };
  return (
    <button {...rest} disabled={disabled || loading} style={{ ...base, ...variants[variant], ...style }}>
      {loading ? <Spinner /> : children}
    </button>
  );
}