import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { TOOLS } from '../playground/data';
import { ToolThumb } from '../playground/Thumb';
import { ShaderStudio } from '../playground/ShaderStudio';
import { TypeChecker } from '../playground/TypeChecker';
import { Picks } from '../playground/Picks';
import { Toaster } from '../playground/ui';
import { TransitionLink } from '../components/PageTransition';
import { pageTop } from '../lib/pageTop';

/**
 * The playground, in the case studies' language: a frosted top bar, a hero on the live sky,
 * and the tool on a light sheet that slides up over it. /playground lists the tools;
 * /playground/:tool is one of them.
 */
export default function Playground() {
  const { tool } = useParams();
  const t = tool ? TOOLS.find(x => x.slug === tool) : undefined;
  const [slim, setSlim] = useState(false);
  useEffect(() => {
    const on = () => setSlim(window.scrollY - pageTop() > 40);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  if (tool && !t) return <Navigate to="/playground" replace />;

  return (
    <article className="relative text-ink">
      {/* top bar: starts 6px down, like the case studies' (keeps Safari's status bar clear) */}
      <header className={`fixed inset-x-0 top-[6px] z-50 px-3 transition-[padding] duration-300 md:px-6 ${slim ? 'pt-[calc(0.4rem-6px+env(safe-area-inset-top))]' : 'pt-[calc(0.75rem-6px+env(safe-area-inset-top))]'}`}>
        <div className={`relative mx-auto flex max-w-[1100px] items-center justify-between rounded-full border transition-[height,padding] duration-300 ${slim ? 'h-11 px-1.5' : 'h-14 px-2'} border-white/80 bg-white/70 shadow-[0_12px_30px_-20px_rgba(15,30,55,0.5)] backdrop-blur-xl`}>
          <TransitionLink to={t ? '/playground' : '/#playground'} aria-label={t ? 'Back to the playground' : 'Back home'}
            className={`flex items-center justify-center rounded-full bg-white text-ink shadow-[0_2px_8px_-2px_rgba(15,30,55,0.25)] transition-[width,height,transform] duration-300 hover:-translate-x-0.5 ${slim ? 'h-8 w-8' : 'h-10 w-10'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
          </TransitionLink>
          <span className={`absolute left-1/2 max-w-[56%] -translate-x-1/2 truncate font-semibold tracking-[-0.01em] transition-[font-size] duration-300 ${slim ? 'text-[14px]' : 'text-[15px]'}`}>{t ? t.title : 'Playground'}</span>
          <span className={slim ? 'w-8' : 'w-10'} aria-hidden />
        </div>
      </header>

      {/* hero, on the sky */}
      <section data-sky-hero className="relative px-5 pb-12 pt-[calc(6.5rem+env(safe-area-inset-top))] md:pb-20 md:pt-36">
        <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-ink/55">{t ? 'Playground' : 'Keerthi Vardhan'}</p>
          <h1 className="section-title mt-3 text-[clamp(34px,6vw,72px)] leading-[1.02]">{t ? t.title : 'Playground'}</h1>
          <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-ink/70 md:text-[18px]">
            {t ? t.blurb : 'Small tools I made for the parts of design I do most: gradients, type and colour. Free to use, nothing to sign up for.'}
          </p>
        </div>
      </section>

      {/* the sheet */}
      <div className="relative min-h-[60svh] rounded-t-[32px] bg-[#f7f6f2] pb-24 pt-6 shadow-[0_-30px_60px_-40px_rgba(15,30,55,0.5)] md:rounded-t-[44px] md:pb-28 md:pt-12">
        {t?.slug === 'shader' && <ShaderStudio />}
        {t?.slug === 'type' && <TypeChecker />}
        {t?.slug === 'picks' && <Picks />}
        {!t && (
          <div className="mx-auto grid w-full max-w-[1100px] gap-3 px-4 sm:grid-cols-3 md:px-6">
            {TOOLS.map(x => (
              <TransitionLink key={x.slug} to={`/playground/${x.slug}`} className="cs-glass group flex flex-col rounded-[22px] p-3 transition-transform duration-300 hover:-translate-y-1">
                <ToolThumb slug={x.slug} className="aspect-[16/10] w-full rounded-[16px] text-[56px]" />
                <span className="px-2 pb-2 pt-4">
                  <span className="block text-[18px] font-semibold tracking-[-0.01em] text-ink">{x.title}</span>
                  <span className="mt-1 block text-[14px] leading-snug text-ink/60">{x.short}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink/70">Open <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span></span>
                </span>
              </TransitionLink>
            ))}
          </div>
        )}
        {t && (
          <nav aria-label="Other tools" className="mx-auto mt-14 flex max-w-[1100px] flex-wrap justify-center gap-2 px-4">
            {TOOLS.filter(x => x.slug !== t.slug).map(x => (
              <TransitionLink key={x.slug} to={`/playground/${x.slug}`} className="cs-glass flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-[14px] font-medium text-ink/80 hover:text-ink">
                <ToolThumb slug={x.slug} className="h-8 w-8 rounded-full text-[13px]" />{x.title}
              </TransitionLink>
            ))}
          </nav>
        )}
      </div>
      <Toaster />
    </article>
  );
}
