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
      <div className="mx-auto grid max-w-[560px] gap-2.5 md:max-w-none md:grid-cols-3 md:gap-3">
        {TOOLS.map(t => (
          <TransitionLink key={t.slug} to={`/playground/${t.slug}`}
            className="skill-card group flex items-center gap-3.5 rounded-[16px] border border-white/80 bg-white/80 p-2.5 pr-4 text-ink shadow-[0_20px_44px_-24px_rgba(15,30,55,0.5)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5">
            <ToolThumb slug={t.slug} className="h-14 w-14 shrink-0 rounded-[11px] text-[22px] md:h-16 md:w-16" />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold tracking-[-0.01em]">{t.title}</span>
              <span className="block text-[13px] leading-snug text-ink/60">{t.short}</span>
            </span>
            <span aria-hidden className="text-ink/40 transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </TransitionLink>
        ))}
      </div>
      <div className="mt-5 flex justify-center">
        <TransitionLink to="/playground" className="text-[14px] font-medium text-ink/70 underline decoration-ink/25 underline-offset-4 hover:text-ink">Open the playground</TransitionLink>
      </div>
    </section>
  );
}
