import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { OrbitStage, type OrbitItem } from './hero/OrbitStage';
import { ForegroundClouds } from './sky/ForegroundClouds';
import { TOOLS, COMPANIES, type Tool, type Company } from './hero/tools';

const EASE = [0.22, 1, 0.36, 1] as const;

// The portrait (background removed) and where the head sits in it, for the ring.
const PORTRAIT = { src: '/hero/portrait.webp', aspect: 1100 / 1311, head: [0.36, 0.29] as [number, number] };

// Orbiting the head: the work, in motion, and the cats.
const ORBIT: OrbitItem[] = [
  { kind: 'video', src: '/videos/2dark.mp4', alt: 'Cross Border Supps storefront on a phone' },
  { kind: 'image', src: '/world/cats-turf.jpg', alt: 'Two cats on a lawn' },
  { kind: 'video', src: '/videos/1dark.mp4', alt: 'An interactive motion prototype' },
  { kind: 'video', src: '/work/ekai/b4LEGCUCaclrfhX51x9RUiUasM.mp4', alt: 'The ekai website' },
  { kind: 'image', src: '/world/cat-bench.jpg', alt: 'A cat on a bench' },
  { kind: 'video', src: '/videos/1light.mp4', alt: 'A body-profile app flow' },
  { kind: 'image', src: '/world/kitten-hug.jpg', alt: 'Keerthi hugging a kitten' },
  { kind: 'video', src: '/videos/2light.mp4', alt: 'ekai joining a meeting' },
];

// Where each card floats beside the portrait on wide screens.
const PIN = [
  'lg:left-[2%] lg:top-[40%]',
  'lg:right-[2%] lg:top-[36%]',
  'lg:left-[7%] lg:top-[66%]',
  'lg:right-[7%] lg:top-[63%]',
];

export const HeroSection = ({ onRevealStepChange }: { onRevealStepChange?: (step: number) => void }) => {
  const reduce = useReducedMotion();
  // Returning within the same browser session (e.g. back from a case study) skips the intro.
  const [skipIntro] = useState<boolean>(() => { try { return sessionStorage.getItem('introSeen') === '1'; } catch { return false; } });
  useEffect(() => { try { sessionStorage.setItem('introSeen', '1'); } catch { /* private mode */ } }, []);
  const instant = skipIntro || !!reduce;

  const [staged, setStaged] = useState(instant);
  const [cardsIn, setCardsIn] = useState(instant ? TOOLS.length : -1);
  // a smaller ring on phones, so the panels don't cover the face as much
  const [small] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    // the rest of the page and the nav don't wait for the intro
    const ids = [setTimeout(() => onRevealStepChange?.(3), instant ? 0 : 900)];
    if (!instant) {
      ids.push(setTimeout(() => setStaged(true), 350));
      TOOLS.forEach((_, i) => ids.push(setTimeout(() => setCardsIn(c => Math.max(c, i)), 1100 + i * 220)));
    }
    return () => ids.forEach(clearTimeout);
  }, [instant, onRevealStepChange]);

  const rise = (delay: number) => ({
    initial: instant ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE },
  });

  return (
    <section className="hero-poster relative w-full overflow-hidden">
      {/* No navbar over the hero: the page opens on the poster itself. */}
      <div className="relative mx-auto flex w-full max-w-[1360px] flex-col items-center px-5 pt-12 md:px-10 md:pt-14">

        {/* The type, centred */}
        <div className="relative z-30 flex flex-col items-center text-center">
          <h1 className="leading-[0.86] text-ink">
            <motion.span {...rise(0.05)} className="hero-name-1 block">Keerthi</motion.span>
            <motion.span {...rise(0.15)} className="hero-name-2 block">Vardhan</motion.span>
          </h1>
          <motion.p {...rise(0.3)} className="mt-5 max-w-[42ch] text-[clamp(16px,1.35vw,19px)] leading-snug text-ink/80">
            Product designer. I design interfaces, motion and systems, and take them all the way to <span className="font-display font-bold text-ink">production.</span>
          </motion.p>
          <motion.div {...rise(0.42)} className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href="#work" className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5">
              See the work
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </a>
            <a href="#about" className="inline-flex items-center rounded-full border border-ink/25 bg-white/30 px-5 py-3 text-sm font-medium text-ink backdrop-blur-sm transition-colors duration-300 hover:border-ink/60">
              Get in touch
            </a>
          </motion.div>
        </div>

        {/* The portrait, with the work and the cats orbiting, rising out of the clouds */}
        <div className="relative z-10 mt-2 flex w-full justify-center [--stage-w:86vw] sm:[--stage-w:60vw] lg:[--stage-w:min(470px,36vw)]">
          <OrbitStage
            portrait={PORTRAIT.src}
            portraitAlt="Keerthi Vardhan laughing, head tilted back"
            aspect={PORTRAIT.aspect}
            head={PORTRAIT.head}
            items={ORBIT}
            radius={small ? 0.54 : 0.6}
            panel={small ? [0.24, 0.17] : [0.3, 0.21]}
            shown={staged}
          />
          {/* the same clouds as the sky, banked up in front of the portrait */}
          <ForegroundClouds className="absolute -bottom-[14%] left-1/2 z-20 h-[72%] w-screen -translate-x-1/2" />
        </div>

        {/* What I make: floating beside the portrait on wide screens */}
        <div className="pointer-events-none absolute inset-0 z-30 hidden lg:block">
          {TOOLS.map((t, i) => (
            <ToolCard key={t.makes} tool={t} shown={cardsIn >= i} instant={instant} pos={`absolute pointer-events-auto ${PIN[i]}`} />
          ))}
        </div>

        {/* Worked with: sitting on the cloud bank */}
        <motion.div
          initial={instant ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: instant ? 0 : 1.2, ease: EASE }}
          className="relative z-30 -mt-16 w-full pb-10 md:-mt-20"
        >
          {/* No visible label: the logos speak for themselves. Screen readers still get one. */}
          <ul aria-label="Companies I've worked with" className="grid grid-cols-3 items-center gap-x-6 gap-y-7 md:flex md:justify-between md:gap-8">
            {COMPANIES.map(c => <CompanyLogo key={c.name} c={c} />)}
          </ul>
        </motion.div>

        {/* What I make, on phones and tablets: below */}
        <div className="relative z-30 grid w-full grid-cols-2 gap-3 pb-12 lg:hidden">
          {TOOLS.map((t, i) => <ToolCard key={t.makes} tool={t} shown={cardsIn >= i} instant={instant} pos="" />)}
        </div>
      </div>
    </section>
  );
};

