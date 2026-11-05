import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { projects, bySlug } from '../content/projects';
import { PreviewPlayer } from '../previews/PreviewPlayer';
import { BlockView } from '../casestudy/Blocks';
import type { Glance as GlanceT } from '../content/types';
import { TransitionLink } from '../components/PageTransition';
import { pageTop } from '../lib/pageTop';
import { FilmPlayer, PlayGlyph, mmss, onAccent, useFilm, type FilmInfo } from '../components/FilmPlayer';

/**
 * A case study, in the site's light language: a frosted top bar (back, title), the
 * hero on the live sky (title, summary, facts, the project's reel in a glass frame),
 * then the story on a light sheet that slides up over the sky. The visit button sits in
 * the top bar. On phones it is one screen: the reel, and a note that the complete case
 * study is on desktop (copy or email the link).
 */

export const CaseStudy = () => {
  const { slug } = useParams();
  const project = bySlug(slug);
  const scenes = useMemo(() => project?.preview() ?? [], [project]);
  // reading progress, measured from the page's top (below the room kept above it on iOS)
  const { scrollY } = useScroll();
  const reading = useTransform(scrollY, v => {
    const top = pageTop();
    const max = document.documentElement.scrollHeight - window.innerHeight - top;
    return max > 0 ? Math.min(1, Math.max(0, (v - top) / max)) : 0;
  });
  const progress = useSpring(reading, { stiffness: 200, damping: 30, mass: 0.3 });
  const film = useFilm(slug ?? '');
  const [watching, setWatching] = useState(false);
  const closeFilm = useCallback(() => setWatching(false), []);
  // the top bar slims down once you start reading
  const [slim, setSlim] = useState(false);
  useEffect(() => {
    const on = () => setSlim(window.scrollY - pageTop() > 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  if (!project) return <Navigate to="/" replace />;
  const { meta } = project;
  const idx = projects.findIndex(p => p.meta.slug === meta.slug);
  const next = projects[(idx + 1) % projects.length];
  const facts: [string, string][] = [['Role', meta.role], ['Timeline', project.timeline], ['Focus', project.expertise]];
  const navItems = [
    ...(project.glance ? [{ id: 'glance', label: 'At a glance', n: '' }] : []),
    ...project.chapters.map((c, i) => ({ id: c.id, label: c.nav ?? c.title, n: String(i + 1).padStart(2, '0') })),
  ];

  return (
    <article className="relative text-ink">
      {/* top bar */}
      {/* starts 6px down (padding 6px less): Safari 26 samples 4px inside the screen edge for a
          pinned bar to tint its status bar from; missing it, the page shows behind the clock */}
      <header className={`fixed inset-x-0 top-[6px] z-50 px-3 transition-[padding] duration-300 md:px-6 ${slim ? 'pt-[calc(0.4rem-6px+env(safe-area-inset-top))]' : 'pt-[calc(0.75rem-6px+env(safe-area-inset-top))]'}`}>
        <div className={`relative mx-auto flex max-w-[1100px] items-center justify-between rounded-full border transition-[height,padding] duration-300 ${slim ? 'h-11 px-1.5' : 'h-14 px-2'} border-white/80 bg-white/70 shadow-[0_12px_30px_-20px_rgba(15,30,55,0.5)] backdrop-blur-xl`}>
          <TransitionLink to="/#work" aria-label="Back to the work"
            className={`flex items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_8px_-2px_rgba(15,30,55,0.25)] transition-[width,height,transform] duration-300 hover:-translate-x-0.5 ${slim ? 'h-8 w-8' : 'h-10 w-10'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
          </TransitionLink>
          <span className={`absolute left-1/2 max-w-[44%] -translate-x-1/2 truncate font-semibold tracking-[-0.01em] transition-[font-size] duration-300 ${slim ? 'text-[14px]' : 'text-[15px]'}`}>{meta.company}</span>
          {project.link
            ? <a href={project.link.href} target="_blank" rel="noopener noreferrer" aria-label={project.link.label}
                className={`flex items-center gap-1.5 rounded-full font-medium shadow-[0_6px_16px_-8px_rgba(15,30,55,0.5)] transition-[height,padding,font-size,transform] duration-300 hover:-translate-y-0.5 ${slim ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-[14px]'}`}
                style={{ background: meta.accent, color: onAccent(meta.accent) }}>
                <span className="hidden sm:inline">Visit site</span><span className="sm:hidden">Visit</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden><path d="M7 17 17 7M8 7h9v9" /></svg>
              </a>
            : <span className={slim ? 'w-8' : 'w-10'} aria-hidden />}
          <motion.span aria-hidden className="absolute inset-x-6 bottom-0 h-[2px] origin-left rounded-full" style={{ scaleX: progress, background: meta.accent }} />
        </div>
      </header>

      {/* hero, on the sky */}
      <section data-sky-hero className="relative flex min-h-[100svh] flex-col justify-center px-5 pb-10 pt-[calc(6rem+env(safe-area-inset-top))] md:block md:min-h-0 md:pb-24 md:pt-36">
        <div className="mx-auto flex max-w-[860px] flex-col items-center text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-ink/55">{meta.company} · {meta.year}</p>
          <h1 className="section-title mt-3 text-[clamp(28px,5.6vw,68px)] md:mt-4 leading-[1.02]">{meta.title}</h1>
          <p className="mt-6 hidden max-w-[58ch] text-[18px] leading-relaxed text-ink/70 md:block">{project.summary}</p>
          <dl className="mt-8 hidden flex-wrap justify-center gap-2 md:flex">
            {facts.map(([k, v]) => (
              <div key={k} className="rounded-full border border-white/80 bg-white/60 px-4 py-2 text-left backdrop-blur-md">
                <dt className="inline text-[12px] font-medium uppercase tracking-[0.18em] text-ink/45">{k} </dt>
                <dd className="inline text-[14px] text-ink/80">{v}</dd>
              </div>
            ))}
          </dl>
          {film && <WatchButton film={film} accent={meta.accent} onClick={() => setWatching(true)} className="mt-7 hidden md:inline-flex" />}
        </div>
        <div className="mx-auto mt-8 w-full max-w-[1040px] rounded-[26px] md:mt-12 border border-white/80 bg-white/40 p-2 shadow-[0_40px_80px_-40px_rgba(15,30,55,0.6)] backdrop-blur-md md:p-3">
          <PreviewPlayer scenes={scenes} accent={meta.accent} className="rounded-[20px]" />
        </div>
        <DesktopNote accent={meta.accent} company={meta.company} next={next.meta} film={film} onWatch={() => setWatching(true)} />
      </section>

      {/* the story, on a light sheet; on large screens a side nav rides along */}
      <div className="relative hidden rounded-t-[32px] bg-[#f7f6f2] pb-28 pt-16 md:block shadow-[0_-30px_60px_-40px_rgba(15,30,55,0.5)] md:rounded-t-[44px] md:pt-24">
        <div className="mx-auto max-w-[1480px] lg:grid lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)]">
          <SideNav items={navItems} accent={meta.accent} film={film} onWatch={() => setWatching(true)} />
          <div className="min-w-0">
            <div className="flex flex-col gap-24 md:gap-32">
              {project.glance && <Glance g={project.glance} accent={meta.accent} />}
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
        </div>
      </div>

      {film && <FilmPlayer slug={meta.slug} info={film} company={meta.company} accent={meta.accent} open={watching} onClose={closeFilm} />}
    </article>
  );
};

/** "Watch the case study", with its length. */
function WatchButton({ film, accent, onClick, className = '' }: { film: FilmInfo; accent: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`group items-center gap-3 rounded-full border border-white/80 bg-white/75 py-1.5 pl-1.5 pr-5 text-[15px] font-medium text-ink shadow-[0_14px_30px_-18px_rgba(15,30,55,0.55)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105" style={{ background: accent, color: onAccent(accent) }}><PlayGlyph /></span>
      Watch the case study
      <span className="tabular-nums text-ink/45">{mmss(film.duration)}</span>
    </button>
  );
}

/** The thirty-second version: problem, role, what I did, what happened. */
function Glance({ g, accent }: { g: GlanceT; accent: string }) {
  const label = 'text-[12px] font-medium uppercase tracking-[0.22em]';
  return (
    <section id="s-glance" className="mx-auto w-full max-w-[1000px] scroll-mt-24 px-6">
      <header className="mb-9 flex flex-col items-center text-center md:mb-11">
        <span className={label} style={{ color: accent }}>At a glance</span>
        <h2 className="section-title mt-3 text-[clamp(28px,4vw,46px)] leading-[1.06]">The short version</h2>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="cs-glass rounded-[22px] p-7 md:col-span-2">
          <p className={`${label} text-ink/45`}>The problem</p>
          <p className="mt-3 text-[19px] font-medium leading-[1.45] tracking-[-0.01em] text-ink md:text-[21px]">{g.problem}</p>
        </div>
        <div className="cs-glass rounded-[22px] p-7">
          <p className={`${label} text-ink/45`}>My role</p>
          <p className="mt-3 text-[16px] leading-relaxed text-ink/75">{g.role}</p>
        </div>
        <div className="cs-glass rounded-[22px] p-7">
          <p className={`${label} text-ink/45`}>What I did</p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {g.did.map(d => (
              <li key={d} className="flex gap-3 text-[16px] leading-snug text-ink/75">
                <span className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} aria-hidden />{d}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[22px] border p-7 md:col-span-2" style={{ background: `color-mix(in srgb, ${accent} 11%, #ffffff)`, borderColor: `color-mix(in srgb, ${accent} 26%, #ffffff)` }}>
          <p className={label} style={{ color: `color-mix(in srgb, ${accent} 70%, #17191e)` }}>Where it landed</p>
          <p className="mt-3 text-[17px] leading-relaxed text-ink/85">{g.outcome}</p>
        </div>
      </div>
    </section>
  );
}

/** Large screens: a sticky list of the chapters, the one you are reading lit in the accent. */
function SideNav({ items, accent, film, onWatch }: { items: { id: string; label: string; n: string }[]; accent: string; film: FilmInfo | null; onWatch: () => void }) {
  const [active, setActive] = useState(items[0]?.id);
  const ids = items.map(i => i.id).join(' ');
  useEffect(() => {
    const els = ids.split(' ').map(id => document.getElementById('s-' + id)).filter((e): e is HTMLElement => !!e);
    // a section is "current" once its top passes 40% of the way down the screen
    const pick = () => {
      const line = window.innerHeight * 0.4;
      let cur = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) cur = el.id;
      if (cur) setActive(cur.slice(2));
    };
    pick();
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    return () => { window.removeEventListener('scroll', pick); window.removeEventListener('resize', pick); };
  }, [ids]);
  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('s-' + id);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#s-' + id);
  };
  return (
    <nav aria-label="Sections" className="hidden lg:block">
      <div className="sticky top-24 pl-8 pr-2 xl:pl-12">
        {film && (
          <button type="button" onClick={onWatch} className="group mb-7 flex w-full items-center gap-3 rounded-[14px] border border-ink/10 bg-white/70 p-2 pr-3 text-left transition-colors hover:bg-white">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105" style={{ background: accent, color: onAccent(accent) }}><PlayGlyph className="h-3 w-3" /></span>
            <span className="text-[13px] font-medium leading-tight text-ink">Watch instead<span className="block font-normal tabular-nums text-ink/50">{mmss(film.duration)} with narration</span></span>
          </button>
        )}
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.24em] text-ink/40">In this case</p>
        <ol className="relative flex flex-col border-l border-ink/10">
          {items.map(it => {
            const on = it.id === active;
            return (
              <li key={it.id}>
                <a href={'#s-' + it.id} onClick={go(it.id)} aria-current={on ? 'location' : undefined}
                  className={`relative -ml-px flex gap-2.5 border-l-2 py-[7px] pl-4 pr-1 text-[13.5px] leading-snug transition-colors duration-200 ${on ? 'font-medium text-ink' : 'border-transparent text-ink/50 hover:text-ink/80'}`}
                  style={on ? { borderColor: accent } : undefined}>
                  <span className="w-5 shrink-0 tabular-nums text-[11.5px] leading-[1.6]" style={{ color: on ? accent : undefined }}>{it.n}</span>
                  <span className="line-clamp-2">{it.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

/** Phones: the reel is the case study; the full story is offered for a bigger screen. */
function DesktopNote({ accent, company, next, film, onWatch }: { accent: string; company: string; next: { slug: string; company: string }; film: FilmInfo | null; onWatch: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { /* clipboard blocked */ }
  };
  const mail = `mailto:?subject=${encodeURIComponent(`${company} case study, Keerthi Vardhan`)}&body=${encodeURIComponent(`Read on desktop: ${url}`)}`;
  const btn = 'flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-medium transition-transform active:scale-[0.98]';
  const nextLink = (
    <TransitionLink to={`/work/${next.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-ink/70">
      Next case: {next.company}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </TransitionLink>
  );
  const card = 'mx-auto mt-5 w-full max-w-[460px] rounded-[22px] border border-white/80 bg-white/70 p-4 text-center shadow-[0_24px_50px_-30px_rgba(15,30,55,0.55)] backdrop-blur-md md:hidden';

  // with a film, phones get the whole case study after all: watch it here, read it later
  if (film) return (
    <div className={card}>
      <p className="text-[17px] font-semibold tracking-[-0.01em] text-ink">The full case study, in {Math.round(film.duration / 60)} minutes</p>
      <p className="mt-1.5 text-[14.5px] leading-snug text-ink/60">Problem, research, decisions and outcome, narrated, with captions.</p>
      <button type="button" onClick={onWatch} className={`${btn} mt-4 w-full`} style={{ background: accent, color: onAccent(accent) }}>
        <PlayGlyph className="h-4 w-4" /> Watch the case study <span className="tabular-nums opacity-70">{mmss(film.duration)}</span>
      </button>
      <p className="mt-4 text-[13.5px] text-ink/55">Prefer reading? The written version is on desktop.</p>
      <div className="mt-2 flex justify-center gap-5 text-[14px] font-medium text-ink/75">
        <button type="button" onClick={copy} className="underline decoration-ink/20 underline-offset-4">{copied ? 'Link copied' : 'Copy link'}</button>
        <a href={mail} className="underline decoration-ink/20 underline-offset-4">Email it to me</a>
      </div>
      {nextLink}
    </div>
  );

  return (
    <div className={card}>
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-[13px] text-ink/80" style={{ background: 'linear-gradient(135deg,#dcf2ff,#93d2f5)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
          <rect x="3" y="4" width="18" height="12" rx="2" fill="currentColor" fillOpacity="0.14" /><path d="M8 20h8M12 16v4" />
        </svg>
      </span>
      <p className="mt-3 text-[17px] font-semibold tracking-[-0.01em] text-ink">The complete case study is on desktop</p>
      <p className="mt-1.5 text-[14.5px] leading-snug text-ink/60">The full story, research and process read best on a bigger screen. Save it for later.</p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={copy} className={`${btn} border border-ink/15 bg-white text-ink`}>{copied ? 'Link copied' : 'Copy link'}</button>
        <a href={mail} className={btn} style={{ background: accent, color: onAccent(accent) }}>Email it to me</a>
      </div>
      {nextLink}
    </div>
  );
}
