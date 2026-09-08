import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '../content/projects';
import { HeroColumn } from '../theatre/HeroColumn';
import { Screen } from '../theatre/Screen';
import { AboutColumn } from '../theatre/AboutColumn';
import { LottieAnimation } from '../components/LottieAnimation';

/**
 * One viewport, no scrolling. The hero forms in the centre of the screen; once its intro has played it
 * slides into the left column and the screen and the profile come in beside it.
 */
export const Theatre = () => {
  const [cur, setCur] = useState(0);
  const [skip] = useState(() => { try { return sessionStorage.getItem('introSeen') === '1'; } catch { return false; } });
  const [ready, setReady] = useState(skip);
  const [offset, setOffset] = useState(0);
  const colRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<{ handleHoverStart: () => void; handleHoverEnd: () => void } | null>(null);

  // how far the left column's centre is from the centre of the window
  useEffect(() => {
    const measure = () => { const r = colRef.current?.getBoundingClientRect(); if (r) setOffset(window.innerWidth / 2 - (r.left + r.width / 2)); };
    measure(); window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure);
  }, []);
  useEffect(() => { try { sessionStorage.setItem('introSeen', '1'); } catch { /* private mode */ } }, []);
  const onStep = useCallback((n: number) => { if (n >= 3) setReady(true); }, []);

  const slide = { type: 'spring', stiffness: 70, damping: 18, mass: 1 } as const;

  return (
    <div className="theatre">
      <div className="theatre-grid">
        <div ref={colRef} className="theatre-col theatre-col--hero">
          <motion.div className="absolute left-6 top-5 z-10" initial={false} animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : -8 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Link to="/" className="inline-flex items-center font-bold text-xl tracking-tight text-text-primary group" onMouseEnter={() => lottieRef.current?.handleHoverStart()} onMouseLeave={() => lottieRef.current?.handleHoverEnd()}>
              <span className="group-hover:text-[#FFAA95] transition-colors">Keerthi Vardhan</span>
              <span className="inline-block w-[72px] h-[48px] -ml-2 -my-2"><LottieAnimation ref={lottieRef} path="/lottie/Cat is sleeping and rolling.json" width={72} height={72} loop autoplay className="bg-transparent" /></span>
            </Link>
          </motion.div>
          <motion.div className="h-full" initial={false} animate={{ x: ready ? 0 : offset }} transition={slide}>
            <HeroColumn skip={skip} onStep={onStep} />
          </motion.div>
        </div>

        <motion.main className="theatre-col theatre-main" initial={false} animate={{ opacity: ready ? 1 : 0, x: ready ? 0 : 40 }} transition={{ ...slide, delay: 0.12 }}>
          <Screen projects={projects} current={cur} onPick={setCur} />
        </motion.main>

        <motion.aside className="theatre-col" initial={false} animate={{ opacity: ready ? 1 : 0, x: ready ? 0 : 40 }} transition={{ ...slide, delay: 0.22 }}>
          <AboutColumn />
        </motion.aside>
      </div>
    </div>
  );
};
