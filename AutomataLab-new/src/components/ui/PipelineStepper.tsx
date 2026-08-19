const STEPS = ['NFA', 'Derived DFA', 'Minimal DFA'] as const;

export function PipelineStepper({
  current,
  onChange,
  disabled,
}: {
  current: string;
  onChange: (s: (typeof STEPS)[number]) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {STEPS.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => onChange(step)}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11.5,
              padding: '5px 10px',
              borderRadius: 5,
              border: `1px solid ${current === step ? 'var(--violet)' : 'var(--border)'}`,
              background: current === step ? 'var(--violet-soft)' : 'transparent',
              color: current === step ? 'var(--text-1)' : 'var(--text-2)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {step}
          </button>
          {i < STEPS.length - 1 && (
            <span style={{ color: 'var(--text-3)', margin: '0 3px', fontSize: 12 }}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}