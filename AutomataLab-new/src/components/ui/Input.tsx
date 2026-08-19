import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

const fieldBase: React.CSSProperties = {
    background: 'var(--surface)',
  WebkitAppearance: 'none',
  appearance: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  color: 'var(--text-1)', padding: '9px 12px', fontFamily: 'var(--mono)', fontSize: 13, width: '100%',
};

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...fieldBase, ...props.style }} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...fieldBase, resize: 'vertical', lineHeight: 1.5, ...props.style }} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...fieldBase, cursor: 'pointer', ...props.style }} />;
}