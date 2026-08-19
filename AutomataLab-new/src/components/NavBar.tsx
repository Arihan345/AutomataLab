import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav style={{ display: 'flex', gap: 16, padding: '10px 20px', borderBottom: '1px solid #ddd' }}>
      <Link to="/">AutomataLab</Link>
      <Link to="/regex">Regex/DFA</Link>
      <Link to="/pda">PDA</Link>
      <Link to="/cfg">CFG</Link>
      <Link to="/tm">TM</Link>
    </nav>
  );
}