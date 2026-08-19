import { Link } from 'react-router-dom';

function DFAPreview() {
  return (
    <svg width="100%" height="70" viewBox="0 0 220 70">
      <line x1="20" y1="35" x2="90" y2="35" stroke="var(--border-strong)" />
      <line x1="110" y1="35" x2="170" y2="35" stroke="var(--border-strong)" />
      <circle cx="20" cy="35" r="14" fill="none" stroke="var(--violet)" strokeWidth="1.5" />
      <text x="20" y="39" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--text-2)">q0</text>
      <circle cx="100" cy="35" r="14" fill="none" stroke="var(--violet)" strokeWidth="1.5" />
      <text x="100" y="39" textAnchor="middle" fontFamily="var(--mono)" fontSize="10" fill="var(--text-2)">q1</text>
      <circle cx="180" cy="35" r="16" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle cx="180" cy="35" r="12" fill="none" stroke="var(--teal)" strokeWidth="1.5" />
      <circle r="4" fill="var(--violet)">
        <animateMotion dur="2.8s" repeatCount="indefinite" path="M 20 35 L 100 35 L 180 35" />
      </circle>
    </svg>
  );
}
function RegexPreview() {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginTop: 10 }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-2)', margin: 0 }}>
        Regex <span style={{ color: 'var(--text-3)' }}>→</span> NFA <span style={{ color: 'var(--text-3)' }}>→</span> DFA
      </p>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-3)', margin: '4px 0 0' }}>↓</p>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--teal)', margin: '2px 0 0' }}>Min-DFA</p>
    </div>
  );
}
function PDAPreview() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', padding: '8px 0' }}>
      {['Z', 'A', 'A'].map((s, i) => (
        <div key={i} style={{ width: 24, height: 24 - i * 2, border: '1px solid var(--border-strong)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-2)' }}>
          {s}
        </div>
      ))}
    </div>
  );
}
function CFGPreview() {
  return (
    <svg width="100%" height="60" viewBox="0 0 120 60">
      <line x1="60" y1="14" x2="30" y2="40" stroke="var(--border-strong)" />
      <line x1="60" y1="14" x2="90" y2="40" stroke="var(--border-strong)" />
      <text x="60" y="12" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--violet)">S</text>
      <text x="30" y="48" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--violet)">A</text>
      <text x="90" y="48" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" fill="var(--teal)">b</text>
    </svg>
  );
}
function TMPreviewWide() {
  return (
    <div style={{ display: 'flex', gap: 3, padding: '12px 0 0' }}>
      {['0', '1', '1', '□', '□', '□'].map((s, i) => (
        <div key={i} style={{ position: 'relative', width: 34, height: 34, border: `1px solid ${i === 2 ? 'var(--violet)' : 'var(--border-strong)'}`, background: i === 2 ? 'var(--violet-soft)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-2)' }}>
          {s}
          {i === 2 && (
            <span style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', color: 'var(--violet)', fontSize: 11 }}>↑</span>
          )}
        </div>
      ))}
    </div>
  );
}

function CardShell({ path, num, title, desc, children }: { path: string; num: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <div
        style={{ height: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, transition: 'border-color 0.15s ease, background 0.15s ease' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.background = 'var(--surface-2)';
          const arrow = e.currentTarget.querySelector('.hover-arrow') as HTMLElement;
          if (arrow) arrow.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'var(--surface)';
          const arrow = e.currentTarget.querySelector('.hover-arrow') as HTMLElement;
          if (arrow) arrow.style.opacity = '0';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>{num}</p>
          <span className="hover-arrow" style={{ fontSize: 13, color: 'var(--text-2)', opacity: 0, transition: 'opacity 0.15s ease' }}>→</span>
        </div>
        <h3 style={{ fontSize: 15.5, marginBottom: 6 }}>{title}</h3>
        <p style={{ color: 'var(--text-2)', fontSize: 12.5, lineHeight: 1.5, marginBottom: 4 }}>{desc}</p>
        {children}
      </div>
    </Link>
  );
}

function DecorativeGraph() {
  return (
    <svg width="220" height="140" viewBox="0 0 220 140" style={{ opacity: 0.4, flexShrink: 0 }}>
      <line x1="30" y1="70" x2="110" y2="30" stroke="var(--border-strong)" strokeWidth="1" />
      <line x1="110" y1="30" x2="190" y2="60" stroke="var(--border-strong)" strokeWidth="1" />
      <line x1="30" y1="70" x2="90" y2="115" stroke="var(--border-strong)" strokeWidth="1" />
      <line x1="90" y1="115" x2="190" y2="60" stroke="var(--border-strong)" strokeWidth="1" />

      <circle cx="30" cy="70" r="13" fill="none" stroke="var(--violet)" strokeWidth="1.2" />
      <circle cx="110" cy="30" r="13" fill="none" stroke="var(--violet)" strokeWidth="1.2" />
      <circle cx="90" cy="115" r="13" fill="none" stroke="var(--violet)" strokeWidth="1.2" />
      <circle cx="190" cy="60" r="15" fill="none" stroke="var(--teal)" strokeWidth="1.2" strokeDasharray="2 2" />

      <circle r="3.5" fill="var(--violet)">
        <animateMotion dur="5s" repeatCount="indefinite" path="M 30 70 L 110 30 L 190 60 L 90 115 L 30 70" />
      </circle>
    </svg>
  );
}

export default function Home() {
  return (
    <div style={{ padding: 'var(--space-7) var(--space-7) var(--space-6)', maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 'var(--space-7)' }}>
        <div>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-2)', margin: '0 0 var(--space-2)', letterSpacing: '0.06em' }}>
            FORMAL LANGUAGE THEORY
          </p>
          <h1 style={{ fontSize: 38, margin: '0 0 var(--space-3)' }}>AutomataLab</h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 17, color: 'var(--violet)', margin: '0 0 var(--space-3)', fontWeight: 600 }}>
            Build → Transform → Simulate
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: 14.5, lineHeight: 1.6, maxWidth: 440, marginBottom: 8 }}>
            Interactive automata construction and visualization for formal language theory.
          </p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-3)' }}>
            5 modules · interactive simulations · step-by-step execution
          </p>
        </div>
        <DecorativeGraph />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <CardShell path="/dfa" num="01" title="Manual DFA" desc="Design a deterministic automaton and watch it execute.">
          <DFAPreview />
        </CardShell>
        <CardShell path="/regex" num="02" title="Regex → DFA" desc="Thompson construction → NFA → DFA → minimization.">
          <RegexPreview />
        </CardShell>
        <CardShell path="/pda" num="03" title="Pushdown Automata" desc="Execute a PDA with a live stack.">
          <PDAPreview />
        </CardShell>
        <CardShell path="/cfg" num="04" title="Context-Free Grammars" desc="CYK parsing and parse tree construction.">
          <CFGPreview />
        </CardShell>
      </div>

      <CardShell path="/tm" num="05" title="Turing Machine" desc="Step through computation on an interactive tape.">
        <TMPreviewWide />
      </CardShell>
    </div>
  );
}