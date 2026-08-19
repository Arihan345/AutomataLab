import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import RegexPage from './components/RegexPage';
import PDAPage from './components/PDAPage';
import CFGPage from './components/CFGPage';
import TMPage from './components/TMPage';


export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/regex" element={<RegexPage />} />
        <Route path="/pda" element={<PDAPage />} />
        <Route path="/cfg" element={<CFGPage />} />
        <Route path="/tm" element={<TMPage />} />
      </Routes>
    </BrowserRouter>
  );
}