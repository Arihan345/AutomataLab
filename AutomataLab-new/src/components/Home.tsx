import { Link } from 'react-router-dom';

function DFAPreview() {
  return (
    <svg width="100%" height="80" viewBox="0 0 240 80">
      <line x1="24" y1="40" x2="100" y2="40" stroke="var(--border-strong)" />
      <line x1="124" y1="40" x2="196" y2="40" stroke="var(--border-strong)" />
      <circle cx="24" cy="40" r="16" fill="none" stroke="var(--violet)" strokeWidth="1.5" />
      <text x="24" y="45" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--text-2)">q0</text>
      <circle cx="112" cy="40" r="16" fill="none" stroke="var(--violet)" strokeWidth="1.5" />
      <text x="112" y="45" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--text-2)">q1</text>
      <circle cx="200" cy="40" r="18" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="200" cy="40" r="13" fill="none" stroke="var(--teal)" strokeWidth="1.5" />
      <text x="60" y="32" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--text-3)">a</text>
      <text x="160" y="32" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--text-3)">b</text>
      <circle r="4" fill="var(--violet)">
        <animateMotion dur="3s" repeatCount="indefinite" path="M 24 40 L 112 40 L 200 40" />
      </circle>
    </svg>
  );
}

function RegexPreview() {
  const stages = ['Regex', 'NFA', 'DFA', 'Min-DFA'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '6px 0' }}>
      {stages.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: i === stages.length - 1 ? 'var(--teal)' : 'var(--violet)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: i === stages.length - 1 ? 'var(--teal)' : 'var(--text-2)' }}>{s}</span>
          {i < stages.length - 1 && <span style={{ color: 'var(--text-3)', fontSize: 11 }}>↓</span>}
        </div>
      ))}
    </div>
  );
}

function PDAPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column-reverse', width: 60, marginTop: 4 }}>
      {['Z', 'A', 'A'].map((s, i) => (
        <div
          key={i}
          style={{
            padding: '6px 0',
            textAlign: 'center',
            border: `1px solid ${i === 2 ? 'var(--violet)' : 'var(--border-strong)'}`,
            borderTop: i < 2 ? 'none' : undefined,
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: i === 2 ? 'var(--violet)' : 'var(--text-2)',
            background: i === 2 ? 'var(--violet-soft)' : 'transparent',
          }}
        >
          {s}
        </div>
      ))}
    </div>
  );
}

function CFGPreview() {
  return (
    <svg width="100%" height="70" viewBox="0 0 140 70">
      <line x1="70" y1="16" x2="35" y2="48" stroke="var(--border-strong)" />
      <line x1="70" y1="16" x2="105" y2="48" stroke="var(--border-strong)" />
      <circle cx="70" cy="16" r="12" fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth="1.4" />
      <text x="70" y="20" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--text-1)" fontWeight="700">S</text>
      <circle cx="35" cy="52" r="12" fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth="1.4" />
      <text x="35" y="56" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--text-1)" fontWeight="700">A</text>
      <circle cx="105" cy="52" r="12" fill="var(--teal-soft)" stroke="var(--teal)" strokeWidth="1.4" />
      <text x="105" y="56" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--teal)" fontWeight="700">b</text>
    </svg>
  );
}

function TMPreview() {
  return (
    <div style={{ display: 'flex', gap: 3, padding: '8px 0' }}>
      {['0', '1', '1', '□', '□'].map((s, i) => (
        <div
          key={i}
          style={{
            width: 26,
            height: 26,
            border: `1px solid ${i === 1 ? 'var(--violet)' : 'var(--border-strong)'}`,
            background: i === 1 ? 'var(--violet-soft)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: i === 1 ? 'var(--violet)' : 'var(--text-2)',
            position: 'relative',
          }}
        >
          {s}
          {i === 1 && <span style={{ position: 'absolute', top: -16, fontSize: 11, color: 'var(--violet)' }}>↑</span>}
        </div>
      ))}
    </div>
  );
}

const modules = [
  { path: '/dfa', num: '01', title: 'Manual DFA', desc: 'Design a deterministic automaton and watch it execute.', preview: <DFAPreview /> },
  { path: '/regex', num: '02', title: 'Regex → DFA', desc: 'Thompson construction → NFA → DFA → minimization.', preview: <RegexPreview /> },
  { path: '/pda', num: '03', title: 'Pushdown Automata', desc: 'Execute a PDA with a live stack.', preview: <PDAPreview /> },
  { path: '/cfg', num: '04', title: 'Context-Free Grammars', desc: 'CYK parsing and parse tree construction.', preview: <CFGPreview /> },
  { path: '/tm', num: '05', title: 'Turing Machine', desc: 'Step through computation on an interactive tape.', preview: <TMPreview />, wide: true },
];

