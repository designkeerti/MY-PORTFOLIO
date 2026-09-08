import { useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PreviewPlayer } from '../previews/PreviewPlayer';
import type { Project } from '../content/types';

/** The film screen, the line beneath it, and the filmstrip: one width, one system. */
export const Screen = ({ projects, current, onPick }: { projects: Project[]; current: number; onPick: (i: number) => void }) => {
  const project = projects[current];
  const scenes = useMemo(() => project.preview(), [project]);
  const n = projects.length;
  const next = useCallback(() => onPick((current + 1) % n), [current, n, onPick]);
  const prev = useCallback(() => onPick((current - 1 + n) % n), [current, n, onPick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const open = project.externalLink
    ? <a href={project.externalLink} target="_blank" rel="noreferrer" className="screen-btn">View case study<i className="ph-bold ph-arrow-up-right" aria-hidden="true" /></a>
    : <Link to={`/work/${project.meta.slug}`} className="screen-btn">View case study<i className="ph-bold ph-arrow-right" aria-hidden="true" /></Link>;

  return (
    <div className="h-full flex flex-col items-center justify-center px-10 py-6 min-h-0">
      <div className="screen-stack">
        <div className="screen-wall">
          <div className="screen-frame">
            <AnimatePresence mode="wait">
              <motion.div key={project.meta.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <PreviewPlayer scenes={scenes} accent={project.meta.accent} loop={false} onEnd={next} />
              </motion.div>
            </AnimatePresence>
            <span className="screen-grain" aria-hidden="true" />
          </div>
        </div>

        <div className="screen-caption">
          <AnimatePresence mode="wait">
            <motion.div key={project.meta.slug} className="min-w-0" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
              <div className="screen-title">{project.meta.title}</div>
              <div className="screen-meta">{project.meta.company} · {project.meta.year} · {project.meta.tag}</div>
            </motion.div>
          </AnimatePresence>
          <div className="shrink-0">{open}</div>
        </div>

        <div className="filmstrip">
          <button type="button" className="filmstrip-chev filmstrip-chev--l" aria-label="Previous project" onClick={prev}><i className="ph-bold ph-caret-left" /></button>
          <div className="filmstrip__track" role="tablist" aria-label="Projects">
            {projects.map((p, i) => (
              <button key={p.meta.slug} type="button" role="tab" aria-selected={i === current} aria-label={p.meta.title} className={`filmstrip-frame ${i === current ? 'is-on' : ''}`} onClick={() => onPick(i)}>
                <img src={p.cover} alt="" loading="lazy" />
              </button>
            ))}
          </div>
          <button type="button" className="filmstrip-chev filmstrip-chev--r" aria-label="Next project" onClick={next}><i className="ph-bold ph-caret-right" /></button>
        </div>
      </div>
    </div>
  );
};
