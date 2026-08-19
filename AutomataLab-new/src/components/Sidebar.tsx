import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dfa', label: 'Manual DFA', num: '01' },
  { to: '/regex', label: 'Regex → DFA', num: '02' },
  { to: '/pda', label: 'Pushdown Automata', num: '03' },
  { to: '/cfg', label: 'Context-Free Grammars', num: '04' },
  { to: '/tm', label: 'Turing Machines', num: '05' },
];

export default function Sidebar() {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      {/* rail placeholder — always reserves 56px so content doesn't shift */}
      <div style={{ width: 56, flexShrink: 0 }} />

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: hovered ? 232 : 56,
          zIndex: 50,
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border)',
          boxShadow: hovered ? 'var(--shadow-md)' : 'none',
          transition: 'width 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--space-4) var(--space-2)',
        }}
      >
        <NavLink to="/" style={{ textDecoration: 'none', padding: '0 6px', marginBottom: 'var(--space-6)', whiteSpace: 'nowrap' }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 15 }}>
            {hovered ? (
              <>Automata<span style={{ color: 'var(--violet)' }}>Lab</span></>
            ) : (
              <span style={{ color: 'var(--violet)' }}>A</span>
            )}
          </div>
        </NavLink>

        {hovered && (
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 6px', marginBottom: 'var(--space-2)', whiteSpace: 'nowrap' }}>
            Modules
          </p>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontSize: 13,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                color: isActive ? 'var(--text-1)' : 'var(--text-2)',
                background: isActive ? 'var(--violet-soft)' : 'transparent',
              })}
            >
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--text-3)', width: 16, flexShrink: 0 }}>{l.num}</span>
              {hovered && l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}