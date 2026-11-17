import { useEffect, useRef } from 'react';
import { TransitionLink } from './PageTransition';
import { projects } from '../content/projects';
import type { Project } from '../content/types';
import { CardCat } from './cats/CardCat';

/**
 * The work, as calm cards: a soft gradient panel (tinted by the project's accent)
 * holding the project's reel, a centred headline, one plain line, a compact strip
 * of facts with dashed dividers, and one clear button. Modelled on clean
 * product onboarding screens rather than portfolio collages.
 */

// One short, editorial headline per project (the long titles live in the case studies).
const HEADLINE: Record<string, string> = {
  cbs: 'Proof the box is real.',
  ekai: 'An AI twin, made clear.',
  misfits: 'Clubs that actually meet.',
  dmrc: 'Untangling the interchange.',
  infinity: 'Trust, built in the open.',
};

// dark text on light accents, white on deep ones
const onAccent = (hex: string) => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150 ? '#141312' : '#ffffff';
};

const firstSentence = (s: string) => (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim();

function Reel({ slug, label }: { slug: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  // play only while on screen
  useEffect(() => {
    const v = ref.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} src={`/hero/reels/${slug}.mp4`} poster={`/hero/reels/${slug}.jpg`} muted loop playsInline preload="none"
      aria-label={label} className="block aspect-[16/10] w-full rounded-[14px] object-cover shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)]" />
  );
}

// one compact strip of facts, split by dashed dividers
function Facts({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 flex w-full divide-x divide-dashed divide-white/15 rounded-[16px] border border-white/10">
      {items.map(t => (
        <li key={t} className="min-w-0 flex-1 truncate px-3 py-2.5 text-center text-[13px] leading-tight text-white/70" title={t}>{t}</li>
      ))}
    </ul>
  );
}

function WorkCard({ p }: { p: Project }) {
  const { meta } = p;
  const accent = meta.accent;
  const href = p.externalLink ?? `/work/${meta.slug}`;
  const internal = !p.externalLink;
  const button = (
    <>
      View case study
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden><path d="M5 12h14M12 5l7 7-7 7" /></svg>
    </>
  );
  const btnClass = 'group mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[15px] font-medium transition-transform duration-300 hover:-translate-y-0.5';
  return (
    <article className="relative flex w-full flex-col rounded-[32px] border border-white/[0.07] bg-[#141312] p-3 md:w-[calc(50%-12px)] md:p-4">
      <CardCat id={`work-${meta.slug}`} size="lg" tone="dark" />
      {/* the reel, on a soft panel in the project's colour */}
      <div className="rounded-[24px] px-[7%] py-[6%]"
        style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 26%, #ffffff) 0%, color-mix(in srgb, ${accent} 82%, #0c0b0a) 100%)` }}>
        <Reel slug={meta.slug} label={`${meta.company}: project reel`} />
      </div>

      <div className="flex flex-col items-center px-3 pb-2 pt-6 text-center md:px-6">
        <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-white/40">{meta.company} · {meta.year}</p>
        <h3 className="mt-2 text-[clamp(28px,3vw,38px)] font-semibold leading-[1.02] tracking-[-0.02em] text-[#f1ece4]">{HEADLINE[meta.slug] ?? meta.title}</h3>
        <p className="mt-3 line-clamp-2 max-w-[42ch] text-[15px] leading-[1.5] text-white/60">{firstSentence(meta.oneLiner)}</p>

        <Facts items={[meta.role, (p.facts ?? [])[1]].filter(Boolean) as string[]} />

        {internal
          ? <TransitionLink to={href} className={btnClass} style={{ background: accent, color: onAccent(accent) }}>{button}</TransitionLink>
          : <a href={href} target="_blank" rel="noopener noreferrer" className={btnClass} style={{ background: accent, color: onAccent(accent) }}>{button}</a>}
      </div>
    </article>
  );
}

export const WorkCards = () => (
  <div id="work" className="work-flow">
    <section className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-col items-center gap-8 px-4 pb-24 pt-6">
      <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-white/45">Selected work</p>
      <div className="flex w-full flex-wrap justify-center gap-6">
        {projects.map(p => <WorkCard key={p.meta.slug} p={p} />)}
      </div>
    </section>
  </div>
);
