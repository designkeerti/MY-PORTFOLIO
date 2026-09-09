import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { CaseStudy } from './pages/CaseStudy';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) { el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' }); return; }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function App() {
  const [revealStep, setRevealStep] = useState(0);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleReveal = useCallback((n: number) => setRevealStep(n), []);

  return (
    <main className="w-full min-h-screen bg-[#0f0d16] text-[#f4f2f8] selection:bg-[#DF95FF]/30 relative" style={{ overflowX: 'clip' }}>
      <ScrollToTop />
      <Navigation revealStep={isHome ? revealStep : 3} />
      <Routes>
        <Route path="/" element={<Home onReveal={handleReveal} />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
