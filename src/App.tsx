import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/classic';
  const isDash = location.pathname === '/';

  const handleReveal = useCallback((n: number) => setRevealStep(n), []);
  const handleDark = useCallback((d: boolean) => setIsDarkMode(d), []);

  return (
    <main className="w-full min-h-screen bg-white selection:bg-[#DF95FF]/30 relative" style={{ overflowX: 'clip' }}>
      <ScrollToTop />
      {!isDash && <Navigation revealStep={isHome ? revealStep : 3} isDarkMode={isDarkMode} />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/classic" element={<Home onReveal={handleReveal} onDarkModeChange={handleDark} />} />
        <Route path="/work/:slug" element={<CaseStudy onDarkModeChange={handleDark} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
