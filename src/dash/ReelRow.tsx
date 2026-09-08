import type { Project } from '../content/types';
import { go } from './Sidebar';

/** The reels as a shelf. Click one to put it on the stage. */
export const ReelRow = ({ projects, current, onPick }: { projects: Project[]; current: number; onPick: (i: number) => void }) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-baseline justify-between px-1">
      <h3 className="d-h">All reels</h3>
      <span className="d-meta">{projects.length} projects</span>
    </div>
    <div className="d-shelf -mx-0.5 px-0.5">
      {projects.map((p, i) => (
        <button key={p.meta.slug} type="button" onClick={() => { onPick(i); go('work'); }}
          className={`w-[196px] md:w-[212px] text-left rounded-[12px] p-2 transition-colors ${i === current ? 'bg-white border border-[var(--ink)]' : 'bg-white border border-[var(--line)] hover:border-[#c9c9cf]'}`}>
          <div className="relative rounded-[8px] overflow-hidden aspect-[4/3] bg-[#eee]">
            <img src={p.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
            {i === current && <span className="absolute left-2 bottom-2 d-eq bg-white/90 rounded px-1.5 py-1" aria-hidden="true"><i /><i /><i /></span>}
          </div>
          <div className="px-1 pt-2.5 pb-1">
            <div className="text-[13px] font-medium leading-snug text-[var(--ink)] line-clamp-2">{p.meta.title}</div>
            <div className="d-meta mt-1">{p.meta.company} · {p.meta.year}</div>
          </div>
        </button>
      ))}
    </div>
  </section>
);
