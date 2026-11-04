import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PaintedPortrait } from './hero/PaintedPortrait';
import { TOOLS, COMPANIES, type Tool } from './hero/tools';

const EASE = [0.22, 1, 0.36, 1] as const;

// Where each card is pinned around the portrait on wide screens.
const PIN = [
  { pos: 'md:top-[6%] md:-left-[30%]', rot: -4 },
  { pos: 'md:top-[30%] md:-right-[10%]', rot: 3 },
  { pos: 'md:bottom-[22%] md:-left-[26%]', rot: 2.5 },
  { pos: 'md:bottom-[3%] md:-right-[6%]', rot: -3 },
];

export const HeroSection = ({ onRevealStepChange }: { onRevealStepChange?: (step: number) => void }) => {
  const reduce = useReducedMotion();
  // Returning within the same browser session (e.g. back from a case study) skips the intro.
  const [skipIntro] = useState<boolean>(() => { try { return sessionStorage.getItem('introSeen') === '1'; } catch { return false; } });
  useEffect(() => { try { sessionStorage.setItem('introSeen', '1'); } catch { /* private mode */ } }, []);
  const instant = skipIntro || !!reduce;

  const [cardsIn, setCardsIn] = useState(-1);
  const [painted, setPainted] = useState(false);

  // The rest of the page and the nav don't wait for the painting.
  useEffect(() => {
    const id = setTimeout(() => onRevealStepChange?.(3), instant ? 0 : 900);
    return () => clearTimeout(id);
  }, [instant, onRevealStepChange]);

  const rise = (delay: number) => ({
    initial: instant ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section className="hero-poster relative w-full overflow-hidden">
      {/* roughens the paint swatches on the cards */}
      <svg aria-hidden className="absolute h-0 w-0">
        <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="4" /></filter>
      </svg>
      <div className="relative z-10 mx-auto grid w-full max-w-[1360px] grid-cols-1 gap-x-10 px-5 pb-10 pt-24 md:grid-cols-12 md:px-10 md:pt-28 lg:min-h-[100svh]">

        {/* Poster header */}
        <motion.div {...rise(0)} className="col-span-full flex items-center justify-between border-b border-white/15 pb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55 md:text-[11px]">
          <span>Portfolio · Vol. 2026</span>
          <span className="hidden md:inline">Product designer</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#7fd99a]" />Open to work</span>
        </motion.div>

        {/* Left: name and statement */}
        <div className="col-span-full flex flex-col justify-center pt-10 md:col-span-6 md:pt-0 lg:col-span-6">
          <h1 className="leading-[0.86] text-[#f4efe6]">
            <motion.span {...rise(0.1)} className="block font-display text-[clamp(64px,10.5vw,156px)] italic tracking-[-0.01em]">Keerthi</motion.span>
            <motion.span {...rise(0.22)} className="block text-[clamp(56px,9.4vw,140px)] font-black tracking-[-0.045em]">Vardhan</motion.span>
          </h1>

          <motion.p {...rise(0.4)} className="mt-8 max-w-[30ch] text-[clamp(18px,1.6vw,22px)] leading-snug text-white/75">
            Product designer. I design interfaces, motion and systems, and take them all the way to <span className="font-display text-[1.15em] italic text-[#f4efe6]">production.</span>
          </motion.p>

          <motion.div {...rise(0.52)} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#work" className="group inline-flex items-center gap-2 rounded-full bg-[#f4efe6] px-5 py-3 text-sm font-medium text-[#14121a] transition-transform duration-300 hover:-translate-y-0.5">
              See the work
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </a>
            <a href="#about" className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white/85 transition-colors duration-300 hover:border-white/50">
              Get in touch
            </a>
          </motion.div>
        </div>

        {/* Right: the painted portrait, with the tools pinned around it */}
        <div className="col-span-full mt-14 md:col-span-6 md:mt-10 lg:col-span-5 lg:col-start-7">
          <figure className="relative mx-auto w-full max-w-[460px]">
            <PaintedPortrait
              src="/work/home/HJQw8ElsRLJCST5Te5LibBGNdY.webp"
              focus={[0.42, 0.3]}
              toolColors={TOOLS.map(t => t.color)}
              onToolStroke={i => setCardsIn(c => Math.max(c, i))}
              onDone={() => setPainted(true)}
              instant={instant}
              label="Portrait of Keerthi Vardhan, laughing on a Delhi Metro platform, painted in broad brush strokes"
              className="aspect-[4/5] w-full"
            />

            <div className="mt-6 grid grid-cols-2 gap-3 md:mt-0 md:block">
              {TOOLS.map((t, i) => (
                <ToolCard key={t.makes} tool={t} index={i} shown={cardsIn >= i} instant={instant} pin={PIN[i]} />
              ))}
            </div>

            <motion.figcaption
              initial={instant ? false : { opacity: 0 }}
              animate={{ opacity: painted || instant ? 1 : 0 }}
              transition={{ duration: 0.8 }}
              className="mt-5 max-w-[34ch] font-mono text-[10px] uppercase tracking-[0.16em] text-white/45"
            >
              Fig. 1: Self-portrait. Figma, Rive, Adobe and code on canvas.
            </motion.figcaption>
          </figure>
        </div>

        {/* Worked with */}
        <motion.div
          initial={instant ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: instant ? 0 : 1.1, ease: EASE }}
          className="col-span-full mt-16 border-t border-white/15 pt-5 md:mt-12"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-[auto_repeat(4,minmax(0,1fr))] md:items-baseline md:gap-x-10">
            <span className="col-span-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 md:col-span-1">Worked with</span>
            {COMPANIES.map(c => {
              const inner = (
                <>
                  <span className="block text-[17px] font-bold tracking-[-0.01em] text-[#f4efe6] md:text-[19px]">{c.name}</span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">{c.role} · {c.year}</span>
                </>
              );
              return c.href
                ? <Link key={c.name} to={c.href} className="group transition-opacity hover:opacity-80">{inner}</Link>
                : <div key={c.name}>{inner}</div>;
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

function ToolCard({ tool, index, shown, instant, pin }: { tool: Tool; index: number; shown: boolean; instant: boolean; pin: { pos: string; rot: number } }) {
  return (
    <motion.div
      initial={instant ? false : { opacity: 0, y: 24, rotate: 0, scale: 0.94 }}
      animate={shown || instant ? { opacity: 1, y: 0, rotate: pin.rot, scale: 1 } : { opacity: 0, y: 24, rotate: 0, scale: 0.94 }}
      whileHover={{ rotate: 0, y: -4, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`relative z-10 w-full rounded-[12px] bg-[#f4efe6] p-3 text-[#17141d] md:rounded-[14px] md:p-3.5 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.65)] md:absolute md:w-[205px] ${pin.pos}`}
    >
      {/* a swatch of this card's paint */}
      <span aria-hidden className="absolute -top-1.5 left-4 h-3 w-14 rounded-full" style={{ background: tool.color, filter: 'url(#rough)' }} />
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-black/45">
        <span>({String(index + 1).padStart(2, '0')})</span>
        <span className="flex items-center gap-1.5">
          {tool.tools.map(x => (
            <span key={x.name} title={x.name} className="flex items-center gap-1 text-black/70">{x.mark}<span className="sr-only">{x.name}</span></span>
          ))}
        </span>
      </div>
      <div className="mt-2 font-display text-[19px] italic leading-[1.05] md:mt-2.5 md:text-[22px]">{tool.makes}</div>
      <p className="mt-1.5 text-[11px] leading-snug text-black/60 md:text-[12px]">{tool.detail}</p>
    </motion.div>
  );
}
