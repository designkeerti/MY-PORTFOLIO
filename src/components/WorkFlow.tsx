import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BentoGallery } from './BentoGallery';
import { ProjectCard, projects } from './WorkSection';

gsap.registerPlugin(ScrollTrigger);

/** The work flow: the bento that zooms into Cross Border Supps, then the rest of the projects. Dark throughout. */
export const WorkFlow = ({ onDarkModeChange }: { onDarkModeChange?: (d: boolean) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onDarkModeChange); cb.current = onDarkModeChange;
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const st = ScrollTrigger.create({ trigger: el, start: 'top 100px', end: 'bottom 100px', onToggle: s => cb.current?.(s.isActive) });
    return () => { st.kill(); cb.current?.(false); };
  }, []);
  const rest = projects.filter(p => p.slug !== 'cbs');
  return (
    <div ref={ref} id="work" className="work-flow">
      <BentoGallery />
      <section className="w-full max-w-[1400px] mx-auto px-4 pt-24 pb-20 flex flex-col gap-10 items-center relative z-10">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <span aria-hidden="true">✨</span>
            <span className="text-[12px] font-bold text-white/80 uppercase tracking-wider">More work</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/55 pb-1">And a few more.</h2>
        </div>
        <div className="flex flex-col gap-16 md:gap-20 w-full items-center">
          {rest.map((project, i) => (
            <div key={project.slug} className="w-full flex justify-center"><ProjectCard project={project} index={i} /></div>
          ))}
        </div>
      </section>
    </div>
  );
};
