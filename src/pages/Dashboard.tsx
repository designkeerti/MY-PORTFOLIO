import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects } from '../content/projects';
import { Sidebar, Brand, go } from '../dash/Sidebar';
import { Stage } from '../dash/Stage';
import { ReelRow } from '../dash/ReelRow';
import { SkillTiles } from '../dash/SkillTiles';
import { Tools } from '../dash/Tools';
import { ProfileCard } from '../dash/ProfileCard';
import { Intro } from '../dash/Intro';
import { Word } from '../dash/Word';

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
};

/** The home page as a dashboard: a rail of reels on the left, the stage in the middle, the profile on the right. */
export const Dashboard = () => {
  const [cur, setCur] = useState(0);
  const [ready, setReady] = useState<boolean>(() => { try { return sessionStorage.getItem('introSeen') === '1'; } catch { return true; } });
  const [active, setActive] = useState('top');
  const done = useCallback(() => { setReady(true); try { sessionStorage.setItem('introSeen', '1'); } catch { /* fine */ } }, []);

  useEffect(() => {
    if (!ready) return;
    const els = ['top', 'work', 'skills'].map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-30% 0px -60% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [ready]);

  const prev = () => setCur(c => (c - 1 + projects.length) % projects.length);
  const next = () => setCur(c => (c + 1) % projects.length);

  return (
    <div className="dash">
      <AnimatePresence>{!ready && <Intro key="intro" onDone={done} />}</AnimatePresence>

      <motion.div className="dash-body mx-auto max-w-[1520px] px-4 md:px-5 py-4 md:py-5 xl:grid xl:grid-cols-[236px_minmax(0,1fr)_320px] xl:gap-4 xl:items-start"
        initial={false} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.5 }}>

        {/* the rail */}
        <aside className="hidden xl:block sticky top-5 h-[calc(100vh-40px)]"><Sidebar current={cur} onPick={setCur} active={active} /></aside>

        <main className="min-w-0 flex flex-col gap-4 md:gap-5">
          {/* small screens: brand + section links */}
          <div className="xl:hidden flex items-center justify-between gap-3 px-1 pt-1 pb-1">
            <Brand className="whitespace-nowrap" />
            <nav className="flex items-center gap-3.5 text-[13px] font-medium text-[var(--ink-2)] shrink-0" aria-label="Sections">
              {[['work', 'Work'], ['about-compact', 'About']].map(([id, l]) => <button key={id} type="button" className="hover:text-[var(--ink)]" onClick={() => go(id)}>{l}</button>)}
              <a className="hover:text-[var(--ink)]" href="mailto:design.keerti@gmail.com">Contact</a>
            </nav>
          </div>

          {/* the header */}
          <section id="top" className="px-1 pt-2 md:pt-4 pb-1 scroll-mt-5">
            <div className="d-meta mb-2">{greeting()}</div>
            <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.025em] leading-[1.1] text-[var(--ink)]">
              I design <Word />
            </h1>
          </section>

          <section id="work" className="scroll-mt-5"><Stage project={projects[cur]} index={cur} total={projects.length} onPrev={prev} onNext={next} /></section>

          <ReelRow projects={projects} current={cur} onPick={setCur} />

          <div className="xl:hidden scroll-mt-5" id="about-compact"><ProfileCard compact /></div>

          <section id="skills" className="scroll-mt-5 flex flex-col gap-5">
            <SkillTiles />
            <div className="d-card p-4 flex flex-col gap-3">
              <h3 className="d-h">Tools</h3>
              <Tools />
            </div>
          </section>

          <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 py-3 d-meta">
            <span>© 2025 Keerthi Vardhan. Vibecoded the shit out of this.</span>
            <a href="/classic" className="hover:text-[var(--ink)]">Classic version</a>
          </footer>
        </main>

        {/* the profile */}
        <aside id="about" className="hidden xl:block sticky top-5 max-h-[calc(100vh-40px)] overflow-auto d-scroll rounded-[16px] scroll-mt-5"><ProfileCard /></aside>
      </motion.div>
    </div>
  );
};
