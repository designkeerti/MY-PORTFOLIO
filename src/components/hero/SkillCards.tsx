import { TOOLS, type Tool } from './tools';

/**
 * The four skill cards at the top, either side of the name (wide
 * screens), or in a 2x2 grid on smaller ones.
 */

const CHIPS = ['linear-gradient(135deg,#f0ffc4,#c9ef6f)', 'linear-gradient(135deg,#efe6ff,#c4adff)', 'linear-gradient(135deg,#ffe7d6,#ffb68a)', 'linear-gradient(135deg,#dcf2ff,#93d2f5)'];

function Card({ t, i, className = '', shown }: { t: Tool; i: number; className?: string; shown: boolean }) {
  return (
    <div
      className={`w-full rounded-[14px] border border-white/80 bg-white/80 p-4 text-left text-ink shadow-[0_20px_44px_-24px_rgba(15,30,55,0.5)] backdrop-blur-md lg:w-[208px] ${className}`}
      style={{ opacity: shown ? 1 : 0, filter: shown ? 'blur(0)' : 'blur(10px)', transition: `opacity 800ms ease ${900 + i * 150}ms, filter 800ms ease ${900 + i * 150}ms` }}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-[9px] text-ink/80" style={{ background: CHIPS[i % CHIPS.length] }}>
        {t.tools[0].mark}
        <span className="sr-only">{t.tools.map(x => x.name).join(', ')}</span>
      </span>
      <div className="mt-3 text-[17px] font-semibold leading-tight tracking-[-0.01em]">{t.makes}</div>
      <p className="mt-1 text-[12.5px] leading-snug text-ink/55">{t.detail}</p>
    </div>
  );
}

export function SkillCards({ shown }: { shown: boolean }) {
  return (
    <>
      {/* two columns at the top, either side of the name */}
      <div className="pointer-events-none absolute left-[3%] top-12 z-30 hidden flex-col gap-4 lg:flex">
        {[0, 2].map(i => <div key={i} className="pointer-events-auto"><Card t={TOOLS[i]} i={i} shown={shown} /></div>)}
      </div>
      <div className="pointer-events-none absolute right-[3%] top-12 z-30 hidden flex-col gap-4 lg:flex">
        {[1, 3].map(i => <div key={i} className="pointer-events-auto"><Card t={TOOLS[i]} i={i} shown={shown} /></div>)}
      </div>
    </>
  );
}

/** Smaller screens: the same cards in a 2x2 grid. */
export function SkillGrid({ shown }: { shown: boolean }) {
  return (
    <div className="relative z-30 mt-6 grid w-full max-w-[560px] grid-cols-2 gap-3 lg:hidden">
      {TOOLS.map((t, i) => <Card key={t.makes} t={t} i={i} shown={shown} />)}
    </div>
  );
}
