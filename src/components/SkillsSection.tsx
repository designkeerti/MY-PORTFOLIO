import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { setBack } from './sky/sky';
import { CompassIcon, PenIcon, SearchIcon, TapIcon, CodeIcon, MergeIcon } from './icons/SkillIcons';

/**
 * The toolkit, in the hero's language: the sky rolls back in over the burn as this
 * section arrives, and the skills sit on it as frosted glass cards with a pastel
 * icon chip whose line icon moves on hover.
 */

// soft pastel chips, as in the hero's skill cards
const CHIP = {
  lime: 'linear-gradient(135deg,#f0ffc4,#c9ef6f)',
  lilac: 'linear-gradient(135deg,#efe6ff,#c4adff)',
  peach: 'linear-gradient(135deg,#ffe7d6,#ffb68a)',
  sky: 'linear-gradient(135deg,#dcf2ff,#93d2f5)',
  rose: 'linear-gradient(135deg,#ffe3ec,#ffadc6)',
  mint: 'linear-gradient(135deg,#dcfbef,#8fe3c0)',
};

const skills: { title: string; desc: string; icon: ReactNode; chip: string }[] = [
  { title: 'UX Design', desc: 'Crafting intuitive journeys from wireframes to final prototypes.', icon: <CompassIcon />, chip: CHIP.sky },
  { title: 'UI Design', desc: 'Polishing pixels to create interfaces that feel magical.', icon: <PenIcon />, chip: CHIP.lilac },
  { title: 'UX Research', desc: "Digging deep into user data to find the 'why' behind the 'what'.", icon: <SearchIcon />, chip: CHIP.mint },
  { title: 'Prototyping', desc: 'Building interactive models to test, validate and iterate fast.', icon: <TapIcon />, chip: CHIP.peach },
  { title: 'Vibecoding', desc: "Injecting pure soul into code. If it doesn't feel alive, it's not done.", icon: <CodeIcon />, chip: CHIP.lime },
  { title: 'Collaboration', desc: 'Bringing positive energy and clear communication to every team.', icon: <MergeIcon />, chip: CHIP.rose },
];

export const SkillsSection = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // the sky rolls back in as this section rises into view (and back out on the way up)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 60%'] });
  useMotionValueEvent(scrollYProgress, 'change', v => setBack(v));
  useEffect(() => { setBack(scrollYProgress.get()); return () => setBack(0); }, [scrollYProgress]);

  return (
    <section ref={ref} className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-5 py-24 md:gap-16 md:px-8 md:py-36">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <span className="rounded-full border border-white/80 bg-white/55 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.22em] text-ink/70 backdrop-blur-md">My toolkit</span>
        <h2 className="section-title text-[clamp(34px,5vw,64px)] leading-[1.02] text-ink">
          Skills tailored for<br />world-class products.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {skills.map((s, i) => (
          <motion.div
            key={s.title}
            tabIndex={0}
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group flex flex-col gap-5 rounded-[20px] border border-white/80 bg-white/65 p-6 text-left text-ink shadow-[0_24px_50px_-30px_rgba(15,30,55,0.55)] outline-none backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ink/30 md:p-7"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-[13px] p-3 text-ink/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]" style={{ background: s.chip }}>
              {s.icon}
            </span>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[20px] font-semibold leading-tight tracking-[-0.01em] md:text-[22px]">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-ink/60">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
