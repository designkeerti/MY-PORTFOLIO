import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PortraitInSky } from './hero/PortraitInSky';
import { WorkOrbit, type OrbitClip } from './hero/WorkOrbit';
import { SkillCards, SkillGrid } from './hero/SkillCards';
import { COMPANIES, type Company } from './hero/tools';

const EASE = [0.22, 1, 0.36, 1] as const;

// The portrait (transparent background, head and shoulders), and the centre of the ring of
// work around it: low, round the chest and shoulders, so the face stays clear.
const PORTRAIT = { src: '/hero/portrait.webp', aspect: 1200 / 1428, ring: [0.5, 0.5] as [number, number] };

// The work orbiting: each project's reel (recorded from its animated preview), plus a Rive prototype.
const R = '/hero/reels/';
const CLIPS: OrbitClip[] = [
  { src: R + 'cbs.mp4', poster: R + 'cbs.jpg', label: 'Cross Border Supps reel' },
  { src: R + 'ekai.mp4', poster: R + 'ekai.jpg', label: 'ekai reel' },
  { src: R + 'misfits.mp4', poster: R + 'misfits.jpg', label: 'Misfits reel' },
  { src: '/videos/1dark.mp4', poster: R + 'rive.jpg', label: 'An interactive Rive prototype' },
  { src: R + 'dmrc.mp4', poster: R + 'dmrc.jpg', label: 'Delhi Metro reel' },
  { src: R + 'infinity.mp4', poster: R + 'infinity.jpg', label: 'Infinity reel' },
];

export const HeroSection = ({ onRevealStepChange }: { onRevealStepChange?: (step: number) => void }) => {
  const reduce = useReducedMotion();
  // Returning within the same browser session (e.g. back from a case study) skips the intro.
  const [skipIntro] = useState<boolean>(() => { try { return sessionStorage.getItem('introSeen') === '1'; } catch { return false; } });
  useEffect(() => { try { sessionStorage.setItem('introSeen', '1'); } catch { /* private mode */ } }, []);
  const instant = skipIntro || !!reduce;
  const [staged, setStaged] = useState(instant);

  useEffect(() => {
    // the rest of the page and the nav don't wait for the intro
    const ids = [setTimeout(() => onRevealStepChange?.(3), instant ? 0 : 900)];
    if (!instant) ids.push(setTimeout(() => setStaged(true), 300));
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
      <div className="relative mx-auto flex w-full max-w-[1360px] flex-col items-center px-5 pt-12 text-center md:px-10 md:pt-14">

        {/* The type, centred */}
        <div className="relative z-30 flex flex-col items-center">
          <h1 className="leading-[0.86] text-ink">
            <motion.span {...rise(0.05)} className="hero-name-1 block">Keerthi</motion.span>
            <motion.span {...rise(0.15)} className="hero-name-2 block">Vardhan</motion.span>
          </h1>
          <motion.p {...rise(0.3)} className="mt-5 max-w-[40ch] text-[clamp(16px,1.35vw,19px)] leading-snug text-ink/80">
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

        {/* Me, standing in the sky, with the work orbiting round me */}
        <div
          className="relative z-10 mt-4 [--stage-w:74vw] sm:[--stage-w:56vw] lg:[--stage-w:min(500px,36vw)]"
          style={{ width: 'var(--stage-w)', height: `calc(var(--stage-w) / ${PORTRAIT.aspect})` }}
        >
          <WorkOrbit clips={CLIPS} centre={PORTRAIT.ring} shown={staged} className="absolute inset-0">
            <PortraitInSky src={PORTRAIT.src} alt="Keerthi Vardhan laughing, head tilted back, in a white shirt" shown={staged} className="absolute inset-0 h-full w-full" />
          </WorkOrbit>
        </div>

        {/* What I make: floating either side of me on wide screens */}
        <SkillCards shown={staged} />
        <SkillGrid shown={staged} />

        {/* Worked with. No visible label; screen readers get one. */}
        <motion.ul
          {...rise(0.6)}
          aria-label="Companies I've worked with"
          className="relative z-30 mt-10 grid w-full max-w-[1100px] grid-cols-3 items-center justify-items-center gap-x-6 gap-y-6 pb-14 md:flex md:justify-between lg:-mt-16"
        >
          {COMPANIES.map(c => <CompanyLogo key={c.name} c={c} />)}
        </motion.ul>
      </div>
    </section>
  );
};

// One ink colour at rest so the row reads as one quiet line; the brand's own colours on hover.
function CompanyLogo({ c }: { c: Company }) {
  return (
    <li className="flex justify-center">
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
