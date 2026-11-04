import { TOOLS, type Tool } from './tools';
import { depth } from './useHeroParallax';

/**
 * The four skill cards scattered either side, a little above centre (wide
 * screens), or in a 2x2 grid on smaller ones.
 */

const CHIPS = ['linear-gradient(135deg,#f0ffc4,#c9ef6f)', 'linear-gradient(135deg,#efe6ff,#c4adff)', 'linear-gradient(135deg,#ffe7d6,#ffb68a)', 'linear-gradient(135deg,#dcf2ff,#93d2f5)'];

// how a card at a given depth reads: farther = slightly smaller, softer and fainter
type Look = { blur: number; opacity: number };
const NEAR: Look = { blur: 0, opacity: 1 };

function Card({ t, i, className = '', shown, look = NEAR }: { t: Tool; i: number; className?: string; shown: boolean; look?: Look }) {
  return (
    <div
      className={`w-full rounded-[14px] border border-white/80 bg-white/80 p-4 text-left text-ink shadow-[0_20px_44px_-24px_rgba(15,30,55,0.5)] backdrop-blur-md lg:w-[208px] ${className}`}
      style={{ opacity: shown ? look.opacity : 0, filter: shown ? `blur(${look.blur}px)` : 'blur(10px)', transition: `opacity 800ms ease ${900 + i * 150}ms, filter 800ms ease ${900 + i * 150}ms` }}
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

// Scattered either side, a little above the middle of the hero, each at its own angle.
// Each card sits at its own distance: how far it travels with the pointer (px). The
// lower pair floats nearer, the upper pair farther; size, softness and opacity follow.
const DEPTH = [20, 12, 36, 28];
const NEAREST = 36, FARTHEST = 12;
const lookAt = (d: number) => {
  const k = (d - FARTHEST) / (NEAREST - FARTHEST);        // 0 farthest .. 1 nearest
  return { scale: 0.9 + 0.16 * k, look: { blur: +(0.9 * (1 - k) ** 2).toFixed(2), opacity: +(0.82 + 0.18 * k).toFixed(2) } };
};
const SCATTER = [
  'left-[5%] top-[24%] -rotate-[6deg]',
  'right-[6%] top-[21%] rotate-[5deg]',
  'left-[12%] top-[45%] rotate-[4deg]',
  'right-[11%] top-[43%] -rotate-[4deg]',
];

export function SkillCards({ shown }: { shown: boolean }) {
  return (
    <>
      {TOOLS.map((t, i) => {
        const { scale, look } = lookAt(DEPTH[i]);
        return (
          <div key={t.makes} className={`absolute hidden transition-transform duration-500 hover:rotate-0 lg:block ${SCATTER[i]}`}
            style={{ translate: depth(DEPTH[i], DEPTH[i] * 0.7), scale: String(scale), zIndex: 30 + DEPTH[i] }}>
            <Card t={t} i={i} shown={shown} look={look} />
          </div>
        );
      })}
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
