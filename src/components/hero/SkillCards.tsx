import { useEffect, useRef, useState } from 'react';
import { TOOLS, type Tool } from './tools';

/**
 * The four skill cards scattered either side, a little above centre (wide
 * screens), or in a 2x2 grid on smaller ones.
 */

const CHIPS = ['linear-gradient(135deg,#f0ffc4,#c9ef6f)', 'linear-gradient(135deg,#efe6ff,#c4adff)', 'linear-gradient(135deg,#ffe7d6,#ffb68a)', 'linear-gradient(135deg,#dcf2ff,#93d2f5)'];

// how a card at a given depth reads: farther = slightly smaller, softer and fainter
type Look = { blur: number; opacity: number };
const NEAR: Look = { blur: 0, opacity: 1 };

function Card({ t, i, className = '', shown, look = NEAR, live = false }: { t: Tool; i: number; className?: string; shown: boolean; look?: Look; live?: boolean }) {
  return (
    <div
      className={`w-full rounded-[14px] border border-white/80 bg-white/80 p-4 text-left text-ink shadow-[0_20px_44px_-24px_rgba(15,30,55,0.5)] backdrop-blur-md lg:w-[208px] ${className}`}
      style={{
        // after the intro, the focus effect drives --fo / --fb every frame (no CSS transition)
        opacity: shown ? (live ? `var(--fo, ${look.opacity})` : look.opacity) : 0,
        filter: shown ? (live ? `blur(var(--fb, ${look.blur}px))` : `blur(${look.blur}px)`) : 'blur(10px)',
        transition: live ? 'none' : `opacity 800ms ease ${900 + i * 150}ms, filter 800ms ease ${900 + i * 150}ms`,
      }}
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
  const wraps = useRef<(HTMLDivElement | null)[]>([]);
  // the intro fades the cards in with CSS; after it, the focus effect takes over
  const [live, setLive] = useState(false);
  useEffect(() => {
    if (!shown) return;
    const id = setTimeout(() => setLive(true), 900 + TOOLS.length * 150 + 850);
    return () => clearTimeout(id);
  }, [shown]);

  // Focus, continuous with distance: as the pointer nears a card, that card gradually
  // grows, sharpens, comes forward and travels further with the parallax; the others
  // ease back in proportion. Moving away reverses it smoothly.
  useEffect(() => {
    if (!live) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const base = DEPTH.map(lookAt);
    const f = DEPTH.map(() => 0);                 // eased focus per card, 0..1
    let mx = -1e4, my = -1e4, raf = 0;
    const apply = () => {
      const top = Math.max(...f);
      wraps.current.forEach((el, i) => {
        if (!el) return;
        const { scale, look } = base[i];
        const k = f[i], others = Math.max(0, top - k);
        el.style.scale = (scale * (1 + 0.16 * k - 0.07 * others)).toFixed(4);
        el.style.zIndex = String(30 + DEPTH[i] + Math.round(k * 60));
        el.style.setProperty('--d', (DEPTH[i] * (1 + 1.2 * k - 0.4 * others)).toFixed(2));
        el.style.setProperty('--fo', (look.opacity + (1 - look.opacity) * k - 0.22 * others).toFixed(3));
        el.style.setProperty('--fb', `${(look.blur * (1 - k) + 1.1 * others).toFixed(2)}px`);
      });
    };
    const tick = () => {
      let moving = false;
      const vw = window.innerWidth;
      wraps.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        // starts building from about a third of the screen away, full when on the card
        const reach = Math.max(320, vw * 0.34), inner = r.width * 0.45;
        const x = Math.max(0, Math.min(1, 1 - (d - inner) / (reach - inner)));
        const target = x * x * (3 - 2 * x);         // smoothstep
        f[i] += (target - f[i]) * 0.1;
        if (Math.abs(target - f[i]) > 0.002) moving = true;
      });
      apply();
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; kick(); };
    const onLeave = () => { mx = -1e4; my = -1e4; kick(); };
    apply();
    if (!fine || reduce) return;
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', kick, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', kick);
    };
  }, [live]);

  return (
    <>
      {TOOLS.map((t, i) => {
        const { scale, look } = lookAt(DEPTH[i]);
        return (
          <div key={t.makes} ref={el => { wraps.current[i] = el; }}
            className={`absolute hidden transition-transform duration-500 hover:rotate-0 lg:block ${SCATTER[i]}`}
            style={{
              // parallax travel comes from --d, which the focus effect raises as the pointer nears
              ['--d' as string]: DEPTH[i],
              translate: 'calc(var(--px, 0) * var(--d) * 1px) calc(var(--py, 0) * var(--d) * 0.7px)',
              scale: String(scale), zIndex: 30 + DEPTH[i],
            }}>
            <Card t={t} i={i} shown={shown} look={look} live={live} />
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
