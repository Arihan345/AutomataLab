import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import DFAPage from './components/DFAPage';
import RegexPage from './components/RegexPage';
import PDAPage from './components/PDAPage';
import CFGPage from './components/CFGPage';
import TMPage from './components/TMPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dfa" element={<DFAPage />} />
            <Route path="/regex" element={<RegexPage />} />
            <Route path="/pda" element={<PDAPage />} />
            <Route path="/cfg" element={<CFGPage />} />
            <Route path="/tm" element={<TMPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}