function ModuleCard({
  num,
  title,
  desc,
  preview,
  wide,
}: {
  num: string;
  title: string;
  desc: string;
  preview: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      style={{
        height: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 26,
        transition: 'border-color 0.18s ease, transform 0.18s ease',
        display: wide ? 'flex' : 'block',
        alignItems: wide ? 'center' : undefined,
        justifyContent: wide ? 'space-between' : undefined,
        gap: wide ? 32 : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        const p = e.currentTarget.querySelector('.card-preview') as HTMLElement;
        if (p) p.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        const p = e.currentTarget.querySelector('.card-preview') as HTMLElement;
        if (p) p.style.opacity = '0.82';
      }}
    >
      <div>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>{num}</p>
        <h3 style={{ fontSize: 18, marginBottom: 8, fontWeight: 600 }}>{title}</h3>
        <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.55, maxWidth: wide ? 280 : undefined }}>{desc}</p>
      </div>
      <div className="card-preview" style={{ opacity: 0.82, transition: 'opacity 0.18s ease', marginTop: wide ? 0 : 14 }}>
        {preview}
      </div>
    </div>
  );
}

function HeroNetwork() {
  return (
    <svg width="360" height="300" viewBox="0 0 360 300" style={{ opacity: 0.55, flexShrink: 0 }}>
      <line x1="60" y1="60" x2="200" y2="30" stroke="var(--border-strong)" strokeWidth="1" />
      <line x1="200" y1="30" x2="300" y2="100" stroke="var(--border-strong)" strokeWidth="1" />
      <line x1="60" y1="60" x2="90" y2="180" stroke="var(--border-strong)" strokeWidth="1" />
      <line x1="90" y1="180" x2="240" y2="220" stroke="var(--border-strong)" strokeWidth="1" />
      <line x1="240" y1="220" x2="300" y2="100" stroke="var(--border-strong)" strokeWidth="1" />
      <line x1="90" y1="180" x2="60" y2="60" stroke="var(--border-strong)" strokeWidth="1" opacity="0.5" />

      <circle cx="60" cy="60" r="16" fill="none" stroke="var(--violet)" strokeWidth="1.3" />
      <circle cx="200" cy="30" r="16" fill="none" stroke="var(--violet)" strokeWidth="1.3" />
      <circle cx="300" cy="100" r="16" fill="none" stroke="var(--violet)" strokeWidth="1.3" />
      <circle cx="90" cy="180" r="16" fill="none" stroke="var(--violet)" strokeWidth="1.3" />
      <circle cx="240" cy="220" r="18" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="240" cy="220" r="13" fill="none" stroke="var(--teal)" strokeWidth="1.3" />

      <circle r="4" fill="var(--violet)">
        <animateMotion dur="7s" repeatCount="indefinite" path="M 60 60 L 200 30 L 300 100 L 240 220 L 90 180 Z" />
      </circle>
    </svg>
  );
}

export default function Home() {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div
        style={{
          minHeight: '55vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-7)',
          maxWidth: 1300,
          margin: '0 auto',
          gap: 40,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)', margin: '0 0 14px', letterSpacing: '0.08em' }}>
            FORMAL LANGUAGE THEORY
          </p>
          <h1 style={{ fontSize: 58, margin: '0 0 18px', lineHeight: 1.05 }}>AutomataLab</h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 19, color: 'var(--violet)', margin: '0 0 18px', fontWeight: 600, letterSpacing: '0.01em' }}>
            BUILD → TRANSFORM → SIMULATE
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: 16, lineHeight: 1.65, marginBottom: 12, maxWidth: 460 }}>
            Interactive automata construction, transformation, and step-by-step
            simulation for formal language theory.
          </p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)' }}>
            5 modules · interactive simulations · step-by-step execution
          </p>
        </div>
        <HeroNetwork />
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 var(--space-7) var(--space-7)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
          {modules.slice(0, 4).map((m) => (
            <Link key={m.path} to={m.path} style={{ textDecoration: 'none' }}>
              <ModuleCard {...m} />
            </Link>
          ))}
        </div>
        <Link to={modules[4].path} style={{ textDecoration: 'none' }}>
          <ModuleCard {...modules[4]} />
        </Link>
      </div>
    </div>
  );
}