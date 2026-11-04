import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { projects, bySlug } from '../content/projects';
import { PreviewPlayer } from '../previews/PreviewPlayer';
import { BlockView } from '../casestudy/Blocks';
import { TransitionLink } from '../components/PageTransition';

/**
 * A case study, in the site's light language: a frosted top bar (back, title), the
 * hero on the live sky (title, summary, facts, the project's reel in a glass frame),
 * then the story on a light sheet that slides up over the sky, and one button pinned
 * to the bottom of the screen. Calm and centred, like a well-made onboarding screen.
 */
// dark text on light accents, white on deep ones
const onAccent = (hex: string) => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150 ? '#17191e' : '#ffffff';
};

export const CaseStudy = () => {
  const { slug } = useParams();
  const project = bySlug(slug);
  const scenes = useMemo(() => project?.preview() ?? [], [project]);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });

  if (!project) return <Navigate to="/" replace />;
  const { meta } = project;
  const idx = projects.findIndex(p => p.meta.slug === meta.slug);
  const next = projects[(idx + 1) % projects.length];
  const facts: [string, string][] = [['Role', meta.role], ['Timeline', project.timeline], ['Focus', project.expertise]];

  return (
    <article className="relative text-ink">
      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:px-6">
        <div className="relative mx-auto flex h-14 max-w-[1100px] items-center justify-between rounded-full border border-white/80 bg-white/70 px-2 shadow-[0_12px_30px_-20px_rgba(15,30,55,0.5)] backdrop-blur-xl">
          <TransitionLink to="/#work" aria-label="Back to the work"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_8px_-2px_rgba(15,30,55,0.25)] transition-transform hover:-translate-x-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
          </TransitionLink>
          <span className="absolute left-1/2 max-w-[60%] -translate-x-1/2 truncate text-[15px] font-semibold tracking-[-0.01em]">{meta.company}</span>
          <span className="w-10" aria-hidden />
          <motion.span aria-hidden className="absolute inset-x-6 bottom-0 h-[2px] origin-left rounded-full" style={{ scaleX: progress, background: meta.accent }} />
        </div>
      </header>

      {/* hero, on the sky */}
      <section data-sky-hero className="relative px-5 pb-16 pt-[calc(7rem+env(safe-area-inset-top))] md:pb-24 md:pt-36">
        <div className="mx-auto flex max-w-[860px] flex-col items-center text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-ink/55">{meta.company} · {meta.year}</p>
          <h1 className="section-title mt-4 text-[clamp(34px,5.6vw,68px)] leading-[1.02]">{meta.title}</h1>
          <p className="mt-6 max-w-[58ch] text-[16.5px] leading-relaxed text-ink/70 md:text-[18px]">{project.summary}</p>
          <dl className="mt-8 flex flex-wrap justify-center gap-2">
            {facts.map(([k, v]) => (
              <div key={k} className="rounded-full border border-white/80 bg-white/60 px-4 py-2 text-left backdrop-blur-md">
                <dt className="inline text-[12px] font-medium uppercase tracking-[0.18em] text-ink/45">{k} </dt>
                <dd className="inline text-[14px] text-ink/80">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mx-auto mt-12 max-w-[1040px] rounded-[26px] border border-white/80 bg-white/40 p-2 shadow-[0_40px_80px_-40px_rgba(15,30,55,0.6)] backdrop-blur-md md:p-3">
          <PreviewPlayer scenes={scenes} accent={meta.accent} className="rounded-[20px]" />
        </div>
      </section>

      {/* the story, on a light sheet */}
      <div className="relative rounded-t-[32px] bg-[#f7f6f2] pb-36 pt-16 shadow-[0_-30px_60px_-40px_rgba(15,30,55,0.5)] md:rounded-t-[44px] md:pt-24">
        <div className="flex flex-col gap-24 md:gap-32">
          {project.chapters.map((c, i) => (
            <section key={c.id} id={'s-' + c.id} className="flex scroll-mt-24 flex-col gap-9 md:gap-11">
              <header className="mx-auto flex w-full max-w-[760px] flex-col items-center px-6 text-center">
                <span className="text-[12px] font-medium uppercase tracking-[0.24em]" style={{ color: meta.accent }}>
                  {String(i + 1).padStart(2, '0')}{c.kicker ? ` · ${c.kicker}` : ''}
                </span>
                <h2 className="section-title mt-3 text-[clamp(28px,4vw,46px)] leading-[1.06]">{c.title}</h2>
              </header>
              {c.blocks.map((b, k) => <BlockView key={k} b={b} accent={meta.accent} />)}
            </section>
          ))}
        </div>

        {/* next project */}
        <TransitionLink to={`/work/${next.meta.slug}`} className="group mx-auto mt-28 block max-w-[760px] px-6">
          <div className="cs-glass flex items-center justify-between gap-6 rounded-[24px] p-6 md:p-8">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-ink/45">Next case · {next.meta.company}</p>
              <p className="section-title mt-2 text-[clamp(22px,3vw,32px)] leading-tight">{next.meta.title}</p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-1" style={{ background: next.meta.accent, color: onAccent(next.meta.accent) }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </div>
        </TransitionLink>
      </div>

      {/* one action, pinned to the bottom */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-10" style={{ background: 'linear-gradient(to top, rgba(247,246,242,0.95), rgba(247,246,242,0))' }}>
        {project.link
          ? <a href={project.link.href} target="_blank" rel="noopener noreferrer" className="pointer-events-auto flex w-full max-w-[460px] items-center justify-center gap-2 rounded-full py-4 text-[16px] font-medium text-white shadow-[0_16px_34px_-16px_rgba(15,30,55,0.6)] transition-transform hover:-translate-y-0.5" style={{ background: meta.accent, color: onAccent(meta.accent) }}>
              {project.link.label}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M7 17 17 7M8 7h9v9" /></svg>
            </a>
          : <TransitionLink to={`/work/${next.meta.slug}`} className="pointer-events-auto flex w-full max-w-[460px] items-center justify-center gap-2 rounded-full py-4 text-[16px] font-medium text-white shadow-[0_16px_34px_-16px_rgba(15,30,55,0.6)] transition-transform hover:-translate-y-0.5" style={{ background: meta.accent, color: onAccent(meta.accent) }}>
              Next case: {next.meta.company}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </TransitionLink>}
      </div>
    </article>
  );
};
