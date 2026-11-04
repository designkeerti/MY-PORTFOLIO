import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { PaintedPortrait } from './hero/PaintedPortrait';
import { TOOLS, COMPANIES, type Tool, type Company } from './hero/tools';

const EASE = [0.22, 1, 0.36, 1] as const;

// Where each card sits around the portrait on wide screens.
const PIN = [
  'md:top-[8%] md:-left-[30%]',
  'md:top-[34%] md:-right-[14%]',
  'md:bottom-[24%] md:-left-[26%]',
  'md:bottom-[5%] md:-right-[6%]',
];

export const HeroSection = ({ onRevealStepChange }: { onRevealStepChange?: (step: number) => void }) => {
  const reduce = useReducedMotion();
  // Returning within the same browser session (e.g. back from a case study) skips the intro.
  const [skipIntro] = useState<boolean>(() => { try { return sessionStorage.getItem('introSeen') === '1'; } catch { return false; } });
  useEffect(() => { try { sessionStorage.setItem('introSeen', '1'); } catch { /* private mode */ } }, []);
  const instant = skipIntro || !!reduce;

  const [cardsIn, setCardsIn] = useState(-1);

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
      {/* No navbar over the hero: the page opens on the poster itself. */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1360px] grid-cols-1 gap-x-10 px-5 pb-10 pt-14 md:grid-cols-12 md:px-10 md:pt-16 lg:min-h-[100svh] lg:content-center">

        {/* Left: name and statement */}
        <div className="col-span-full flex flex-col justify-center md:col-span-6 lg:col-span-6">
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

        {/* Right: the painted portrait, with what I make around it */}
        <div className="col-span-full mt-14 md:col-span-6 md:mt-10 lg:col-span-5 lg:col-start-7">
          <figure className="relative mx-auto w-full max-w-[460px]">
            <PaintedPortrait
              src="/world/kitten-hug.jpg"
              focus={[0.5, 0.22]}
              detail={[0.46, 0.38, 0.22]}
              cues={TOOLS.length}
              onCue={i => setCardsIn(c => Math.max(c, i))}
              instant={instant}
              label="Keerthi Vardhan holding a calico cat close, painted in broad brush strokes"
              className="aspect-[4/5] w-full"
            />

            <div className="mt-6 grid grid-cols-2 gap-3 md:mt-0 md:block">
              {TOOLS.map((t, i) => (
                <ToolCard key={t.makes} tool={t} shown={cardsIn >= i} instant={instant} pos={PIN[i]} />
              ))}
            </div>
          </figure>
        </div>

        {/* Worked with */}
        <motion.div
          initial={instant ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: instant ? 0 : 1.1, ease: EASE }}
          className="col-span-full mt-16 border-t border-white/10 pt-6 md:mt-14"
        >
          {/* No visible label: the logos speak for themselves. Screen readers still get one. */}
          <ul aria-label="Companies I've worked with" className="grid grid-cols-3 items-center gap-x-6 gap-y-7 md:flex md:justify-between md:gap-8">
            {COMPANIES.map(c => <CompanyLogo key={c.name} c={c} />)}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

function ToolCard({ tool, shown, instant, pos }: { tool: Tool; shown: boolean; instant: boolean; pos: string }) {
  // On wide screens the cards land with the painting. On phones they sit
  // below it, so they also appear on their own once scrolled into view;
  // otherwise scrolling past quickly would leave empty slots.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [stacked, setStacked] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const on = () => setStacked(!mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const visible = instant || shown || (stacked && inView);
  return (
    <motion.div
      ref={ref}
      initial={instant ? false : { opacity: 0, y: 16 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`relative z-10 w-full rounded-2xl border border-white/10 bg-[#16131c]/80 p-4 text-[#f4efe6] shadow-[0_24px_48px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md md:absolute md:w-[212px] ${pos}`}
    >
      <div className="flex items-center gap-2 text-white/70">
        {tool.tools.map(x => (
          <span key={x.name} title={x.name} className="flex items-center">{x.mark}<span className="sr-only">{x.name}</span></span>
        ))}
      </div>
      <div className="mt-3 font-display text-[20px] italic leading-[1.05] md:text-[22px]">{tool.makes}</div>
      <p className="mt-1.5 text-[12px] leading-snug text-white/55">{tool.detail}</p>
    </motion.div>
  );
}

// Cream at rest so the row reads as one quiet line; the brand's own colours on hover.
function CompanyLogo({ c }: { c: Company }) {
  return (
    <li className="flex justify-center md:block">
      <a href={c.href} target="_blank" rel="noopener noreferrer" aria-label={c.name} title={c.name}
        className="group relative flex items-center gap-2 opacity-70 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100">
        <span className="relative block shrink-0" style={{ height: c.h }}>
          <img src={c.mono} alt="" draggable={false} className="block h-full w-auto transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0" />
          <img src={c.color} alt="" draggable={false} loading="lazy" className="absolute inset-0 block h-full w-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
        </span>
        {c.word && <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#f4efe6] md:text-[13px] md:tracking-[0.32em]">{c.word}</span>}
      </a>
    </li>
  );
}