function ToolCard({ tool, shown, instant, pos }: { tool: Tool; shown: boolean; instant: boolean; pos: string }) {
  // On wide screens the cards land one by one with the intro. On phones they
  // sit further down, so they also appear on their own once scrolled into view.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [stacked, setStacked] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
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
      className={`${pos.includes('absolute') ? '' : 'relative'} z-10 w-full rounded-2xl border border-white/70 bg-white/60 p-4 text-ink shadow-[0_24px_48px_-24px_rgba(20,40,70,0.45)] backdrop-blur-md lg:w-[212px] ${pos}`}
    >
      <div className="flex items-center gap-2 text-ink/75">
        {tool.tools.map(x => (
          <span key={x.name} title={x.name} className="flex items-center">{x.mark}<span className="sr-only">{x.name}</span></span>
        ))}
      </div>
      <div className="mt-3 font-display text-[20px] leading-[1.05] md:text-[22px]">{tool.makes}</div>
      <p className="mt-1.5 text-[12px] leading-snug text-ink/65">{tool.detail}</p>
    </motion.div>
  );
}

// One ink colour at rest so the row reads as one quiet line; the brand's own colours on hover.
function CompanyLogo({ c }: { c: Company }) {
  return (
    <li className="flex justify-center md:block">
      <a href={c.href} target="_blank" rel="noopener noreferrer" aria-label={c.name} title={c.name}
        className="group relative flex items-center gap-2 opacity-70 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100">
        <span className="relative block shrink-0" style={{ height: c.h }}>
          <img src={c.mono} alt="" draggable={false} className="block h-full w-auto brightness-0 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0" />
          <img src={c.color} alt="" draggable={false} loading="lazy" className="absolute inset-0 block h-full w-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
        </span>
        {c.word && <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink md:text-[13px] md:tracking-[0.32em]">{c.word}</span>}
      </a>
    </li>
  );
}
