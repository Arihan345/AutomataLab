import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import DFAPage from './components/DFAPage';
import RegexPage from './components/RegexPage';
import PDAPage from './components/PDAPage';
import CFGPage from './components/CFGPage';
import TMPage from './components/TMPage';
import DFAEquivalencePage from './components/DFAEquivalencePage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FocusProvider, useFocus } from './context/FocusContext';

function Layout() {
  const { focused } = useFocus();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', height: '100vh' }}>
      {!focused && <Sidebar />}
      <main style={{ flex: 1, overflow: 'hidden', height: '100vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dfa" element={<DFAPage />} />
          <Route path="/regex" element={<RegexPage />} />
          <Route path="/pda" element={<PDAPage />} />
          <Route path="/cfg" element={<CFGPage />} />
          <Route path="/tm" element={<TMPage />} />
          <Route path="/dfa-equivalence" element={<DFAEquivalencePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <FocusProvider>
          <Layout />
        </FocusProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}