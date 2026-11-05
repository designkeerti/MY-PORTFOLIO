import { TOOLS } from '../playground/data';
import { ToolThumb } from '../playground/Thumb';
import { TransitionLink } from './PageTransition';

/**
 * The playground on the home page: small tools, as compact glass tiles, right after the work
 * (on phones it takes the place the skill cards had; wide screens keep those in the hero).
 */
export function PlaygroundSection() {
  return (
    <section id="playground" className="relative z-20 mx-auto w-full max-w-[1240px] scroll-mt-24 px-4 pb-20 pt-4 md:px-8 md:pb-28">
      <header className="mb-5 flex flex-col items-center text-center md:mb-8">
        <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-ink/55">Playground</p>
        <h2 className="section-title mt-2 text-[clamp(26px,4vw,44px)] leading-[1.06] text-ink">Small tools, free to use</h2>
      </header>
      <div className="mx-auto grid max-w-[560px] grid-cols-2 gap-2 md:max-w-none md:grid-cols-5 md:gap-3">
        {TOOLS.map(t => (
          <TransitionLink key={t.slug} to={`/playground/${t.slug}`}
            className="skill-card group flex items-center gap-2.5 rounded-[14px] border border-white/80 bg-white/80 p-2 text-ink shadow-[0_20px_44px_-24px_rgba(15,30,55,0.5)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 md:flex-col md:items-stretch md:gap-0 md:p-2.5">
            <ToolThumb slug={t.slug} className="h-10 w-10 shrink-0 rounded-[9px] text-[15px] md:aspect-[16/9] md:h-auto md:w-full md:rounded-[10px] md:text-[34px]" />
            <span className="min-w-0 md:px-1 md:pb-1 md:pt-2.5">
              <span className="block truncate text-[13.5px] font-semibold leading-tight tracking-[-0.01em] md:text-[14.5px]"><span className="md:hidden">{t.tile ?? t.title}</span><span className="hidden md:inline">{t.title}</span></span>
              <span className="mt-0.5 hidden text-[12.5px] leading-snug text-ink/60 md:line-clamp-2">{t.short}</span>
            </span>
          </TransitionLink>
        ))}
      </div>
      <div className="mt-5 flex justify-center">
        <TransitionLink to="/playground" className="text-[14px] font-medium text-ink/70 underline decoration-ink/25 underline-offset-4 hover:text-ink">All {TOOLS.length} tools, in the playground</TransitionLink>
      </div>
    </section>
  );
}
