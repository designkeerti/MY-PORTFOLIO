import { TOOLS, type ToolSlug } from '../playground/data';
import { ToolThumb } from '../playground/Thumb';
import { TransitionLink } from './PageTransition';
import { CardCat } from './cats/CardCat';

/** the three the home page shows; the rest wait in the playground */
const FEATURED: ToolSlug[] = ['icons', 'jobs', 'shader'];

/**
 * The playground on the home page: three tools, as glass tiles, right after the work (on
 * phones it takes the place the skill cards had; wide screens keep those in the hero).
 */
export function PlaygroundSection() {
  return (
    <section id="playground" className="relative z-20 mx-auto w-full max-w-[1240px] scroll-mt-24 px-4 pb-20 pt-4 md:px-8 md:pb-28">
      <header className="mb-5 flex flex-col items-center text-center md:mb-8">
        <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-ink/55">Playground</p>
        <h2 className="section-title mt-2 text-[clamp(26px,4vw,44px)] leading-[1.06] text-ink">Small tools, free to use</h2>
      </header>
      <div className="mx-auto grid max-w-[560px] grid-cols-1 gap-2 md:max-w-none md:grid-cols-3 md:gap-3">
        {FEATURED.map(slug => TOOLS.find(t => t.slug === slug)!).map(t => {
          const lead = t.slug === 'icons' || t.slug === 'jobs';
          return (
          <TransitionLink key={t.slug} to={`/playground/${t.slug}`}
            className={`skill-card group relative flex items-center gap-2.5 rounded-[14px] border border-white/80 bg-white/80 p-2 text-ink shadow-[0_20px_44px_-24px_rgba(15,30,55,0.5)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 md:flex-col md:items-stretch md:gap-0 md:p-2.5`}>
            <CardCat id={`tool-${t.slug}`} size="sm" />
            <ToolThumb slug={t.slug} className={`h-12 w-12 shrink-0 rounded-[10px] text-[18px] md:h-auto md:w-full md:rounded-[10px] md:text-[52px] md:aspect-[16/9]`} />
            <span className="min-w-0 md:px-1 md:pb-1 md:pt-2.5">
              <span className="block truncate text-[13.5px] font-semibold leading-tight tracking-[-0.01em] md:text-[14.5px]"><span className="md:hidden">{t.tile ?? t.title}</span><span className="hidden md:inline">{t.title}</span>{lead && <span className="ml-2 rounded-full bg-ink px-1.5 py-0.5 align-[2px] text-[10px] font-semibold uppercase tracking-[0.12em] text-white">New</span>}</span>
              <span className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-ink/60">{t.short}</span>
            </span>
          </TransitionLink>
          );
        })}
      </div>
      <div className="mt-5 flex justify-center">
        <TransitionLink to="/playground" className="text-[14px] font-medium text-ink/70 underline decoration-ink/25 underline-offset-4 hover:text-ink">View all {TOOLS.length} tools</TransitionLink>
      </div>
    </section>
  );
}
