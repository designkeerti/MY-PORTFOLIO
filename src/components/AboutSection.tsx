import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { setBack } from './sky/sky';
import type { ReactNode } from 'react';
import { BallIcon, PenIcon, BookIcon } from './icons/SkillIcons';
import { CatStory } from './cats/CatStory';
import { CardCat } from './cats/CardCat';

/**
 * About, in the language of the rest of the site: frosted glass on the returning sky,
 * Chillax only for the section title (card headings in the work cards' face), quiet uppercase eyebrows, label-and-value chips as in the
 * case studies, hairline rules instead of coloured tiles. One sheet holds the portrait
 * and the bio; under it, the quote and the offline interests; then the footer.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
// light glass, as the case studies' frames; .ink-dark keeps its text dark while the page is burned
const GLASS = 'ink-dark rounded-[28px] border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_40px_80px_-44px_rgba(15,30,55,0.6)] md:rounded-[32px]';
const EYEBROW = 'text-[12px] font-medium uppercase tracking-[0.24em] text-ink/50';

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -10% 0px' },
  transition: { duration: 0.9, delay, ease: EASE },
});

const INTERESTS = [
  { icon: <BallIcon />, title: 'Basketball', desc: 'Teamwork & rhythm' },
  { icon: <PenIcon />, title: 'Poetry', desc: 'Finding clarity in verse' },
  { icon: <BookIcon />, title: 'Novels', desc: 'Exploring new worlds' },
];

const SOCIALS = [
  { href: 'https://www.linkedin.com/in/vardhankeerti/', label: 'LinkedIn' },
  { href: 'https://x.com/ikeerthivardhan', label: 'Twitter' },
  { href: 'https://www.instagram.com/poemsbyraahgir/', label: 'Instagram' },
  { href: 'mailto:design.keerti@gmail.com', label: 'Email' },
];

export const AboutSection = () => {
  // the sky rolls back in over the burn as this section rises into view (and back out on the way up)
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 60%'] });
  useMotionValueEvent(scrollYProgress, 'change', v => setBack(v));
  useEffect(() => { setBack(scrollYProgress.get()); return () => setBack(0); }, [scrollYProgress]);

  return (
    <section ref={ref} id="about" className="relative z-10 w-full scroll-mt-16 px-4 pb-10 pt-24 md:px-8 md:pb-14 md:pt-36">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col">
        <motion.header {...rise()} className="mb-8 flex flex-col items-center text-center md:mb-14">
          <p className={EYEBROW}>About me</p>
          <h2 className="section-title mt-3 text-[clamp(34px,5vw,64px)] leading-[1.02] text-ink">More than just pixels.</h2>
        </motion.header>

        {/* the portrait and the bio, on one sheet */}
        <motion.article {...rise(0.05)} className={`${GLASS} relative grid gap-2 p-2 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-4 md:p-3`}>
          <CardCat id="about-bio" size="lg" />
          <figure className="relative aspect-[4/5] overflow-hidden rounded-[22px] md:aspect-auto md:min-h-[520px] md:rounded-[24px]">
            <img src="/work/home/HJQw8ElsRLJCST5Te5LibBGNdY.webp" alt="Keerthi Vardhan, smiling, on a metro platform"
              loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[60%_30%]" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
            <figcaption className="absolute bottom-5 left-5 text-white md:bottom-6 md:left-6">
              <span className="block text-[15px] font-semibold">That’s me.</span>
              <span className="block text-[13px] text-white/75">Always smiling</span>
            </figcaption>
          </figure>

          <div className="flex flex-col justify-between gap-10 px-4 pb-5 pt-6 md:px-8 md:py-10 lg:px-12 lg:py-12">
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <h3 className="font-display text-[clamp(28px,3vw,38px)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink">I’m Keerthi Vardhan.</h3>
                <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5">
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#2f9e6a]/60 motion-reduce:hidden" />
                    <span className="relative h-2 w-2 rounded-full bg-[#2f9e6a]" />
                  </span>
                  <span className="text-[11.5px] font-medium uppercase tracking-[0.18em] text-ink/70">Open to work</span>
                </span>
              </div>
              <p className="mt-5 font-display text-[clamp(19px,1.8vw,24px)] font-medium leading-snug text-ink/55">
                Designing with purpose, heart, &amp; <span className="text-ink">rhythm.</span>
              </p>
              <p className="mt-6 max-w-[54ch] text-[16px] leading-[1.7] text-ink/70 md:text-[17px]">
                I’m an experience designer. I started with a{' '}
                <span className="font-medium text-ink">B.Tech in Aerospace Engineering</span>, then went on to a{' '}
                <span className="font-medium text-ink">Master’s in UX Design</span>, so the road here hasn’t exactly been
                ordinary. What I bring to every project is empathy, a lot of curiosity and a bit of fun.
              </p>
              <p className="mt-4 max-w-[54ch] text-[16px] leading-[1.7] text-ink/70 md:text-[17px]">
                I love exploring new ideas, and I’ll happily try anything I haven’t done before, whether it’s a new tool,
                a new medium or a new way of working. <span className="font-medium text-ink">Freedom</span> matters a lot
                to me too: room to wander, follow what interests me and choose my own path. It’s what keeps me curious.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="/resume.pdf" download
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5">
                Download resume
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </a>
              <a href="mailto:design.keerti@gmail.com"
                className="inline-flex items-center justify-center rounded-full border border-ink/20 bg-white/40 px-6 py-3.5 text-[15px] font-medium text-ink transition-colors duration-300 hover:border-ink/50">
                Send me a message
              </a>
            </div>
          </div>
        </motion.article>

        <div className="mt-2 grid gap-2 md:mt-4 md:grid-cols-2 md:gap-4">
          {/* the quote, set large, like a line on a poster */}
          <QuoteCard />

          {/* offline: a short list on hairlines */}
          <motion.div {...rise(0.15)} className={`${GLASS} relative flex flex-col justify-between gap-8 p-7 md:p-10`}>
            <CardCat id="about-offline" size="lg" />
            <p className={EYEBROW}>Offline mode</p>
            <ul className="divide-y divide-ink/10 border-t border-ink/10">
              {INTERESTS.map(i => <Interest key={i.title} {...i} />)}
            </ul>
          </motion.div>
        </div>

        <motion.footer {...rise()} className="mt-20 flex flex-col items-center gap-6 border-t border-ink/15 pt-8 md:mt-28 md:flex-row md:justify-between">
          <div className="order-2 text-center md:order-1 md:text-left">
            <p className="font-display text-[20px] font-semibold tracking-[-0.02em] text-ink">Keerthi Vardhan</p>
            <p className="mt-1 text-[13px] text-ink/55">© {new Date().getFullYear()}. Vibecoded the shit out of this.</p>
          </div>
          <nav aria-label="Elsewhere" className="order-1 flex flex-wrap justify-center gap-2 md:order-2">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/60 px-4 py-2 text-[14px] font-medium text-ink/75 backdrop-blur-md transition-colors duration-300 hover:bg-white/85 hover:text-ink">
                {s.label}
                <span aria-hidden className="text-ink/40 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
              </a>
            ))}
          </nav>
        </motion.footer>
      </div>
    </section>
  );
};

// The quote, set large, over a little story that keeps playing: the cats come to be fed
function QuoteCard() {
  return (
    <motion.figure {...rise(0.1)} className={`${GLASS} relative flex min-h-[320px] flex-col gap-4 overflow-hidden p-7 md:min-h-[420px] md:p-10`}>
      <p className={EYEBROW}>The real goal</p>
      <CatStory className="min-h-[110px] flex-1" />
      <blockquote className="font-display text-[clamp(26px,2.6vw,36px)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink">
        <span aria-hidden className="-ml-[0.42em]">“</span>I just want to be rich enough to feed every animal around me.”
      </blockquote>
    </motion.figure>
  );
}

const Interest = ({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) => (
  <li className="group flex items-center gap-4 py-4 md:py-5">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-white/60 p-[11px] text-ink/70">{icon}</span>
    <span className="min-w-0 flex-1 font-display text-[20px] font-semibold leading-tight tracking-[-0.01em] text-ink md:text-[22px]">{title}</span>
    <span className="text-right text-[14px] text-ink/50 md:text-[15px]">{desc}</span>
  </li>
);
