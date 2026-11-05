import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { CaseStudy } from './pages/CaseStudy';
import { SkyBackground } from './components/SkyBackground';
import { PageTransitionProvider } from './components/PageTransition';
import { lazy, Suspense } from 'react';
import { pageTop, isIOS } from './lib/pageTop';

// dev-only page for recording project reels to video
const ReelCapture = import.meta.env.DEV ? lazy(() => import('./pages/ReelCapture')) : null;
const FilmCapture = import.meta.env.DEV ? lazy(() => import('./pages/FilmCapture')) : null;
// the playground loads on demand, so the home page stays as light as it was
const Playground = lazy(() => import('./pages/Playground'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    // the page's top is below the room kept above it on iOS (see src/lib/pageTop.ts)
    if (!hash) { window.scrollTo({ top: pageTop(), behavior: 'instant' as ScrollBehavior }); return; }
    // the target may render a moment later (the home page mounts its sections after the
    // hero), so look for it for a short while before giving up
    let tries = 0, raf = 0;
    const find = () => {
      const el = document.querySelector(hash);
      if (el) { el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' }); return; }
      if (++tries < 60) raf = requestAnimationFrame(find); else window.scrollTo({ top: pageTop(), behavior: 'instant' as ScrollBehavior });
    };
    find();
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
  return null;
}

function App() {
  const [revealStep, setRevealStep] = useState(0);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleReveal = useCallback((n: number) => setRevealStep(n), []);

  // Home and the case studies sit on the sky; anything else is dark. Keep the page
  // background and Safari's bar colour in step (index.html sets them before first paint).
  const isCase = location.pathname.startsWith('/work/');
  const isPlay = location.pathname === '/playground' || location.pathname.startsWith('/playground/');
  const onSky = isHome || isCase || isPlay;
  useEffect(() => {
    document.documentElement.classList.toggle('sky', onSky);
    document.documentElement.classList.toggle('ios-top', onSky && isIOS());
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', onSky ? '#2c8bc6' : '#0f0d16');
  }, [onSky]);

  return (
    <PageTransitionProvider>
      <main className={`w-full min-h-screen ${onSky ? 'bg-transparent' : 'bg-[#0f0d16]'} text-[#f4f2f8] selection:bg-[#DF95FF]/30 relative`} style={{ overflowX: 'clip' }}>
        {/* The live sky. Remounted per page (under the transition) so it tracks that page's hero. */}
        {onSky && <SkyBackground key={location.pathname} />}
        <ScrollToTop />
        {/* case studies have their own top bar */}
        {!isCase && !isPlay && <Navigation revealStep={isHome ? revealStep : 3} />}
        <Routes>
          <Route path="/" element={<Home onReveal={handleReveal} />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="/playground" element={<Suspense fallback={null}><Playground /></Suspense>} />
          <Route path="/playground/:tool" element={<Suspense fallback={null}><Playground /></Suspense>} />
          {ReelCapture && <Route path="/__reel/:slug" element={<Suspense fallback={null}><ReelCapture /></Suspense>} />}
          {FilmCapture && <Route path="/__film/:slug" element={<Suspense fallback={null}><FilmCapture /></Suspense>} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </PageTransitionProvider>
  );
}

export default App;
