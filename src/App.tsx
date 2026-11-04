import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { CaseStudy } from './pages/CaseStudy';
import { SkyBackground } from './components/SkyBackground';
import { lazy, Suspense } from 'react';

// dev-only page for recording project reels to video
const ReelCapture = import.meta.env.DEV ? lazy(() => import('./pages/ReelCapture')) : null;

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

  // Home sits on the sky; other pages are dark. Keep the page background and Safari's
  // bar colour in step when navigating (index.html sets them before first paint).
  useEffect(() => {
    document.documentElement.classList.toggle('sky', isHome);
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', isHome ? '#2c8bc6' : '#0f0d16');
  }, [isHome]);

  return (
    <main className={`w-full min-h-screen ${isHome ? 'bg-transparent' : 'bg-[#0f0d16]'} text-[#f4f2f8] selection:bg-[#DF95FF]/30 relative`} style={{ overflowX: 'clip' }}>
      {/* The home page sits on a live sky (fixed: it does not change with scroll). */}
      {isHome && <SkyBackground />}
      <ScrollToTop />
      <Navigation revealStep={isHome ? revealStep : 3} />
      <Routes>
        <Route path="/" element={<Home onReveal={handleReveal} />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        {ReelCapture && <Route path="/__reel/:slug" element={<Suspense fallback={null}><ReelCapture /></Suspense>} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
