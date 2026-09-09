import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { projects, bySlug } from '../content/projects';
import { PreviewPlayer } from '../previews/PreviewPlayer';
import { BlockView } from '../casestudy/Blocks';

export const CaseStudy = () => {
  const { slug } = useParams();
  const project = bySlug(slug);
  const heroRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState('');
  const scenes = useMemo(() => project?.preview() ?? [], [project]);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end 80px'] });
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    if (!project) return;
    const els = project.chapters.map(c => document.getElementById('s-' + c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id.replace('s-', '')); }), { rootMargin: '-35% 0px -55% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [project]);

  if (!project) return <Navigate to="/" replace />;
  const { meta } = project;
  const idx = projects.findIndex(p => p.meta.slug === meta.slug);
  const next = projects[(idx + 1) % projects.length].meta;
  const nextIsHere = next.slug === 'cbs';

  return (
    <article className="bg-[#0f0d16]">
      <div ref={heroRef} className="bg-[#0f0d16] text-white pt-24 md:pt-28 pb-16 md:pb-24 relative">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-white/10"><motion.div className="h-full" style={{ width: bar, background: meta.accent }} /></div>

        <div className="max-w-[1240px] mx-auto px-4 md:px-8">
          <div className="kicker text-white/50 px-2 md:px-0 mb-4">{meta.company} · {meta.year}</div>
          <PreviewPlayer scenes={scenes} accent={meta.accent} className="md:rounded-[28px]" />
        </div>

        <div className="max-w-[1000px] mx-auto px-6 pt-12 md:pt-16">
          <h1 className="font-bold tracking-[-0.03em] leading-[1.02]" style={{ fontSize: 'clamp(32px, 5.4vw, 68px)' }}>{meta.title}</h1>
          <p className="text-white/70 text-[17px] md:text-[20px] leading-relaxed max-w-[62ch] mt-6">{project.summary}</p>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/10">
            {[['Company', meta.company], ['Role', meta.role], ['Expertise', project.expertise], ['Timeline', project.timeline]].map(([k, v]) => (
              <div key={k}><dt className="kicker text-white/40 mb-2">{k}</dt><dd className="text-[15px] md:text-[16px] text-white/85 leading-snug">{v}</dd></div>
            ))}
          </dl>
          {project.link && <a href={project.link.href} target="_blank" rel="noreferrer" className="cs-btn cs-btn--solid mt-8">{project.link.label} ↗</a>}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto xl:grid xl:grid-cols-[230px_minmax(0,1fr)] xl:gap-8 xl:px-8">
        <nav className="hidden xl:block">
          <div className="sticky top-28">
            <div className="kicker text-white/40 mb-3">Sections</div>
            <ol className="flex flex-col gap-1">
              {project.chapters.map((c, i) => (
                <li key={c.id}>
                  <a href={'#s-' + c.id} onClick={(e) => { e.preventDefault(); document.getElementById('s-' + c.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                    className={`flex gap-3 items-baseline text-[13px] leading-snug py-1 transition-colors ${active === c.id ? 'text-white font-bold' : 'text-white/40 hover:text-white/70'}`}>
                    <span className="kicker" style={{ color: active === c.id ? meta.accent : 'rgba(255,255,255,.3)' }}>{String(i + 1).padStart(2, '0')}</span>{c.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0">
          <div className="xl:hidden sticky top-[64px] z-30 bg-[#0f0d16]/85 backdrop-blur-md border-b border-white/10 overflow-x-auto">
            <div className="flex gap-5 px-6 py-3 whitespace-nowrap">
              {project.chapters.map((c, i) => (
                <a key={c.id} href={'#s-' + c.id} onClick={(e) => { e.preventDefault(); document.getElementById('s-' + c.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                  className="kicker transition-colors" style={{ color: active === c.id ? meta.accent : 'rgba(255,255,255,.45)' }}>
                  {String(i + 1).padStart(2, '0')} {c.title.length > 26 ? c.title.slice(0, 24) + '…' : c.title}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-24 md:gap-32 py-16 md:py-24">
            {project.chapters.map(c => (
              <section key={c.id} id={'s-' + c.id} className="flex flex-col gap-10 md:gap-12 scroll-mt-28">
                <header className="w-full max-w-[860px] mx-auto px-6">
                  {c.kicker && <div className="kicker mb-4" style={{ color: meta.accent }}>{c.kicker}</div>}
                  <h2 className="font-bold tracking-[-0.03em] leading-[1.05] text-white" style={{ fontSize: 'clamp(28px, 4.2vw, 52px)' }}>{c.title}</h2>
                </header>
                {c.blocks.map((b, k) => <BlockView key={k} b={b} accent={meta.accent} />)}
              </section>
            ))}
          </div>
        </div>
      </div>

      {nextIsHere ? (
        <Link to={`/work/${next.slug}`} className="block bg-[#15121f] border-t border-white/10 text-white group">
          <NextCard label={next.title} accent={next.accent} sub={`${next.company} · ${next.year}`} />
        </Link>
      ) : (
        <a href={projects[(idx + 1) % projects.length].externalLink ?? '/'} target="_blank" rel="noreferrer" className="block bg-[#15121f] border-t border-white/10 text-white group">
          <NextCard label={next.title} accent={next.accent} sub={`${next.company} · ${next.year}`} />
        </a>
      )}
    </article>
  );
};

const NextCard = ({ label, accent, sub }: { label: string; accent: string; sub: string }) => (
  <div className="max-w-[1000px] mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row md:items-end justify-between gap-8">
    <div>
      <div className="kicker text-white/50 mb-4">Next project</div>
      <h2 className="font-bold tracking-[-0.03em] leading-[1.05]" style={{ fontSize: 'clamp(28px, 4.6vw, 56px)' }}>
        {label}<span className="inline-block ml-3 transition-transform group-hover:translate-x-2" style={{ color: accent }}>→</span>
      </h2>
    </div>
    <div className="kicker text-white/50">{sub}</div>
  </div>
);
