import { useEffect } from 'react';
import { PAIRINGS, PALETTES, fontByName, fallbackFor, loadFont, contrast, grade } from './data';
import { TransitionLink } from '../components/PageTransition';
import { useToast } from './ui';

/** My font pairings and colour combinations: specimens to look at, swatches to copy. */
export function Picks() {
  const toast = useToast();
  useEffect(() => { PAIRINGS.forEach(p => [p.heading, p.body].forEach(n => { const f = fontByName(n); if (f) loadFont(f); })); }, []);
  const copy = async (hex: string) => { try { await navigator.clipboard.writeText(hex); toast(`${hex} copied`); } catch { toast('Copy blocked by the browser'); } };
  const fam = (n: string) => { const f = fontByName(n); return f ? `"${f.name}", ${fallbackFor(f.cat)}` : n; };

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-16 px-4 md:gap-24 md:px-6">
      <section aria-labelledby="pairings">
        <header className="mb-6 flex flex-col items-center text-center md:mb-9">
          <span className="pg-label">01 · Type</span>
          <h2 id="pairings" className="section-title mt-2 text-[clamp(28px,4vw,44px)] leading-[1.06]">Font pairings</h2>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAIRINGS.map(p => (
            <article key={p.heading + p.body} className="cs-glass flex flex-col rounded-[20px] p-5">
              <p style={{ fontFamily: fam(p.heading), fontWeight: p.weight ?? 400, fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em' }} className="text-ink">Aa Gg Rr</p>
              <p style={{ fontFamily: fam(p.body) }} className="mt-3 text-[14.5px] leading-relaxed text-ink/70">{p.note}</p>
              <div className="mt-auto pt-4">
                <p className="text-[13px] font-semibold text-ink">{p.heading} <span className="font-normal text-ink/45">×</span> {p.body}</p>
                <p className="text-[12px] uppercase tracking-[0.16em] text-ink/45">{p.from}</p>
                <TransitionLink to={`/playground/type?h=${encodeURIComponent(p.heading)}&b=${encodeURIComponent(p.body)}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink/75 underline decoration-ink/20 underline-offset-4 hover:text-ink">
                  Open in the checker →
                </TransitionLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="colours">
        <header className="mb-6 flex flex-col items-center text-center md:mb-9">
          <span className="pg-label">02 · Colour</span>
          <h2 id="colours" className="section-title mt-2 text-[clamp(28px,4vw,44px)] leading-[1.06]">Colour combinations</h2>
          <p className="mt-3 max-w-[48ch] text-[15px] text-ink/60">Tap any colour to copy it. Each sample shows the text colour on its background, with its contrast.</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PALETTES.map(p => {
            const r = contrast(p.fg, p.bg);
            return (
              <article key={p.name} className="cs-glass overflow-hidden rounded-[20px]">
                <div className="flex h-24">
                  {p.swatches.map(s => (
                    <button key={s.hex} type="button" onClick={() => copy(s.hex)} title={`Copy ${s.hex}`} aria-label={`Copy ${s.name} ${s.hex}`}
                      className="group relative flex-1 transition-[flex-grow] duration-300 hover:flex-[1.6]" style={{ background: s.hex }}>
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-black/35 px-1.5 py-0.5 font-mono text-[10px] uppercase text-white opacity-0 transition-opacity group-hover:opacity-100">{s.hex}</span>
                    </button>
                  ))}
                </div>
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[16px] font-semibold text-ink">{p.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">{p.from}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {p.swatches.map(s => <button key={s.hex} type="button" onClick={() => copy(s.hex)} className="font-mono text-[11.5px] uppercase text-ink/55 hover:text-ink">{s.name} {s.hex}</button>)}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-[14px] px-4 py-3" style={{ background: p.bg, color: p.fg }}>
                    <span className="text-[14px] font-medium">Text on background</span>
                    <span className="rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: p.accent, color: p.accentInk }}>Button</span>
                  </div>
                  <p className="mt-2 text-[12.5px] text-ink/55"><span className="font-mono tabular-nums">{r.toFixed(1)}:1</span> · {grade(r)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
