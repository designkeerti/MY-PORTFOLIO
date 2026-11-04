import { useEffect, useRef, type ReactNode } from 'react';
import { TOOLS } from './tools';

/**
 * A ring of glass cards orbiting the head, in two rows: what I make (the
 * tool cards), small pieces of UI, and the cats. Each card blurs and fades
 * as it turns away and sharpens as it comes back round, so the ring seems
 * to pass behind the head without needing to be cut out by it.
 *
 * Sized from the CSS variable --stage-w set by the parent.
 */

// soft pastel icon chips, as in the reference
const CHIPS = ['linear-gradient(135deg,#f0ffc4,#c9ef6f)', 'linear-gradient(135deg,#efe6ff,#c4adff)', 'linear-gradient(135deg,#ffe7d6,#ffb68a)', 'linear-gradient(135deg,#dcf2ff,#93d2f5)'];

const Glass = ({ children, className = '' }: { children?: ReactNode; className?: string }) => (
  <div className={`h-full w-full rounded-[18px] border border-white/80 bg-white/75 p-[9%] text-ink shadow-[0_18px_40px_-18px_rgba(20,40,70,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] ${className}`}>{children}</div>
);

function ToolPanel({ i }: { i: number }) {
  const t = TOOLS[i];
  return (
    <Glass className="flex flex-col justify-center">
      <div className="flex items-center gap-[7%]">
        <span className="flex aspect-square w-[22%] items-center justify-center rounded-[28%] text-ink/80" style={{ background: CHIPS[i % CHIPS.length] }}>
          <span className="scale-[0.8]">{t.tools[0].mark}</span>
        </span>
        <span className="font-display text-[calc(var(--stage-w)*0.034)] font-semibold leading-tight">{t.makes}</span>
      </div>
      <p className="mt-[5%] text-[calc(var(--stage-w)*0.022)] leading-snug text-ink/55">{t.detail}</p>
    </Glass>
  );
}

const Toggle = () => (
  <Glass className="flex flex-col justify-center gap-[10%]">
    {[['Auto layout', true], ['Snap to grid', false]].map(([l, on]) => (
      <div key={String(l)} className="flex items-center justify-between text-[calc(var(--stage-w)*0.026)] font-medium">
        <span>{l}</span>
        <span className={`relative h-[calc(var(--stage-w)*0.034)] w-[calc(var(--stage-w)*0.06)] rounded-full ${on ? 'bg-ink' : 'bg-ink/15'}`}>
          <span className={`absolute top-[12%] aspect-square h-[76%] rounded-full bg-white ${on ? 'right-[8%]' : 'left-[8%]'}`} />
        </span>
      </div>
    ))}
  </Glass>
);

const Tokens = () => (
  <Glass className="flex flex-col justify-center">
    <div className="text-[calc(var(--stage-w)*0.026)] font-semibold">Tokens</div>
    <div className="mt-[8%] flex gap-[6%]">
      {['#17191e', '#5b6b80', '#93d2f5', '#c4adff', '#ffb68a'].map(c => <span key={c} className="aspect-square flex-1 rounded-full border border-white" style={{ background: c }} />)}
    </div>
  </Glass>
);

const Shipped = () => (
  <Glass className="flex flex-col justify-center">
    <div className="flex items-center gap-[6%] text-[calc(var(--stage-w)*0.026)] font-semibold">
      <span className="flex aspect-square w-[16%] items-center justify-center rounded-full bg-[#c9ef6f] text-[calc(var(--stage-w)*0.022)]">✓</span>
      Shipped to production
    </div>
    <div className="mt-[9%] h-[calc(var(--stage-w)*0.01)] w-full overflow-hidden rounded-full bg-ink/10"><div className="h-full w-full rounded-full bg-ink" /></div>
  </Glass>
);

const Photo = ({ src, alt }: { src: string; alt: string }) => (
  <div className="h-full w-full overflow-hidden rounded-[18px] border border-white/80 shadow-[0_18px_40px_-18px_rgba(20,40,70,0.45)]">
    <img src={src} alt={alt} draggable={false} className="h-full w-full object-cover grayscale" />
  </div>
);

