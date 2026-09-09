import { ProjectCard, projects } from './WorkSection';

/** The work: every project as a card, on the dark ground, after the gateway. */
export const WorkFlow = () => (
  <div id="work" className="work-flow">
    <div className="work-more">
      <section className="w-full max-w-[1400px] mx-auto px-4 pt-24 pb-20 flex flex-col gap-10 items-center relative z-10">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <span aria-hidden="true">✨</span>
            <span className="text-[12px] font-bold text-white/80 uppercase tracking-wider">Selected work</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/55 pb-1">Things I’ve made.</h2>
        </div>
        <div className="flex flex-col gap-16 md:gap-20 w-full items-center">
          {projects.map((project, i) => (
            <div key={project.slug} className="w-full flex justify-center"><ProjectCard project={project} index={i} /></div>
          ))}
        </div>
      </section>
    </div>
  </div>
);
