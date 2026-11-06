import { motion, useTransform, type MotionValue } from 'framer-motion';
import { COMPANIES, type Company } from './tools';

/**
 * Where I work, under the name: no boxes, just the logos. The current company on
 * its own line, then everyone before. Both lines rise in together as `enter`
 * goes 0 -> 1. Logos are in ink, and show their own colours on hover.
 */

const CURRENT = 'WeWork';

function Logo({ c, scale = 1 }: { c: Company; scale?: number }) {
  const h = Math.round(c.h * scale);
  return (
    <a href={c.href} target="_blank" rel="noopener noreferrer" aria-label={c.name} title={c.name}
      className="group relative flex shrink-0 items-center gap-2 opacity-80 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100">
      <span className="relative block" style={{ height: h }}>
        <img src={c.mono} alt="" draggable={false} className="logo-ink block h-full w-auto brightness-0 transition-[opacity,filter] duration-300 group-hover:opacity-0 group-focus-visible:opacity-0" />
        {/* hover: the brand's own version (all read on the dark: some are white by design) */}
        <img src={c.color} alt="" draggable={false} loading="lazy" className="absolute inset-0 block h-full w-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
      </span>
      {c.word && <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-ink md:text-[13px]" style={{ fontSize: `${Math.round(12 * scale)}px` }}>{c.word}</span>}
    </a>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink/50 md:text-[12px]">{children}</p>
);

export function CompanyShowcase({ enter, className }: { enter: MotionValue<number>; className?: string }) {
  const current = COMPANIES.find(c => c.name === CURRENT)!;
  const before = COMPANIES.filter(c => c.name !== CURRENT);
  const y = useTransform(enter, v => `${((1 - v) ** 2 * 8).toFixed(2)}svh`);
  const opacity = useTransform(enter, [0, 0.45], [0, 1]);
  const filter = useTransform(enter, v => (v < 0.6 ? `blur(${((0.6 - v) * 10).toFixed(1)}px)` : 'none'));
  // the links only take taps once the logos are mostly in, and are truly hidden (no taps, no
  // tab stops) while they have yet to appear: faded out, they still sit over the hero
  const pointerEvents = useTransform(enter, v => (v > 0.5 ? 'auto' : 'none'));
  const visibility = useTransform(enter, v => (v > 0.02 ? 'visible' : 'hidden'));
  return (
    <motion.div style={{ y, opacity, filter, pointerEvents, visibility }} className={`flex flex-col items-center gap-10 md:gap-14 ${className ?? ''}`}>
      <div className="flex flex-col items-center gap-4">
        <Label>Currently designing at</Label>
        <Logo c={current} scale={2.1} />
      </div>
      <div className="flex flex-col items-center gap-5">
        <Label>Previously with</Label>
        <ul aria-label="Companies I've worked with before" className="flex flex-wrap items-center justify-center gap-x-9 gap-y-6 md:gap-x-14">
          {before.map(c => <li key={c.name}><Logo c={c} scale={1.35} /></li>)}
        </ul>
      </div>
    </motion.div>
  );
}
