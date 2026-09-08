import { useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PreviewPlayer } from '../previews/PreviewPlayer';
import type { Project } from '../content/types';

/** A film screen: the reel of the chosen project, a soft light spill on the wall, and a filmstrip to pick from. */
export const Screen = ({ projects, current, onPick }: { projects: Project[]; current: number; onPick: (i: number) => void }) => {
  const project = projects[current];
  const scenes = useMemo(() => project.preview(), [project]);
  const next = useCallback(() => onPick((current + 1) % projects.length), [current, projects.length, onPick]);
  const open = project.externalLink
    ? <a href={project.externalLink} target="_blank" rel="noreferrer" className="screen-link">View case study <span aria-hidden="true">↗</span></a>
    : <Link to={`/work/${project.meta.slug}`} className="screen-link">View case study <span aria-hidden="true">→</span></Link>;

  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 px-8 py-6 min-h-0">
      {/* the screen */}
      <div className="screen-wall">
        <div className="screen-frame">
          <AnimatePresence mode="wait">
            <motion.div key={project.meta.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <PreviewPlayer scenes={scenes} accent={project.meta.accent} loop={false} onEnd={next} className="screen-reel" />
            </motion.div>
          </AnimatePresence>
          <span className="screen-grain" aria-hidden="true" />
        </div>
      </div>

      {/* one line under the screen */}
      <div className="w-full max-w-[var(--screen-w)] flex items-center justify-between gap-6 px-1">
        <AnimatePresence mode="wait">
          <motion.div key={project.meta.slug} className="min-w-0" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
            <div className="text-[15px] font-bold text-text-primary truncate">{project.meta.title}</div>
            <div className="text-[12.5px] text-gray-500">{project.meta.company} · {project.meta.year} · {project.meta.tag}</div>
          </motion.div>
        </AnimatePresence>
        <div className="shrink-0">{open}</div>
      </div>

      {/* the filmstrip */}
      <div className="filmstrip" role="tablist" aria-label="Projects">
        {projects.map((p, i) => (
          <button key={p.meta.slug} type="button" role="tab" aria-selected={i === current} aria-label={p.meta.title} className={`filmstrip-frame ${i === current ? 'is-on' : ''}`} onClick={() => onPick(i)}>
            <img src={p.cover} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
};
