import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BPS, LEVELS, LEVEL_USE, MODES, PALETTES, RADII, RADIUS_SEM, SEMANTIC, SPACE_SEM, STEPS, familyCss, shadowCss, type Mode, type Resolved, type State } from './model';
import { Delta } from './controls';
import { TABS, type Tab } from './Editor';
import { FRAME_W } from './Preview';
import { inkOn } from './Pickers';

/**
 * View two, the spec. One clean picture per group of tokens, drawn from the live values, so
 * every change moves the picture itself: corners re-curve, gaps open, type re-sets.
 */

type Deltas = Record<string, { from: string; to: string }>;
type Props = { res: Resolved; st: State; tab: Tab; setTab: (t: Tab) => void; deltas: Deltas; mode: Mode | 'both' };

const BLUE = '#2f6bed', PINK = '#ff2d6f';
const EASE = 'cubic-bezier(.2,.7,.2,1)';
const HATCH = 'repeating-linear-gradient(-45deg, rgba(255,45,111,.18) 0 1.5px, transparent 1.5px 7px)';

export function Outline(p: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Spec" className="flex flex-wrap gap-1">
        {TABS.map(t => (
          <button key={t.id} role="tab" type="button" aria-selected={p.tab === t.id} onClick={() => p.setTab(t.id)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${p.tab === t.id ? 'bg-ink text-white' : 'text-ink/60 hover:bg-ink/[0.06] hover:text-ink'}`}>{t.label}</button>
        ))}
      </div>
      <div key={p.tab} className="tk-fade">
        {p.tab === 'radius' && <RadiusView {...p} />}
        {p.tab === 'color' && <ColourView {...p} />}
        {p.tab === 'type' && <TypeView {...p} />}
        {p.tab === 'space' && <SpaceView {...p} />}
        {p.tab === 'depth' && <DepthView {...p} />}
        {p.tab === 'grid' && <GridView {...p} />}
      </div>
    </div>
  );
}

const Stage = ({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) =>
  <div className={`relative overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(23,25,30,0.07)] ${className}`} style={style}>{children}</div>;
const Caption = ({ children }: { children: ReactNode }) => <p className="max-w-[68ch] px-1 text-[13.5px] leading-relaxed text-ink/60">{children}</p>;
const Pill = ({ children, tone = 'ink', style, className = '' }: { children: ReactNode; tone?: 'ink' | 'blue' | 'pink'; style?: CSSProperties; className?: string }) => (
  <span className={`pointer-events-none whitespace-nowrap rounded-[6px] px-1.5 py-[3px] font-mono text-[11px] font-medium leading-none text-white ${className}`}
    style={{ background: tone === 'blue' ? BLUE : tone === 'pink' ? PINK : '#17191e', ...style }}>{children}</span>
);
/** a quiet line of values under a picture */
const Values = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap gap-x-7 gap-y-3 border-t border-ink/[0.06] px-6 py-4 first:border-t-0">{children}</div>;
const Value = ({ k, v, d }: { k: string; v: ReactNode; d?: { from: string; to: string } }) => (
  <span className="flex flex-col gap-0.5">
    <span className="font-mono text-[11px] text-ink/45">{k}</span>
    <span className="flex items-center gap-1.5 font-mono text-[13px] text-ink">{v}{d && <Delta from={d.from} to={d.to} />}</span>
  </span>
);
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/* ---------- radius: one corner, very close, with everything that nests inside it ---------- */

function RadiusView({ res, deltas }: Props) {
  const [ref, w] = useWidth();
  const L = res.semantic.light;
  const outer = res.radius.sem.dialog.px > 999 ? 64 : res.radius.sem.dialog.px;
  const gaps = (['inset/sm', 'inset/xs', 'inset/xs'] as const).map(id => ({ id, px: res.space.sem[id].px }));
  const names = ['Dialog', 'Card', 'Button', 'Icon'];
  const fills = [L['bg/raised'].hex, L['bg/subtle'].hex, L['bg/brand-subtle'].hex, L['bg/brand'].hex];
  const strokes = [L['border/default'].hex, L['border/default'].hex, L['border/brand'].hex, L['bg/brand'].hex];
  const radii = [outer], offs = [0];
  gaps.forEach((g, i) => { radii.push(Math.max(0, radii[i] - g.px)); offs.push(offs[i] + g.px); });
  const total = offs[3];
  const H = 440, X0 = 56, Y0 = 64;
  const minGap = Math.max(1, Math.min(...gaps.map(g => g.px)));
  const Z = Math.max(1.4, Math.min(Math.max(24 / minGap, 2), (H - Y0 - 70) / Math.max(1, outer + total), (w - X0 - 260) / Math.max(1, outer + total)));
  const cx = X0 + outer * Z, cy = Y0 + outer * Z;   // the shared centre
  const markX = Math.min(w - 170, X0 + (outer + total) * Z + 130);
  // the layers fade away from the corner, so the eye stays on it
  const reach = Math.max(260, (outer + total) * Z + 300);
  const fade = `radial-gradient(circle ${reach}px at ${X0}px ${Y0}px, #000 55%, transparent 100%)`;

  return (
    <div className="flex flex-col gap-4">
      <Stage>
        <div ref={ref} className="relative" style={{ height: H }}>
          <div className="absolute inset-0" style={{ WebkitMaskImage: fade, maskImage: fade }}>
          {radii.map((r, i) => (
            <div key={i} className="absolute" style={{
              left: X0 + offs[i] * Z, top: Y0 + offs[i] * Z, width: 3000, height: 3000,
              borderTopLeftRadius: r * Z, border: `1.5px solid ${strokes[i]}`,
              background: i < 3 ? `${HATCH}, ${fills[i]}` : fills[i],
              transition: `left .55s ${EASE}, top .55s ${EASE}, border-top-left-radius .55s ${EASE}, background-color .55s`,
            }}>
              <span className="absolute flex items-center gap-1.5 transition-[left] duration-500" style={{ left: Math.max(r * Z, 6) + 12, top: Math.max(2, Math.min(8, (gaps[i]?.px ?? 8) * Z / 2 - 9)) }}>
                <span className="text-[12px] font-semibold" style={{ color: i === 3 ? inkOn(fills[3]) : '#17191e' }}>{names[i]}</span>
                <Pill tone="blue">r {r}</Pill>
              </span>
            </div>
          ))}
          </div>
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {radii.map((r, i) => r > 0 && (
              <path key={i} d={`M${X0 + offs[i] * Z},${Y0 + (offs[i] + r) * Z} A${r * Z},${r * Z} 0 0 1 ${X0 + (offs[i] + r) * Z},${Y0 + offs[i] * Z}`}
                fill="none" stroke={BLUE} strokeWidth={2.5} strokeLinecap="round" style={{ transition: `d .55s ${EASE}` }} />
            ))}
            {outer > 0 && (
              <g>
                <line x1={cx} y1={cy} x2={cx - outer * Z * 0.7071} y2={cy - outer * Z * 0.7071} stroke={BLUE} strokeWidth={1} strokeDasharray="3 4" opacity={0.7} />
                <line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} stroke={BLUE} strokeWidth={1} />
                <line x1={cx} y1={cy - 9} x2={cx} y2={cy + 9} stroke={BLUE} strokeWidth={1} />
                <circle cx={cx} cy={cy} r={3} fill={BLUE} />
                {radii.map((r, i) => r > 0 && <circle key={i} cx={cx - r * Z * 0.7071} cy={cy - r * Z * 0.7071} r={3} fill="#fff" stroke={BLUE} strokeWidth={1.5} />)}
              </g>
            )}
            {gaps.map((_, i) => {
              const y1 = Y0 + offs[i] * Z, y2 = Y0 + offs[i + 1] * Z;
              return (
                <g key={i}>
                  <line x1={markX} y1={y1} x2={markX} y2={y2} stroke={PINK} strokeWidth={1.5} />
                  <line x1={markX - 5} y1={y1} x2={markX + 5} y2={y1} stroke={PINK} strokeWidth={1.5} />
                  <line x1={markX - 5} y1={y2} x2={markX + 5} y2={y2} stroke={PINK} strokeWidth={1.5} />
                </g>
              );
            })}
          </svg>
          {gaps.map((g, i) => (
            <Pill key={i} tone="pink" className="absolute -translate-y-1/2 transition-[top] duration-500" style={{ left: markX + 12, top: Y0 + ((offs[i] + offs[i + 1]) / 2) * Z }}>
              {g.id} · {g.px}
            </Pill>
          ))}
          {outer > 0 && <Pill className="absolute transition-[left,top] duration-500" style={{ left: cx + 12, top: cy + 8 }}>shared centre</Pill>}
        </div>
      </Stage>
      <Caption>
        Each inner corner is the corner around it minus the space between them ({radii.map((r, i) => (i === 0 ? `${r}` : ` − ${gaps[i - 1].px} = ${r}`)).join('')}), so every curve shares one centre and the rings stay even.
        Change the corners or the spacing and they all follow.{radii.some((r, i) => i > 0 && r === 0) ? ' Where the space is bigger than the radius around it, the corner goes square.' : ''}
      </Caption>
      <Stage>
        <Values>
          {RADII.map(k => (
            <span key={k} className="flex items-center gap-2.5">
              <span className="h-7 w-7 border-[1.5px] border-b-0 border-r-0 border-ink/70 transition-[border-radius] duration-500" style={{ borderTopLeftRadius: k === 'full' ? 28 : Math.min(res.radius.prims[k] * 1.4, 28) }} />
              <Value k={k} v={k === 'full' ? '∞' : res.radius.prims[k]} d={deltas[`radius/${k}`]} />
            </span>
          ))}
        </Values>
        <Values>
          {RADIUS_SEM.map(s => <Value key={s.id} k={`radius/${s.id}`} v={<>{res.radius.sem[s.id].ref} <span className="text-ink/40">{res.radius.sem[s.id].ref === 'full' ? '∞' : res.radius.sem[s.id].px}</span></>} />)}
        </Values>
      </Stage>
    </div>
  );
}

/* ---------- colour: the ramps, and what each role points at ---------- */

function ColourView({ res, deltas, mode }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const lit = hover ? new Set(MODES.map(m => res.semantic[m][hover]?.ref)) : new Set<string>();
  const modes: Mode[] = mode === 'both' ? MODES : [mode];
  return (
    <div className="flex flex-col gap-4">
      <Stage className="p-6">
        <div className="flex flex-col gap-3">
          {PALETTES.map(p => (
            <div key={p} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3">
              <span className="text-[12.5px] font-medium text-ink/60">{p}</span>
              <div className="flex h-11">
                {STEPS.map((s, i) => {
                  const hex = res.palettes[p][s], ref = `${p}.${s}`, on = lit.has(ref), seed = res.seeds[p] === s && p !== 'neutral';
                  return (
                    <span key={s} title={`${p} ${s} · ${hex}`}
                      className={`relative flex-1 transition-[background-color,transform,box-shadow,border-radius] duration-500 ${i === 0 ? 'rounded-l-[10px]' : ''} ${i === STEPS.length - 1 ? 'rounded-r-[10px]' : ''} ${on ? 'z-10 scale-y-[1.2] rounded-[6px] shadow-[0_0_0_2px_#fff,0_0_0_3.5px_#17191e]' : ''}`} style={{ background: hex }}>
                      {seed && <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full" style={{ background: inkOn(hex) }} />}
                      {deltas[`color/${p}/${s}`] && <span className="tk-ping absolute inset-0 rounded-[inherit]" />}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
            <span />
            <div className="flex">{STEPS.map(s => <span key={s} className="flex-1 text-center font-mono text-[10.5px] text-ink/40">{s}</span>)}</div>
          </div>
        </div>
      </Stage>
      <Caption>Your colours sit on the dotted steps; every other step is made from them in OKLCH, so the jumps look even. Hover a role below to see the step it uses.</Caption>
      <div className={`grid gap-4 ${modes.length > 1 ? 'xl:grid-cols-2' : ''}`}>
        {modes.map(m => {
          const sem = res.semantic[m];
          return (
            <div key={m} className="rounded-[24px] p-5 transition-colors duration-500" style={{ background: sem['bg/canvas'].hex, boxShadow: '0 0 0 1px rgba(23,25,30,.08)' }}>
              <p className="mb-3 px-1.5 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: sem['fg/muted'].hex }}>{m === 'light' ? 'Light' : 'Dark'} roles</p>
              <div className={`grid gap-x-6 gap-y-0.5 ${modes.length > 1 ? '' : 'md:grid-cols-2'}`}>
                {SEMANTIC.map(s => {
                  const v = sem[s.id], d = deltas[`${m}:color/${s.id}`];
                  return (
                    <div key={s.id} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
                      className={`flex items-center gap-2.5 rounded-[9px] px-1.5 py-1 transition-colors ${hover === s.id ? 'bg-[rgba(127,127,127,.14)]' : ''}`}>
                      <span className="h-5 w-5 shrink-0 rounded-[6px] transition-colors duration-500" style={{ background: s.group === 'border' ? 'transparent' : v.hex, border: s.group === 'border' ? `2px solid ${v.hex}` : '1px solid rgba(127,127,127,.25)' }} />
                      <span className="min-w-0 flex-1 truncate font-mono text-[12px]" style={{ color: sem['fg/default'].hex }}>{s.id}</span>
                      {d && <Delta from={d.from.replace('.', ' ')} to={d.to.replace('.', ' ')} />}
                      <span className="shrink-0 font-mono text-[11px]" style={{ color: sem['fg/muted'].hex }}>{v.ref.replace('.', ' ')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- type: one big specimen with its metrics, then the ladder ---------- */

function metrics(family: string, weight: number, px: number) {
  const c = document.createElement('canvas').getContext('2d');
  if (!c) return null;
  c.font = `${weight} ${px}px ${familyCss(family)}`;
  const all = c.measureText('Hxgjp');
  return {
    asc: all.fontBoundingBoxAscent || px * 0.8, desc: all.fontBoundingBoxDescent || px * 0.2,
    cap: c.measureText('H').actualBoundingBoxAscent, x: c.measureText('x').actualBoundingBoxAscent,
    under: c.measureText('gjp').actualBoundingBoxDescent,
  };
}

function TypeView({ res, st, deltas }: Props) {
  const [bp, setBp] = useState<'desktop' | 'mobile'>('desktop');
  const [, ready] = useState(0);
  const display = res.type.styles[0];
  const S = 150, lh = display.desktop.lh / display.desktop.size;
  useEffect(() => {
    let live = true;
    document.fonts.load(`${display.weight} 40px "${display.family}"`).catch(() => []).then(() => { if (live) ready(x => x + 1); });
    return () => { live = false; };
  }, [display.family, display.weight]);
  const m = metrics(display.family, display.weight, S);
  const box = S * lh;
  const base = m ? (box - (m.asc + m.desc)) / 2 + m.asc : box * 0.8;
  const lines = m ? [
    { y: base - m.cap, label: 'Cap height' }, { y: base - m.x, label: 'x-height' }, { y: base, label: 'Baseline', strong: true }, { y: base + m.under, label: 'Descender' },
  ] : [];
  return (
    <div className="flex flex-col gap-4">
      <Stage>
        <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative overflow-hidden" style={{ height: box + 24 }}>
            <div className="absolute inset-x-0 top-[12px] border-y border-dashed border-ink/20" style={{ height: box }} />
            {lines.map(l => (
              <div key={l.label} className="absolute inset-x-0 transition-[top] duration-500" style={{ top: 12 + l.y }}>
                <span className={`absolute inset-x-0 ${l.strong ? 'border-t-[1.5px]' : 'border-t'}`} style={{ borderColor: l.strong ? PINK : 'rgba(47,107,237,.45)' }} />
                <span className="absolute right-0 -translate-y-1/2 bg-white pl-2 text-[11px] font-medium" style={{ color: l.strong ? PINK : BLUE }}>{l.label}</span>
              </div>
            ))}
            <span className="absolute left-0 top-[12px] whitespace-nowrap text-ink transition-[letter-spacing] duration-500" style={{ fontFamily: familyCss(display.family), fontWeight: display.weight, fontSize: S, lineHeight: `${box}px`, letterSpacing: `${display.tracking}em` }}>Ag</span>
            <span className="absolute bottom-0 left-0"><Pill>line height {lh.toFixed(2)}</Pill></span>
          </div>
          <div className="flex flex-col justify-center gap-4">
            {([['Headings', res.type.families.heading, res.type.weights.heading], ['Body', res.type.families.body, res.type.weights.body], ['Code', res.type.families.mono, 400]] as const).map(([k, f, wt]) => (
              <div key={k} className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">{k}</span>
                <span key={f} className="tk-fade text-[19px] text-ink" style={{ fontFamily: familyCss(f), fontWeight: wt }}>{f}</span>
                <span className="font-mono text-[11px] text-ink/45">weight {wt}</span>
              </div>
            ))}
            <span className="font-mono text-[11.5px] text-ink/55">base {bp === 'desktop' ? st.type.base : st.type.mBase}px × {bp === 'desktop' ? st.type.ratio : st.type.mRatio} a step</span>
          </div>
        </div>
      </Stage>
      <Stage>
        <div className="flex items-center justify-between gap-3 border-b border-ink/[0.06] px-6 py-3">
          <span className="text-[13px] font-medium text-ink/70">Every style</span>
          <div className="flex rounded-full bg-ink/[0.06] p-[3px]">
            {(['desktop', 'mobile'] as const).map(v => <button key={v} type="button" aria-pressed={bp === v} onClick={() => setBp(v)} className={`rounded-full px-3 py-1 text-[12.5px] font-medium ${bp === v ? 'bg-white text-ink shadow-sm' : 'text-ink/55'}`}>{v === 'desktop' ? 'Desktop' : 'Mobile'}</button>)}
          </div>
        </div>
        <div className="divide-y divide-ink/[0.06]">
          {res.type.styles.map(s => {
            const mt = s[bp], d = deltas[`text/${s.id}/${bp === 'desktop' ? 'size' : 'm-size'}`];
            const sample = s.role === 'heading' ? 'Know where your week is going' : s.id === 'code' ? 'npm i @tokens/core' : s.id === 'overline' ? 'This week' : s.id === 'label' ? 'Save changes' : 'Your team’s tools in one calm place.';
            return (
              <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-3">
                <p className="min-w-0 truncate text-ink transition-[font-size,line-height,letter-spacing] duration-500"
                  style={{ fontFamily: familyCss(s.family), fontWeight: s.weight, fontSize: mt.size, lineHeight: `${mt.lh}px`, letterSpacing: `${s.tracking}em`, textTransform: s.upper ? 'uppercase' : undefined }}>{sample}</p>
                <span className="flex flex-col items-end gap-0.5 text-right">
                  <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">{d && <Delta from={d.from} to={d.to} />}{s.label}</span>
                  <span className="font-mono text-[11px] text-ink/50">{mt.size}/{mt.lh} · {s.weight}{s.tracking ? ` · ${(s.tracking * 100).toFixed(1)}%` : ''}</span>
                </span>
              </div>
            );
          })}
        </div>
      </Stage>
    </div>
  );
}

/* ---------- spacing: a real component, close up, with its spaces showing ---------- */

function SpaceView({ res, deltas }: Props) {
  const sem = res.space.sem;
  const L = res.semantic.light;
  const tag = (id: keyof typeof sem, side: 'right' | 'below' | 'above') => (
    <span className={`pointer-events-none absolute z-10 flex items-center ${side === 'right' ? 'left-[calc(100%+var(--reach))] top-1/2 -translate-y-1/2' : side === 'below' ? 'left-1/2 top-[calc(100%+6px)] -translate-x-1/2' : 'bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2'}`}>
      {side === 'right' && <span className="h-px w-4" style={{ background: PINK }} />}<Pill tone="pink">{id} · {sem[id].px}</Pill>
    </span>
  );
  const band = (id: keyof typeof sem, dir: 'v' | 'h', side: 'below' | 'above' = 'below') => (
    <div className="relative shrink-0 self-stretch transition-[height,width] duration-500" style={dir === 'v' ? { height: sem[id].px } : { width: sem[id].px }}>{tag(id, dir === 'v' ? 'right' : side)}</div>
  );
  const prims = res.space.prims.slice(1);
  const max = Math.max(...prims.map(p => p.px));
  return (
    <div className="flex flex-col gap-4">
      <Stage className="flex justify-center overflow-x-auto px-6 py-14">
        <div className="flex items-start" style={{ zoom: 1.3 } as CSSProperties}>
          <div className="relative w-[330px] transition-[padding] duration-500"
            style={{ padding: sem['inset/lg'].px, background: `${HATCH}, ${L['bg/surface'].hex}`, borderRadius: Math.min(res.radius.sem.card.px, 24), boxShadow: `0 0 0 1px ${L['border/default'].hex}`, '--reach': `${sem['inset/lg'].px + 6}px` } as CSSProperties}>
            <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2"><Pill tone="pink">inset/lg · {sem['inset/lg'].px}</Pill></span>
            <div className="flex items-center">
              <span className="h-9 w-9 shrink-0 rounded-[9px]" style={{ background: L['bg/brand-subtle'].hex }} />
              {band('inline/sm', 'h', 'above')}
              <span className="flex-1 bg-white text-[15px] font-semibold leading-9 text-ink">Weekly digest</span>
            </div>
            {band('stack/sm', 'v')}
            <p className="bg-white text-[13px] leading-[19px] text-ink/65">A summary of what shipped and what’s stuck, every Monday.</p>
            {band('stack/md', 'v')}
            <div className="flex justify-end">
              <span className="rounded-[8px] bg-white text-[13px] font-medium text-ink transition-[padding] duration-500" style={{ padding: `${sem['inset/sm'].px}px ${sem['inset/md'].px}px`, boxShadow: `inset 0 0 0 1px ${L['border/default'].hex}` }}>Later</span>
              {band('inline/md', 'h')}
              <span className="rounded-[8px] text-[13px] font-medium transition-[padding] duration-500" style={{ padding: `${sem['inset/sm'].px}px ${sem['inset/md'].px}px`, background: L['bg/brand'].hex, color: L['fg/on-brand'].hex }}>Turn on</span>
            </div>
          </div>
          <span className="w-[130px] shrink-0" aria-hidden />
        </div>
      </Stage>
      <Caption>The pink is space. Each padding and gap is a semantic token pointing at a step of the scale, so density or the base unit moves them all at once.</Caption>
      <Stage>
        <div className="flex items-end gap-3 overflow-x-auto px-6 pb-4 pt-6">
          {prims.map(p => {
            const s = Math.max(4, (p.px / max) * 96);
            return (
              <div key={p.name} className="flex shrink-0 flex-col items-center gap-1.5">
                <span className="rounded-[3px] transition-[width,height] duration-500" style={{ width: s, height: s, background: PINK, opacity: 0.2 + 0.6 * (p.px / max) }} />
                <span className="font-mono text-[11px] text-ink">{p.px}</span>
              </div>
            );
          })}
        </div>
        <Values>
          {(['inset', 'stack', 'inline', 'section'] as const).map(g => (
            <div key={g} className="flex min-w-[140px] flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">{g}</span>
              {SPACE_SEM.filter(s => s.id.startsWith(g)).map(s => (
                <span key={s.id} className="flex items-center gap-2 font-mono text-[12px]">
                  <span className="w-[22px] text-ink/50">{s.id.split('/')[1]}</span>
                  <span className="text-ink">{sem[s.id].px}</span>
                  {deltas[`space/${s.id}`] && <Delta from={deltas[`space/${s.id}`].from} to={deltas[`space/${s.id}`].to} />}
                </span>
              ))}
            </div>
          ))}
        </Values>
      </Stage>
    </div>
  );
}

/* ---------- depth ---------- */

function DepthView({ res, mode }: Props) {
  const modes: Mode[] = mode === 'both' ? MODES : [mode];
  return (
    <div className="flex flex-col gap-4">
      {modes.map(m => {
        const sem = res.semantic[m];
        return (
          <div key={m} className="rounded-[24px] px-6 pb-8 pt-16 transition-colors duration-500" style={{ background: sem['bg/canvas'].hex, boxShadow: '0 0 0 1px rgba(23,25,30,.07)' }}>
            <div className="grid grid-cols-5 items-end gap-4 md:gap-6">
              {LEVELS.map((l, i) => (
                <div key={l} className="flex flex-col items-center gap-4">
                  <span className="grid aspect-[4/5] w-full place-items-center rounded-[16px] transition-[box-shadow,transform,background-color] duration-500"
                    style={{ background: sem[i > 2 ? 'bg/raised' : 'bg/surface'].hex, boxShadow: shadowCss(res.shadow[m][l]), transform: `translateY(${-i * 8}px)` }}>
                    <span className="font-mono text-[13px] font-semibold" style={{ color: sem['fg/default'].hex }}>{l}</span>
                  </span>
                  <span className="text-center text-[11.5px]" style={{ color: sem['fg/muted'].hex }}>{LEVEL_USE[l]}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <Caption>Higher things cast longer, softer shadows. Each level is several shadows that grow and fade the way light does; dark mode uses deeper, black ones and lifts the top surfaces a step lighter.</Caption>
    </div>
  );
}

/* ---------- grid ---------- */

function GridView({ res, deltas }: Props) {
  const [ref, w] = useWidth();
  const g = res.grid;
  const total = BPS.reduce((a, b) => a + FRAME_W[b], 0);
  const z = Math.min(0.6, (w - 48 - 32) / total);
  const H = 460;
  return (
    <div className="flex flex-col gap-4">
      <Stage>
        <div ref={ref} className="flex items-end justify-center gap-4 px-6 pb-5 pt-6">
          {BPS.map(bp => {
            const F = FRAME_W[bp], c = g[bp];
            const inner = Math.min(g.max, F - 2 * c.margin);
            const d = ['columns', 'gutter', 'margin'].map(k => deltas[`grid/${bp}/${k}`]).find(Boolean);
            return (
              <div key={bp} className="flex shrink-0 flex-col gap-2.5" style={{ width: F * z }}>
                <div className="overflow-hidden rounded-[10px] shadow-[0_0_0_1px_rgba(23,25,30,.1)]" style={{ height: H * z, background: 'rgba(255,45,111,.07)' }}>
                  <div style={{ width: F, height: H, zoom: z } as CSSProperties} className="flex justify-center">
                    <div className="flex h-full bg-white transition-[width,gap] duration-500" style={{ width: inner, gap: c.gutter }}>
                      {Array.from({ length: c.columns }, (_, i) => <span key={i} className="flex-1" style={{ background: 'rgba(47,107,237,.12)', animation: `tk-col .45s ${EASE} both` }} />)}
                    </div>
                  </div>
                </div>
                <span className="flex flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-semibold text-ink">{{ mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' }[bp]}{d && <Delta from={d.from} to={d.to} />}</span>
                  <span className="font-mono text-[11px] leading-snug text-ink/50">{c.columns} col · {c.gutter} gutter · {c.margin} margin</span>
                </span>
              </div>
            );
          })}
        </div>
        <Values>
          <Value k="breakpoint/tablet" v={`${g.tabletAt}px`} />
          <Value k="breakpoint/desktop" v={`${g.desktopAt}px`} />
          <Value k="container/max" v={`${g.max}px`} />
        </Values>
      </Stage>
      <Caption>Blue columns, white gutters, pink margins. The preview lays itself out on these columns: turn on Grid there to see them line up.</Caption>
    </div>
  );
}
