import { motion, motionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useHeroParallax } from './hero/useHeroParallax';
import { PortraitInSky } from './hero/PortraitInSky';
import { WorkOrbit, type OrbitClip } from './hero/WorkOrbit';
import { SkillCards, SkillGrid } from './hero/SkillCards';
import { CompanyShowcase } from './hero/CompanyShowcase';

const EASE = [0.22, 1, 0.36, 1] as const;

// a progress value that is simply 'fully in' (for the reduced-motion layout)
const STATIC_ONE = motionValue(1);

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
  // pointer parallax on the sky, skill cards and logos (the name and portrait stay put)
  const heroRef = useRef<HTMLElement>(null);
  useHeroParallax(heroRef);

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

  // The scroll sequence. The hero is pinned for a while (the section is taller than the
  // screen and its content sticks); progress p runs 0 -> 1 across that scroll:
  //   name stays put · the buttons fade · I (and the orbit) sink out of view ·
  //   the skill cards shoot off to the sides · the companies rise in and settle.
  const pinned = !reduce;
  const { scrollYProgress: p } = useScroll({ target: heroRef, offset: ['start start', 'end end'] });
  const ctaOpacity = useTransform(p, [0, 0.1], [1, 0]);
  const ctaY = useTransform(p, [0, 0.1], [0, -12]);
  const stageY = useTransform(p, [0.02, 0.4], ['0svh', '80svh']);
  const stageOpacity = useTransform(p, [0.26, 0.4], [1, 0]);
  const cardsExit = useTransform(p, [0.02, 0.4], [0, 1]);
  // the companies start rising while I'm still sinking, so there's no empty moment
  const companiesIn = useTransform(p, [0.16, 0.66], [0, 1]);

  return (
    <>
    <section ref={heroRef} className="hero-poster relative w-full" style={{ height: pinned ? '280svh' : undefined }}>
      {/* No navbar over the hero: the page opens on the poster itself. */}
      <div className={pinned ? 'sticky top-0 h-[100svh] overflow-hidden' : 'relative'}>
        <div className="relative mx-auto flex h-full w-full max-w-[1360px] flex-col items-center px-5 pt-[calc(3rem+env(safe-area-inset-top))] text-center md:px-10 md:pt-[calc(3.5rem+env(safe-area-inset-top))]">

          {/* The type, centred. The name stays where it is throughout. */}
          <div className="relative z-30 flex flex-col items-center">
            <h1 className="leading-[0.86] text-ink">
              <motion.span {...rise(0.05)} className="hero-name-1 block">Keerthi</motion.span>
              <motion.span {...rise(0.15)} className="hero-name-2 block">Vardhan</motion.span>
            </h1>
            <motion.p {...rise(0.3)} className="mt-5 max-w-[40ch] text-[clamp(16px,1.35vw,19px)] leading-snug text-ink/80">
              Product designer. I design interfaces, motion and systems, and take them all the way to <span className="font-display font-bold text-ink">production.</span>
            </motion.p>
            <motion.div style={pinned ? { opacity: ctaOpacity, y: ctaY } : undefined}>
              <motion.div {...rise(0.42)} className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a href="#work" className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5">
                  See the work
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
                </a>
                <a href="#about" className="inline-flex items-center rounded-full border border-ink/25 bg-white/30 px-5 py-3 text-sm font-medium text-ink backdrop-blur-sm transition-colors duration-300 hover:border-ink/60">
                  Get in touch
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Me, standing in the sky, with the work orbiting round me; sinks away on scroll */}
          <motion.div
            className="relative z-10 mt-4 [--stage-w:70vw] sm:[--stage-w:54vw] lg:[--stage-w:min(500px,36vw)]"
            style={{ width: 'var(--stage-w)', height: `calc(var(--stage-w) / ${PORTRAIT.aspect})`, ...(pinned ? { y: stageY, opacity: stageOpacity } : {}) }}
          >
            <WorkOrbit clips={CLIPS} centre={PORTRAIT.ring} shown={staged} className="absolute inset-0">
              <PortraitInSky src={PORTRAIT.src} alt="Keerthi Vardhan laughing, head tilted back, in a white shirt" shown={staged} className="absolute inset-0 h-full w-full" />
            </WorkOrbit>
          </motion.div>

          {/* What I make: floating either side of me on wide screens; shoots off on scroll */}
          <SkillCards shown={staged} exit={pinned ? cardsExit : undefined} />

          {/* The companies rise into the space the portrait leaves */}
          {pinned && (
            <div className="pointer-events-none absolute inset-x-0 bottom-[max(4svh,env(safe-area-inset-bottom))] top-[31svh] z-40 flex items-center justify-center px-5 md:top-[34svh] md:px-10">
              <CompanyShowcase enter={companiesIn} className="pointer-events-auto max-w-[920px]" />
            </div>
          )}
        </div>
      </div>

      {/* Without the scroll sequence (reduced motion), everything simply follows on */}
      {!pinned && (
        <div className="mx-auto flex max-w-[1360px] flex-col items-center gap-10 px-5 pb-16 md:px-10">
          <SkillGrid shown={staged} />
          <CompanyShowcase enter={STATIC_ONE} className="max-w-[920px]" />
        </div>
      )}
    </section>

    {/* Phones and tablets: the skill cards (which float beside me on wide screens) follow the sequence */}
    {pinned && (
      <div className="mx-auto flex max-w-[560px] justify-center px-5 pb-16 lg:hidden">
        <SkillGrid shown={staged} />
      </div>
    )}
    </>
  );
};