const Prototype = () => (
  <Glass className="flex items-center gap-[8%]">
    <span className="flex aspect-square w-[24%] items-center justify-center rounded-full bg-ink text-[calc(var(--stage-w)*0.024)] text-white">▶</span>
    <span className="leading-tight">
      <span className="block text-[calc(var(--stage-w)*0.028)] font-semibold">Prototype</span>
      <span className="block text-[calc(var(--stage-w)*0.021)] text-ink/55">Play the flow</span>
    </span>
  </Glass>
);

// Two rows; each row its own turn around the head (the second offset by half a step).
const ROWS: ReactNode[][] = [
  [<ToolPanel i={0} />, <Photo src="/world/cat-bench.jpg" alt="A cat on a bench" />, <Toggle />, <ToolPanel i={1} />, <Prototype />],
  [<ToolPanel i={2} />, <Tokens />, <Photo src="/world/cats-turf.jpg" alt="Two cats on a lawn" />, <ToolPanel i={3} />, <Shipped />],
];

export function OrbitRing({ shown, head, className }: { shown: boolean; head: [number, number]; className?: string }) {
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, angle = 18, last = performance.now();
    let tx = 0, ty = 0, cx = 0, cy = 0, appear = reduce ? 1 : 0;
    const onMove = (e: PointerEvent) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });

    function frame(now: number) {
      const dt = Math.min(64, now - last); last = now;
      if (!document.hidden) {
        if (!reduce) angle = (angle + dt * 0.0075) % 360;         // a full turn in ~48s
        cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
        if (shownRef.current && appear < 1) appear = Math.min(1, appear + dt / 1400);
        if (tiltRef.current) tiltRef.current.style.transform = `rotateX(${-8 - cy * 6}deg) rotateZ(-7deg) rotateY(${cx * 10}deg)`;
        const W = boxRef.current?.getBoundingClientRect().width || 400;
        const R = W * 0.4;
        ROWS.forEach((row, r) => row.forEach((_, i) => {
          const el = panels.current[r * 10 + i];
          if (!el) return;
          const yaw = ((i * 360) / row.length + (r ? 180 / row.length : 0) + angle * (r ? -1 : 1) * 0.85) * Math.PI / 180;
          const f = Math.cos(yaw);                                  // 1 facing you, -1 behind the head
          const op = Math.max(0, Math.min(1, (f + 0.12) / 0.55)) * appear;
          const blur = (1 - Math.max(0, Math.min(1, (f - 0.05) / 0.7))) * 12;
          el.style.transform = `translate3d(${Math.sin(yaw) * R}px, ${r ? W * 0.095 : -W * 0.095}px, ${f * R}px) rotateY(${yaw * 180 / Math.PI}deg)`;
          el.style.opacity = op.toFixed(3);
          el.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none';
          el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
        }));
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove); };
  }, []);

  return (
    <div ref={boxRef} className={className} style={{ perspective: '1500px', perspectiveOrigin: `${head[0] * 100}% ${head[1] * 100}%` }} aria-label="What I make, orbiting" role="group">
      {/* the ring's centre sits on the head */}
      <div ref={tiltRef} className="absolute h-0 w-0" style={{ left: `${head[0] * 100}%`, top: `${head[1] * 100}%`, transformStyle: 'preserve-3d' }}>
        {ROWS.map((row, r) => row.map((node, i) => (
          <div
            key={`${r}-${i}`}
            ref={el => { panels.current[r * 10 + i] = el; }}
            className="absolute"
            style={{
              width: 'calc(var(--stage-w) * 0.31)', height: 'calc(var(--stage-w) * 0.18)',
              left: 'calc(var(--stage-w) * -0.155)', top: 'calc(var(--stage-w) * -0.09)',
              opacity: 0, willChange: 'transform, opacity, filter',
            }}
          >
            {node}
          </div>
        )))}
      </div>
    </div>
  );
}
