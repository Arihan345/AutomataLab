import { Link } from 'react-router-dom';

const modules = [
  { path: '/regex', title: 'Regex → NFA → DFA', desc: 'Parse a regex, build an NFA via Thompson\'s Construction, convert to DFA, minimize.' },
  { path: '/pda', title: 'Pushdown Automata', desc: 'Define a PDA manually, simulate with a live stack.' },
  { path: '/cfg', title: 'Context-Free Grammars', desc: 'CYK parsing and parse tree visualization. (Coming soon)' },
  { path: '/tm', title: 'Turing Machines', desc: 'Tape-based execution with step limits. (Coming soon)' },
];

export default function Home() {
  return (
    <div style={{ padding: 40, maxWidth: 700, margin: '0 auto' }}>
      <h1>AutomataLab</h1>
      <p>An interactive visualizer for formal language and automata theory.</p>
      <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
        {modules.map((m) => (
          <Link key={m.path} to={m.path} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
              <h3 style={{ margin: 0 }}>{m.title}</h3>
              <p style={{ margin: '6px 0 0', color: '#555', fontSize: 14 }}>{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}