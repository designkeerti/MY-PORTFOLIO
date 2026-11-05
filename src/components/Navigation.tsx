import { useState, useRef, useEffect, type ReactNode, type MouseEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { LottieAnimation } from './LottieAnimation';
import { pageTop } from '../lib/pageTop';

/**
 * Two glass pills: my name with the cat on the left, the menu on the right.
 * Nothing over the hero; from the work section on, it slides away while you scroll down and
 * comes back the moment you scroll up.
 *
 * They are two separate fixed pills on purpose, not one full-width bar: iOS Safari 26 tints its
 * status bar from a pinned box spanning the screen at the top edge (and keeps that colour while
 * the box exists). A pill is too narrow to count, wherever it is mid-slide.
 */

// the cat only ever draws inside this part of its 80px Lottie square (measured over all 480 frames)
const CAT = { box: 80, x0: 12, y0: 32.5, w: 54.5, h: 24, scale: 1.15 };
const catBox = CAT.box * CAT.scale;

/** distance a scroll must go in one direction before the bar reacts */
const NUDGE = 6;

export const Navigation = ({ revealStep }: { revealStep: number }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const lottieRef = useRef<{ handleHoverStart: () => void; handleHoverEnd: () => void } | null>(null);
  const onHome = useLocation().pathname === '/';
  const reduce = useReducedMotion();

  useEffect(() => {
    if (revealStep < 3) { setShown(false); return; }
    let lastY = window.scrollY, raf = 0;
    // in the zone once the work section has reached the top of the screen (or on any page without one)
    const inZone = () => {
      const work = document.getElementById('work');
      return work ? work.getBoundingClientRect().top <= 1 : !onHome;
    };
    const update = () => {
      raf = 0;
      const y = window.scrollY, dy = y - lastY;
      if (!inZone()) { setShown(false); lastY = y; return; }
      if (Math.abs(dy) < NUDGE) return;
      setShown(dy < 0);
      lastY = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [revealStep, onHome]);

  // the phone menu closes when the bar goes, on a tap elsewhere, and on Escape
  useEffect(() => { if (!shown) setMenuOpen(false); }, [shown]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: Event) => { if (!(e.target as Element).closest?.('[data-nav-menu]')) setMenuOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [menuOpen]);

  const visible = shown || menuOpen;
  const motionProps = {
    initial: { y: '-160%', opacity: 0 },
    animate: visible
      ? { y: '0%', opacity: 1, visibility: 'visible' as const }
      : { y: reduce ? '0%' : '-160%', opacity: 0, transitionEnd: { visibility: 'hidden' as const } },
    transition: { duration: reduce ? 0.2 : 0.42, ease: [0.22, 0.61, 0.36, 1] as const },
  };

  // On the home page these stay plain anchors so the existing scroll behaviour is untouched;
  // from anywhere else they route home first.
  const SectionLink = ({ to, className, onClick, children }: { to: string; className?: string; onClick?: () => void; children: ReactNode }) =>
    onHome
      ? <a href={`#${to}`} className={className} onClick={onClick}>{children}</a>
      : <Link to={`/#${to}`} className={className} onClick={onClick}>{children}</Link>;

  const toTop = (e: MouseEvent) => {
    if (!onHome) return;
    e.preventDefault();
    window.scrollTo({ top: pageTop(), behavior: reduce ? 'auto' : 'smooth' });
  };

  const links: [string, string][] = [['work', 'Work'], ['about', 'About'], ['about', 'Contact']];

  return (
    <>
      {/* name + cat */}
      <motion.div {...motionProps} className="nav-pill fixed left-4 top-[calc(0.75rem+env(safe-area-inset-top))] z-50 md:left-8 md:top-[calc(1.25rem+env(safe-area-inset-top))]">
        <Link to="/" onClick={toTop} aria-label="Keerthi Vardhan, back to the top"
          className="group flex h-full items-center gap-1.5 pl-4 pr-2.5 md:pl-5 md:pr-3"
          onMouseEnter={() => lottieRef.current?.handleHoverStart()}
          onMouseLeave={() => lottieRef.current?.handleHoverEnd()}>
          <span className="text-[15px] font-semibold tracking-[-0.01em] md:text-[16px]">Keerthi Vardhan</span>
          {/* a window onto the cat's drawing, so the pill stays slim */}
          <span aria-hidden className="relative block shrink-0 overflow-hidden" style={{ width: CAT.w * CAT.scale, height: CAT.h * CAT.scale }}>
            <span className="absolute block" style={{ left: -CAT.x0 * CAT.scale, top: -CAT.y0 * CAT.scale, width: catBox, height: catBox }}>
              <LottieAnimation ref={lottieRef} path="/lottie/Cat is sleeping and rolling.json" width={catBox} height={catBox} loop autoplay className="bg-transparent" />
            </span>
          </span>
        </Link>
      </motion.div>

      {/* the menu */}
      <motion.div {...motionProps} data-nav-menu className="nav-pill fixed right-4 top-[calc(0.75rem+env(safe-area-inset-top))] z-50 md:right-8 md:top-[calc(1.25rem+env(safe-area-inset-top))]">
        <nav aria-label="Main" className="hidden h-full items-center gap-1 px-2 md:flex">
          {links.map(([to, label]) => (
            <SectionLink key={label} to={to} className="nav-link rounded-full px-4 py-2 text-[14px] font-medium">{label}</SectionLink>
          ))}
        </nav>
        <button type="button" onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close the menu' : 'Open the menu'}
          className="flex h-full w-11 items-center justify-center md:hidden">
          <span className="relative block h-3 w-[18px]" aria-hidden>
            <span className={`absolute left-0 block h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ${menuOpen ? 'top-[5px] rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 block h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ${menuOpen ? 'top-[5px] -rotate-45' : 'top-[10px]'}`} />
          </span>
        </button>
      </motion.div>

      {/* the phone menu: its own small glass card under the pill (not inside it: a backdrop blur
          nested in another one would blur nothing) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div key="menu" data-nav-menu className="nav-card fixed right-4 top-[calc(0.75rem+44px+8px+env(safe-area-inset-top))] z-50 flex w-44 flex-col p-1.5 md:hidden"
            initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }} style={{ transformOrigin: 'top right' }}>
            {links.map(([to, label]) => (
              <SectionLink key={label} to={to} onClick={() => setMenuOpen(false)} className="nav-link rounded-[12px] px-4 py-3 text-[16px] font-medium">{label}</SectionLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
