import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Panel, Slider, Button, useCopy } from './ui';

/**
 * Draw an easing curve by dragging its two handles, watch it run, copy it as CSS or as an
 * array for JS animation libraries. y may go past 0..1 for overshoot.
 */

type Curve = [number, number, number, number];
const PRESETS: { name: string; c: Curve }[] = [
  { name: 'This site', c: [0.22, 0.61, 0.36, 1] },
  { name: 'ease', c: [0.25, 0.1, 0.25, 1] },
  { name: 'ease-out', c: [0, 0, 0.58, 1] },
  { name: 'ease-in-out', c: [0.42, 0, 0.58, 1] },
  { name: 'Out quart', c: [0.25, 1, 0.5, 1] },
  { name: 'Out expo', c: [0.16, 1, 0.3, 1] },
  { name: 'In-out cubic', c: [0.65, 0, 0.35, 1] },
  { name: 'Out back', c: [0.34, 1.56, 0.64, 1] },
  { name: 'Anticipate', c: [0.68, -0.6, 0.32, 1.6] },
];

// the graph: x 0..1, y from -0.5 to 1.5, drawn in a 300x300 box with a margin
const S = 300, PAD = 30, Y0 = -0.5, Y1 = 1.5;
const toX = (x: number) => PAD + x * (S - 2 * PAD);
const toY = (y: number) => PAD + (1 - (y - Y0) / (Y1 - Y0)) * (S - 2 * PAD);
const fromX = (px: number) => (px - PAD) / (S - 2 * PAD);
const fromY = (py: number) => Y0 + (1 - (py - PAD) / (S - 2 * PAD)) * (Y1 - Y0);
const r2 = (v: number) => Math.round(v * 100) / 100;

export function EasingEditor() {
  const [c, setC] = useState<Curve>(PRESETS[0].c);
  const [name, setName] = useState('This site');
  const [duration, setDuration] = useState(900);
  const [on, setOn] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<0 | 1 | null>(null);
  const copy = useCopy();
  const css = `cubic-bezier(${c.map(r2).join(', ')})`;

  // run back and forth so the curve is always on show
  useEffect(() => { const t = setInterval(() => setOn(v => !v), duration + 500); return () => clearInterval(t); }, [duration]);

  const move = (e: PointerEvent) => {
    if (dragging.current === null || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, fromX(((e.clientX - r.left) / r.width) * S)));
    const y = Math.min(2, Math.max(-1, fromY(((e.clientY - r.top) / r.height) * S)));
    setC(prev => (dragging.current === 0 ? [x, y, prev[2], prev[3]] : [prev[0], prev[1], x, y]) as Curve);
    setName('');
  };
  const grab = (i: 0 | 1) => (e: PointerEvent) => { dragging.current = i; (e.target as Element).setPointerCapture(e.pointerId); };

  const ease = css, tr = (ms: number, fn: string) => ({ transition: `transform ${ms}ms ${fn}`, transform: on ? 'translateX(var(--run))' : 'translateX(0)' });

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:gap-5 md:px-6">
      <Panel className="self-start p-4">
        <svg ref={svgRef} viewBox={`0 0 ${S} ${S}`} className="block w-full touch-none select-none" onPointerMove={move} onPointerUp={() => (dragging.current = null)} role="img" aria-label={`Easing curve ${css}`}>
          <rect x={toX(0)} y={toY(1)} width={toX(1) - toX(0)} height={toY(0) - toY(1)} rx="6" fill="#ffffff" stroke="rgba(23,25,30,.08)" />
          {[0.25, 0.5, 0.75].map(g => <line key={g} x1={toX(g)} x2={toX(g)} y1={toY(1)} y2={toY(0)} stroke="rgba(23,25,30,.06)" />)}
          {[0.25, 0.5, 0.75].map(g => <line key={'y' + g} y1={toY(g)} y2={toY(g)} x1={toX(0)} x2={toX(1)} stroke="rgba(23,25,30,.06)" />)}
          <line x1={toX(0)} y1={toY(0)} x2={toX(1)} y2={toY(1)} stroke="rgba(23,25,30,.15)" strokeDasharray="4 4" />
          <line x1={toX(0)} y1={toY(0)} x2={toX(c[0])} y2={toY(c[1])} stroke="#2c8bc6" strokeWidth="1.5" />
          <line x1={toX(1)} y1={toY(1)} x2={toX(c[2])} y2={toY(c[3])} stroke="#ff6a2a" strokeWidth="1.5" />
          <path d={`M${toX(0)},${toY(0)} C${toX(c[0])},${toY(c[1])} ${toX(c[2])},${toY(c[3])} ${toX(1)},${toY(1)}`} fill="none" stroke="#17191e" strokeWidth="3" strokeLinecap="round" />
          <circle cx={toX(c[0])} cy={toY(c[1])} r="11" fill="#2c8bc6" stroke="#fff" strokeWidth="3" className="cursor-grab" onPointerDown={grab(0)} />
          <circle cx={toX(c[2])} cy={toY(c[3])} r="11" fill="#ff6a2a" stroke="#fff" strokeWidth="3" className="cursor-grab" onPointerDown={grab(1)} />
        </svg>
        <p className="mt-2 text-center font-mono text-[13px] text-ink/70">{css}</p>
      </Panel>
      <div className="flex min-w-0 flex-col gap-4 self-start">
        <Panel className="p-5">
          <p className="pg-label">Presets</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map(p => (
              <button key={p.name} type="button" onClick={() => { setC(p.c); setName(p.name); }}
                className={`rounded-full border px-3 py-1.5 text-[13px] font-medium ${name === p.name ? 'border-ink bg-ink text-white' : 'border-ink/12 bg-white text-ink/70 hover:border-ink/30'}`}>{p.name}</button>
            ))}
          </div>
        </Panel>
        <Panel className="flex flex-col gap-4 p-5">
          <Slider label="Duration" min={200} max={2000} step={50} value={duration} onChange={setDuration} unit="ms" />
          {[{ label: 'Your curve', fn: ease, colour: '#17191e' }, { label: 'Linear', fn: 'linear', colour: 'rgba(23,25,30,.25)' }].map(row => (
            <div key={row.label}>
              <p className="mb-1.5 text-[12px] text-ink/50">{row.label}</p>
              <div className="relative h-10 rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(23,25,30,.08)] [--run:calc(100cqw-40px)] [container-type:inline-size]">
                <span className="absolute left-1 top-1 h-8 w-8 rounded-full" style={{ background: row.colour, ...tr(duration, row.fn) }} />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4">
            <span className="h-14 w-14 rounded-[16px] bg-ink" style={{ transition: `transform ${duration}ms ${ease}, opacity ${duration}ms ${ease}`, transform: on ? 'scale(1)' : 'scale(.55)', opacity: on ? 1 : 0.35 }} />
            <span className="text-[13px] text-ink/55">Scale and fade with the same curve.</span>
          </div>
        </Panel>
        <Panel className="flex flex-wrap gap-2 p-4">
          <Button onClick={() => copy(`transition-timing-function: ${css};`, 'CSS')}>Copy CSS</Button>
          <Button variant="ghost" onClick={() => copy(`[${c.map(r2).join(', ')}]`, 'Array')}>Copy as array (JS)</Button>
          <Button variant="ghost" onClick={() => copy(css, 'cubic-bezier')}>Copy cubic-bezier()</Button>
        </Panel>
      </div>
    </div>
  );
}
