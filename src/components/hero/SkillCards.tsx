import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { TOOLS, type Tool } from './tools';

/**
 * The four skill cards floating in the open sky either side of the portrait,
 * each tied to the work around the head by a dotted line (wide screens).
 * On smaller screens they sit in a 2x2 grid with no lines.
 */

const CHIPS = ['linear-gradient(135deg,#f0ffc4,#c9ef6f)', 'linear-gradient(135deg,#efe6ff,#c4adff)', 'linear-gradient(135deg,#ffe7d6,#ffb68a)', 'linear-gradient(135deg,#dcf2ff,#93d2f5)'];

// where each card floats (wide screens), and which side of the head its line goes to
const PLACE = [
  // dy: where on the ring's side the line lands (the ring tilts, so its left side sits lower)
  { cls: 'left-[3%] top-[38%] -rotate-[2deg]', side: -1, dy: 0.02 },
  { cls: 'right-[3%] top-[34%] rotate-[2deg]', side: 1, dy: -0.12 },
  { cls: 'left-[6%] top-[72%] rotate-[1.5deg]', side: -1, dy: 0.13 },
  { cls: 'right-[6%] top-[68%] -rotate-[1.5deg]', side: 1, dy: -0.03 },
];

function Card({ t, i, className = '', innerRef, shown }: { t: Tool; i: number; className?: string; innerRef?: (el: HTMLDivElement | null) => void; shown: boolean }) {
  return (
    <div
      ref={innerRef}
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

export function SkillCards({ container, stage, ring, radius, shown }: {
  container: RefObject<HTMLElement>; stage: RefObject<HTMLElement>;
  /** the ring's centre (fractions of the stage's width / height) and radius (fraction of its width) */
  ring: [number, number]; radius: number; shown: boolean;
}) {
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [paths, setPaths] = useState<{ d: string; x: number; y: number }[]>([]);

  // draw each dotted line from the card's inner edge to the side of the ring
  useLayoutEffect(() => {
    const measure = () => {
      const c = container.current, s = stage.current;
      if (!c || !s || !window.matchMedia('(min-width: 1024px)').matches) { setPaths([]); return; }
      const cr = c.getBoundingClientRect(), sr = s.getBoundingClientRect();
      const hx = sr.left - cr.left + sr.width * ring[0], hy = sr.top - cr.top + sr.height * ring[1];
      setPaths(PLACE.map((p, i) => {
        const el = cards.current[i];
        if (!el) return { d: '', x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        const x0 = (p.side < 0 ? r.right : r.left) - cr.left, y0 = r.top - cr.top + r.height / 2;
        const x1 = hx + p.side * sr.width * radius * 0.97, y1 = hy + sr.width * p.dy;
        const mx = (x0 + x1) / 2;
        return { d: `M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1}`, x: x1, y: y1 };
      }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (container.current) ro.observe(container.current);
    if (stage.current) ro.observe(stage.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [container, stage, ring, radius]);

  return (
    <>
      {/* wide screens: floating, with dotted connectors */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full overflow-visible lg:block"
        style={{ opacity: shown ? 1 : 0, transition: 'opacity 1s ease 1.4s' }}>
        {paths.map((p, i) => p.d && (
          <g key={i}>
            <path d={p.d} fill="none" stroke="rgb(var(--ink-rgb) / 0.5)" strokeWidth="1.5" strokeDasharray="0.5 6" strokeLinecap="round" />
            <circle cx={p.x} cy={p.y} r="3" fill="rgb(var(--ink-rgb) / 0.45)" />
          </g>
        ))}
      </svg>
      {TOOLS.map((t, i) => (
        <div key={t.makes} className={`absolute z-30 hidden lg:block ${PLACE[i].cls}`}>
          <Card t={t} i={i} shown={shown} innerRef={el => { cards.current[i] = el; }} />
        </div>
      ))}
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
