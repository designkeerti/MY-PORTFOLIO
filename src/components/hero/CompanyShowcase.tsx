import { motion, useTransform, type MotionValue } from 'framer-motion';
import { COMPANIES, type Company } from './tools';

/**
 * The companies, given room: a grid of frosted tiles, each logo large and in its
 * own colours (or in ink, for logos that are white-on-dark). Driven by `enter`
 * (0 -> 1): the tiles rise into place one after another.
 */

function Tile({ c, i, enter }: { c: Company; i: number; enter: MotionValue<number> }) {
  const start = 0.08 * i;
  const k = useTransform(enter, [start, start + 0.45], [0, 1], { clamp: true });
  const y = useTransform(k, v => `${((1 - v) ** 2 * 60).toFixed(2)}vh`);
  const opacity = useTransform(k, [0, 0.6], [0, 1]);
  const scale = useTransform(k, [0, 1], [0.92, 1]);
  const ink = c.tile === 'ink';
  return (
    <motion.li style={{ y, opacity, scale }} className="list-none">
      <a href={c.href} target="_blank" rel="noopener noreferrer" aria-label={c.name}
        className="group flex h-[clamp(84px,15svh,150px)] items-center justify-center gap-2.5 rounded-[14px] border border-white/80 bg-white/70 px-6 shadow-[0_20px_44px_-26px_rgba(15,30,55,0.5)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1">
        <img
          src={ink ? c.mono : c.color} alt="" draggable={false}
          className={`block w-auto max-w-[70%] object-contain ${ink ? 'brightness-0 opacity-85' : ''}`}
          style={{ height: `clamp(${Math.round(c.h * 0.9)}px, ${(c.h * 0.16).toFixed(1)}vh, ${Math.round(c.h * 1.5)}px)` }}
        />
        {c.word && <span className="text-[12px] font-medium uppercase tracking-[0.3em] text-ink md:text-[14px]">{c.word}</span>}
      </a>
    </motion.li>
  );
}

export function CompanyShowcase({ enter, className }: { enter: MotionValue<number>; className?: string }) {
  return (
    <ul aria-label="Companies I've worked with" className={`grid w-full grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 ${className ?? ''}`}>
      {COMPANIES.map((c, i) => <Tile key={c.name} c={c} i={i} enter={enter} />)}
    </ul>
  );
}
