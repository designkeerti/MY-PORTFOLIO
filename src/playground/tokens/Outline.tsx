import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { contrastRatio } from '../color';
import {
  BPS, LEVELS, LEVEL_USE, MODES, PAIRS, PALETTES, RADII, RADIUS_SEM, SEMANTIC, SPACE_SEM, STEPS,
  familyCss, shadowCss, weightsOf, type Level, type Mode, type Resolved, type State,
} from './model';
import { Delta } from './controls';
import type { Tab } from './Editor';
import { FRAME_W } from './Canvas';

/**
 * View two: the system as a spec. Each group of tokens gets its own view, and every value
 * animates to its new place as it changes, with a note of what it was.
 */

type Deltas = Record<string, { from: string; to: string }>;
type Props = { res: Resolved; st: State; tab: Tab; deltas: Deltas; mode: Mode | 'both' };

export function Outline(p: Props) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.scrollTo(0, 0); }, [p.tab]);
  return (
    <div ref={box} className="h-full overflow-y-auto overscroll-contain bg-[#fbfaf8]">
      <div key={p.tab} className="tk-fade mx-auto flex max-w-[1180px] flex-col gap-10 px-5 py-6 md:px-8 md:py-8">
        {p.tab === 'color' && <ColourView {...p} />}
        {p.tab === 'type' && <TypeView {...p} />}
        {p.tab === 'space' && <SpaceView {...p} />}
        {p.tab === 'radius' && <RadiusView {...p} />}
        {p.tab === 'depth' && <DepthView {...p} />}
        {p.tab === 'grid' && <GridView {...p} />}
      </div>
    </div>
  );
}

function Head({ title, children, aside }: { title: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-[62ch]">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink md:text-[26px]">{title}</h2>
        {children && <p className="mt-1.5 text-[14px] leading-relaxed text-ink/60">{children}</p>}
      </div>
      {aside}
    </header>
  );
}
const Sub = ({ children }: { children: ReactNode }) => <h3 className="pg-label mb-3">{children}</h3>;
const Card = ({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) =>
  <div className={`rounded-[18px] border border-ink/[0.07] bg-white ${className}`} style={style}>{children}</div>;

/* ---------- colour: palettes, and the wires from each semantic colour to its step ---------- */

function ColourView({ res, deltas }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);   // `${mode}:${id}`
  const [wires, setWires] = useState<{ d: string; color: string; key: string; to: string }[]>([]);
  // tokens re-pointed in the last moment get their wire drawn on their own
  const moved = Object.keys(deltas).filter(k => /^(light|dark):color\//.test(k)).map(k => k.replace(':color/', ':'));
  const show = hover ? [hover] : moved.slice(0, 6);
  const showKey = show.join('|');

  const draw = useCallback(() => {
    const r = root.current; if (!r) return;
    const box = r.getBoundingClientRect();
    const out: typeof wires = [];
    for (const key of showKey ? showKey.split('|') : []) {
      const [mode, id] = key.split(':') as [Mode, string];
      const ref = res.semantic[mode][id]?.ref; if (!ref) continue;
      const from = r.querySelector<HTMLElement>(`[data-sem="${key}"]`);
      const to = r.querySelector<HTMLElement>(`[data-prim="${ref}"]`);
      if (!from || !to) continue;
      const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      const x1 = a.left - box.left + 14, y1 = a.top - box.top + a.height / 2;
      const x2 = b.left - box.left + b.width / 2, y2 = b.bottom - box.top;
      const my = (y1 + y2) / 2;
      out.push({ d: `M${x1},${y1} C${x1 - 60},${y1} ${x2},${my + 40} ${x2},${y2 + 4}`, color: mode === 'light' ? '#2f6bed' : '#ff2d6f', key: key + ref, to: ref });
    }
    setWires(out);
  }, [showKey, res]);
  useLayoutEffect(() => { draw(); }, [draw]);
  useEffect(() => { window.addEventListener('resize', draw); return () => window.removeEventListener('resize', draw); }, [draw]);
  const lit = new Set(wires.map(w => w.to));

  return (
    <div ref={root} className="relative flex flex-col gap-10">
      <Head title="Colour">Primitives are the raw palettes. Semantic colours are what the interface asks for, and each one points at a primitive, once for light and once for dark. Hover a semantic colour to see where it points.</Head>
      <section>
        <Sub>Primitives</Sub>
        <Card className="overflow-x-auto p-4">
          <div className="grid min-w-[620px] grid-cols-[64px_repeat(11,minmax(0,1fr))] gap-x-1.5 gap-y-2">
            <span />
            {STEPS.map(s => <span key={s} className="text-center font-mono text-[10.5px] text-ink/45">{s}</span>)}
            {PALETTES.map(p => (
              <Row key={p} label={p}>
                {STEPS.map(s => {
                  const hex = res.palettes[p][s], ref = `${p}.${s}`, seed = res.seeds[p] === s && p !== 'neutral';
                  const d = deltas[`color/${p}/${s}`];
                  return (
                    <span key={s} data-prim={ref} title={`${p} ${s} · ${hex}`}
                      className={`relative h-11 rounded-[8px] transition-[background-color,box-shadow,transform] duration-700 ${lit.has(ref) ? 'z-10 scale-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_#17191e]' : ''}`}
                      style={{ background: hex, boxShadow: lit.has(ref) ? undefined : 'inset 0 0 0 1px rgba(0,0,0,.06)' }}>
                      {seed && <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: contrastRatio(hex, '#fff') > 3 ? '#fff' : '#17191e' }} title="Your colour" />}
                      {d && <span className="tk-ping absolute inset-0 rounded-[8px]" />}
                    </span>
                  );
                })}
              </Row>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-ink/45">The dot marks your own colour. Every other step is made from it.</p>
        </Card>
      </section>

      <section>
        <Sub>Semantic, light and dark</Sub>
        <div className="grid gap-4 lg:grid-cols-2">
          {MODES.map(m => {
            const bg = res.semantic[m]['bg/canvas'].hex, fg = res.semantic[m]['fg/default'].hex, muted = res.semantic[m]['fg/muted'].hex;
            return (
              <div key={m} className="rounded-[18px] p-4 transition-colors duration-700" style={{ background: bg, color: fg, boxShadow: '0 0 0 1px rgba(23,25,30,.08)' }}>
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: muted }}>{m === 'light' ? 'Light' : 'Dark'}</p>
                {(['bg', 'fg', 'border'] as const).map(g => (
                  <div key={g} className="mb-3 last:mb-0">
                    <p className="mb-1 text-[11.5px] font-semibold" style={{ color: muted }}>{{ bg: 'Backgrounds', fg: 'Text and icons', border: 'Borders' }[g]}</p>
                    {SEMANTIC.filter(s => s.group === g).map(s => {
                      const v = res.semantic[m][s.id], key = `${m}:${s.id}`, d = deltas[`${m}:color/${s.id}`];
                      const surface = res.semantic[m]['bg/surface'].hex;
                      const pair = res.semantic[m][PAIRS.find(x => x.fg === s.id)?.bg ?? 'bg/canvas'].hex;
                      return (
                        <div key={s.id} data-sem={key} onMouseEnter={() => setHover(key)} onMouseLeave={() => setHover(null)}
                          className={`flex items-center gap-2.5 rounded-[10px] px-1.5 py-1 transition-colors ${hover === key ? 'bg-[rgba(127,127,127,.14)]' : ''}`}>
                          <Swatch group={g} hex={v.hex} surface={g === 'fg' ? pair : surface} />
                          <span className="min-w-0 flex-1 truncate font-mono text-[12px]">{s.id}</span>
                          {d && <Delta from={d.from.replace('.', ' ')} to={d.to.replace('.', ' ')} />}
                          <span className="shrink-0 font-mono text-[11px]" style={{ color: muted }}>{v.ref.replace('.', ' ')}</span>
                          {g === 'fg' && <Ratio fg={v.hex} bg={pair} />}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <Sub>Pairs</Sub>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {res.checks.filter(c => c.mode === 'light').map(c => {
            const dark = res.checks.find(x => x.mode === 'dark' && x.fg === c.fg && x.bg === c.bg)!;
            return (
              <Card key={c.fg + c.bg} className="flex overflow-hidden">
                {[c, dark].map(x => (
                  <div key={x.mode} className="flex flex-1 flex-col gap-1 p-3 transition-colors duration-700" style={{ background: res.semantic[x.mode][x.bg].hex, color: res.semantic[x.mode][x.fg].hex }}>
                    <span className="text-[18px] font-semibold leading-none">{x.fg.startsWith('border') ? <span className="inline-block h-4 w-8 rounded-[5px] border-2" style={{ borderColor: res.semantic[x.mode][x.fg].hex }} /> : 'Aa'}</span>
                    <span className="text-[11px] font-medium" style={{ color: res.semantic[x.mode][x.bg === 'bg/canvas' || x.bg === 'bg/surface' ? 'fg/muted' : x.fg].hex }}>{x.ratio.toFixed(2)}:1 {x.pass ? '✓' : '✕'}</span>
                  </div>
                ))}
                <span className="sr-only">{c.label}</span>
              </Card>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] text-ink/45">Each card is one pair, light on the left and dark on the right. The pairs are listed by name in the editor’s Contrast section.</p>
      </section>

      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {wires.map(w => (
          <g key={w.key}>
            <path d={w.d} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" className="tk-wire" />
            <path d={w.d} fill="none" stroke={w.color} strokeWidth={2} strokeLinecap="round" className="tk-wire" />
          </g>
        ))}
      </svg>
    </div>
  );
}
const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <><span className="self-center text-[12px] font-medium text-ink/60">{label}</span>{children}</>
);
function Swatch({ group, hex, surface }: { group: 'bg' | 'fg' | 'border'; hex: string; surface: string }) {
  if (group === 'fg') return <span className="grid h-7 w-9 shrink-0 place-items-center rounded-[7px] text-[13px] font-bold transition-colors duration-700" style={{ background: surface, color: hex, boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.25)' }}>Aa</span>;
  if (group === 'border') return <span className="h-7 w-9 shrink-0 rounded-[7px] border-2 transition-colors duration-700" style={{ borderColor: hex, background: surface }} />;
  return <span className="h-7 w-9 shrink-0 rounded-[7px] transition-colors duration-700" style={{ background: hex, boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.25)' }} />;
}
function Ratio({ fg, bg }: { fg: string; bg: string }) {
  const r = contrastRatio(fg, bg);
  return <span className={`w-[42px] shrink-0 rounded-full px-1 text-center font-mono text-[10.5px] font-semibold ${r >= 4.5 ? 'bg-[#dcf5e4] text-[#11652f]' : r >= 3 ? 'bg-[#fff1c2] text-[#7a5600]' : 'bg-[#ffe1dc] text-[#9a2a14]'}`}>{r.toFixed(1)}</span>;
}

/* ---------- type: the ladder, the scale's geometry, the families ---------- */

function TypeView({ res, st, deltas }: Props) {
  const [bp, setBp] = useState<'desktop' | 'mobile'>('desktop');
  const [lines, setLines] = useState(true);
  const styles = res.type.styles;
  const biggest = Math.max(...styles.map(s => s[bp].size));
  const fam = res.type.families;
  return (
    <>
      <Head title="Type" aside={
        <div className="flex gap-2">
          <Toggle2 value={bp} onChange={setBp} options={[['desktop', 'Desktop'], ['mobile', 'Mobile']]} />
          <button type="button" onClick={() => setLines(l => !l)} aria-pressed={lines} className={`rounded-full border px-3 py-1.5 text-[12.5px] font-medium ${lines ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink/70'}`}>Line boxes</button>
        </div>}>
        Base {bp === 'desktop' ? st.type.base : st.type.mBase}px × {bp === 'desktop' ? st.type.ratio : st.type.mRatio} per step. Line boxes show each style’s line height; with snapping on, they all land on the 4px grid.
      </Head>

      <section className="grid gap-3 md:grid-cols-3">
        {([['Headings', fam.heading], ['Body', fam.body], ['Code', fam.mono]] as const).map(([k, f]) => (
          <Card key={k} className="flex flex-col gap-3 p-4">
            <span className="pg-label">{k}</span>
            <span key={f} className="tk-fade text-[64px] leading-none text-ink" style={{ fontFamily: familyCss(f), fontWeight: k === 'Headings' ? res.type.weights.heading : 400 }}>Aa</span>
            <span className="text-[14px] font-medium text-ink">{f}</span>
            <span className="flex flex-wrap gap-x-3 gap-y-1">{weightsOf(f).map(w => <span key={w} className="text-[15px] text-ink/70" style={{ fontFamily: familyCss(f), fontWeight: w }}>{w}</span>)}</span>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <Card className="divide-y divide-ink/[0.06]">
          {styles.map(s => {
            const m = s[bp], d = deltas[`text/${s.id}/${bp === 'desktop' ? 'size' : 'm-size'}`];
            const sample = s.role === 'heading' ? 'Know where your week is going' : s.id === 'code' ? 'npm i @tokens/core' : s.id === 'overline' ? 'This week' : s.id === 'label' ? 'Save changes' : 'Your team’s tools in one calm place. See what shipped, what’s stuck and what’s next.';
            return (
              <div key={s.id} className="grid grid-cols-[150px_minmax(0,1fr)] items-start gap-4 p-4">
                <div className="flex flex-col gap-1 pt-1">
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">{s.label}{d && <Delta from={d.from} to={d.to} />}</span>
                  <span className="font-mono text-[11.5px] text-ink/50">text/{s.id}</span>
                  <span className="font-mono text-[11.5px] tabular-nums text-ink/70">{m.size}/{m.lh} · {s.weight}{s.tracking ? ` · ${(s.tracking * 100).toFixed(1)}%` : ''}</span>
                  <span className="mt-1 h-1.5 rounded-full bg-[#2f6bed]/75 transition-[width] duration-500" style={{ width: `${(m.size / biggest) * 100}%` }} />
                </div>
                <p className="min-w-0 text-ink transition-[font-size,line-height,letter-spacing] duration-500 [overflow-wrap:anywhere]"
                  style={{
                    fontFamily: familyCss(s.family), fontWeight: s.weight, fontSize: m.size, lineHeight: `${m.lh}px`, letterSpacing: `${s.tracking}em`,
                    textTransform: s.upper ? 'uppercase' : undefined, maxWidth: s.role === 'body' ? '46ch' : undefined,
                    backgroundImage: lines ? `repeating-linear-gradient(to bottom, rgba(47,107,237,.07) 0 ${m.lh - 1}px, rgba(47,107,237,.35) ${m.lh - 1}px ${m.lh}px)` : undefined,
                  }}>{sample}</p>
              </div>
            );
          })}
        </Card>
        <div className="flex flex-col gap-3 lg:sticky lg:top-0 lg:self-start">
          <Card className="p-4">
            <Sub>The scale</Sub>
            <div className="relative aspect-square w-full">
              {[...styles].filter((s, i, a) => a.findIndex(x => x[bp].size === s[bp].size) === i).sort((a, b) => b[bp].size - a[bp].size).map(s => {
                const k = (s[bp].size / biggest) * 100;
                return <span key={s.id} title={`${s.label} · ${s[bp].size}px`} className="absolute bottom-0 left-0 rounded-tr-[6px] border border-[#2f6bed]/50 bg-[#2f6bed]/[0.07] transition-[width,height] duration-500" style={{ width: `${k}%`, height: `${k}%` }} />;
              })}
            </div>
            <p className="mt-3 text-[12px] leading-snug text-ink/50">Every square is a style’s size. A steady ratio makes them grow by the same proportion each step.</p>
          </Card>
          <Card className="p-4">
            <Sub>Desktop and mobile</Sub>
            <ul className="flex flex-col gap-1">
              {styles.map(s => (
                <li key={s.id} className="flex items-center gap-2 text-[12px]">
                  <span className="w-[70px] shrink-0 truncate text-ink/60">{s.label}</span>
                  <span className="relative h-2 flex-1 rounded-full bg-ink/[0.06]">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-[#ff2d6f]/60 transition-[width] duration-500" style={{ width: `${(s.mobile.size / Math.max(...styles.map(x => x.desktop.size))) * 100}%` }} />
                    <span className="absolute inset-y-0 left-0 rounded-full border-2 border-[#2f6bed] transition-[width] duration-500" style={{ width: `${(s.desktop.size / Math.max(...styles.map(x => x.desktop.size))) * 100}%` }} />
                  </span>
                  <span className="w-[52px] shrink-0 text-right font-mono tabular-nums text-ink/60">{s.mobile.size}·{s.desktop.size}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11.5px] text-ink/50"><span className="text-[#ff2d6f]">■</span> mobile <span className="ml-2 text-[#2f6bed]">□</span> desktop</p>
          </Card>
        </div>
      </section>
    </>
  );
}

function Toggle2<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="flex rounded-full bg-ink/[0.06] p-[3px]">
      {options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)} className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition-all ${value === v ? 'bg-white text-ink shadow-sm' : 'text-ink/60'}`}>{l}</button>)}
    </div>
  );
}

/* ---------- spacing: the staircase, the semantic map, and a card with its spaces shown ---------- */

const HATCH = 'repeating-linear-gradient(-45deg, rgba(255,45,111,.22) 0 1.5px, rgba(255,45,111,.06) 1.5px 6px)';

function SpaceView({ res, deltas }: Props) {
  const prims = res.space.prims.slice(1);
  const max = Math.max(...prims.map(p => p.px));
  const sem = res.space.sem;
  return (
    <>
      <Head title="Spacing">A base unit of {res.space.base}px and the steps made from it. Semantic spaces point at a step, so a change of density or base moves the whole interface together.</Head>
      <section>
        <Sub>Primitives</Sub>
        <Card className="overflow-x-auto p-5">
          <div className="flex min-w-max items-end gap-2.5">
            {prims.map(p => {
              const s = Math.max(4, (p.px / max) * 112), d = deltas[`space/${p.name}`];
              return (
                <div key={p.name} className="flex flex-col items-center gap-1.5">
                  {d && <Delta from={d.from} to={d.to} />}
                  <span className="rounded-[4px] bg-[#2f6bed] transition-[width,height] duration-500" style={{ width: s, height: s, opacity: 0.25 + 0.75 * (p.px / max) }} />
                  <span className="font-mono text-[11px] text-ink">{p.name}</span>
                  <span className="font-mono text-[10.5px] text-ink/45">{p.px}px</span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <Sub>In use</Sub>
          <Card className="p-6">
            <div className="mx-auto flex max-w-[460px] items-stretch gap-3">
              <div className="relative min-w-0 flex-1 transition-[padding,border-radius] duration-500" style={{ padding: sem['inset/lg'].px, background: HATCH, borderRadius: Math.min(res.radius.sem.card.px, 28), boxShadow: '0 0 0 1px rgba(23,25,30,.12)' }}>
                <div className="flex items-center bg-white transition-[gap] duration-500" style={{ gap: sem['inline/sm'].px }}>
                  <span className="h-10 w-10 shrink-0 rounded-[10px] bg-[#e8efff]" />
                  <span className="text-[17px] font-semibold text-ink">Weekly digest</span>
                </div>
                <Gap px={sem['stack/sm'].px} label={`stack/sm · ${sem['stack/sm'].px}`} reach={sem['inset/lg'].px} />
                <p className="bg-white text-[14px] leading-[20px] text-ink/65">A summary of what shipped and what’s stuck, every Monday.</p>
                <Gap px={sem['stack/md'].px} label={`stack/md · ${sem['stack/md'].px}`} reach={sem['inset/lg'].px} />
                <div className="flex justify-end">
                  <span className="rounded-[8px] bg-white text-[14px] font-medium text-ink transition-[padding] duration-500" style={{ padding: `${sem['inset/sm'].px}px ${sem['inset/md'].px}px`, boxShadow: 'inset 0 0 0 1px rgba(23,25,30,.15)' }}>Later</span>
                  <span className="relative shrink-0 transition-[width] duration-500" style={{ width: sem['inline/md'].px }}>
                    <span className="absolute left-1/2 top-[calc(100%+4px)] -translate-x-1/2"><Tag>{`inline/md · ${sem['inline/md'].px}`}</Tag></span>
                  </span>
                  <span className="rounded-[8px] bg-[#2f6bed] text-[14px] font-medium text-white transition-[padding] duration-500" style={{ padding: `${sem['inset/sm'].px}px ${sem['inset/md'].px}px` }}>Turn on</span>
                </div>
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"><Tag>{`inset/lg · ${sem['inset/lg'].px}`}</Tag></span>
              </div>
              <span className="w-[100px] shrink-0" aria-hidden />
            </div>
          </Card>
          <p className="mt-2 text-[12px] text-ink/45">Pink is space: padding around the card and gaps between its parts.</p>
        </div>
        <div>
          <Sub>Semantic</Sub>
          <Card className="divide-y divide-ink/[0.06]">
            {(['inset', 'stack', 'inline', 'section'] as const).map(g => (
              <div key={g} className="p-3">
                {SPACE_SEM.filter(s => s.id.startsWith(g)).map(s => {
                  const x = sem[s.id], d = deltas[`space/${s.id}`];
                  return (
                    <div key={s.id} className="flex items-center gap-2 py-1 text-[12px]">
                      <span className="w-[86px] shrink-0 font-mono text-ink">{s.id}</span>
                      <span className="w-[62px] shrink-0 font-mono text-ink/45">→ {x.ref}</span>
                      <span className="relative h-3 flex-1">
                        <span className="absolute inset-y-0 left-0 rounded-[3px] transition-[width] duration-500" style={{ width: `${Math.min(100, (x.px / 128) * 100)}%`, background: HATCH, boxShadow: 'inset 0 0 0 1px rgba(255,45,111,.35)' }} />
                      </span>
                      {d && <Delta from={d.from} to={d.to} />}
                      <span className="w-[38px] shrink-0 text-right font-mono tabular-nums text-ink/60">{x.px}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </Card>
        </div>
      </section>
    </>
  );
}

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="whitespace-nowrap rounded-full bg-[#ff2d6f] px-1.5 py-px font-mono text-[10.5px] font-medium text-white shadow-sm">{children}</span>
);
/** a gap between two parts of the card, labelled off to the right, past the card's padding */
function Gap({ px, label, reach }: { px: number; label: string; reach: number }) {
  return (
    <div className="relative transition-[height] duration-500" style={{ height: px }}>
      <span className="absolute top-1/2 flex -translate-y-1/2 items-center transition-[left] duration-500" style={{ left: `calc(100% + ${reach}px)` }}>
        <span className="h-px w-3 bg-[#ff2d6f]" /><Tag>{label}</Tag>
      </span>
    </div>
  );
}

/* ---------- radius ---------- */

function RadiusView({ res, deltas }: Props) {
  const r = res.radius;
  const px = (k: keyof typeof r.sem) => Math.min(r.sem[k].px, 999);
  const pad = res.space.sem['inset/sm'].px;
  const outer = Math.min(r.sem.dialog.px, 60);
  const inner = Math.max(0, outer - pad);
  return (
    <>
      <Head title="Radius">A base radius and a step between sizes. Components point at a size, so “make it rounder” is one slider.</Head>
      <section>
        <Sub>Primitives</Sub>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {RADII.map(k => {
            const v = r.prims[k], d = deltas[`radius/${k}`];
            return (
              <div key={k} className="flex flex-col items-center gap-2">
                <span className="relative aspect-square w-full border-2 border-[#2f6bed] bg-[#2f6bed]/[0.08] transition-[border-radius] duration-500" style={{ borderTopLeftRadius: k === 'full' ? '50%' : v * 1.6, borderTopRightRadius: k === 'full' ? '50%' : v * 1.6, borderBottomLeftRadius: k === 'full' ? '50%' : v * 1.6, borderBottomRightRadius: k === 'full' ? '50%' : v * 1.6 }} />
                <span className="font-mono text-[12px] text-ink">{k}</span>
                <span className="font-mono text-[11px] text-ink/45">{k === 'full' ? '9999' : v}px</span>
                {d && <Delta from={d.from} to={d.to} />}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] text-ink/45">Drawn at 1.6× so small corners are easy to see.</p>
      </section>
      <section>
        <Sub>Components</Sub>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RADIUS_SEM.map(s => {
            const d = deltas[`radius/${s.id}`];
            return (
              <Card key={s.id} className="flex min-h-[150px] flex-col gap-3 p-4">
                <span className="flex items-center gap-1.5 font-mono text-[12px] text-ink">radius/{s.id} <span className="text-ink/45">→ {r.sem[s.id].ref}</span>{d && <Delta from={d.from === '9999' ? '∞' : d.from} to={d.to === '9999' ? '∞' : d.to} />}</span>
                <div className="grid flex-1 place-items-center rounded-[12px] bg-[#f3f2ee] p-4">
                  {s.id === 'button' && <span className="bg-[#2f6bed] px-5 py-2.5 text-[14px] font-medium text-white transition-[border-radius] duration-500" style={{ borderRadius: px('button') }}>Save changes</span>}
                  {s.id === 'input' && <span className="w-full border border-ink/30 bg-white px-3 py-2.5 text-[14px] text-ink/45 transition-[border-radius] duration-500" style={{ borderRadius: px('input') }}>you@company.com</span>}
                  {s.id === 'card' && <span className="flex w-full flex-col gap-1.5 border border-ink/10 bg-white p-3 shadow-sm transition-[border-radius] duration-500" style={{ borderRadius: px('card') }}><span className="h-2 w-2/3 rounded-full bg-ink/70" /><span className="h-2 w-full rounded-full bg-ink/15" /><span className="h-2 w-4/5 rounded-full bg-ink/15" /></span>}
                  {s.id === 'dialog' && <span className="flex w-full flex-col gap-2 bg-white p-4 shadow-lg transition-[border-radius] duration-500" style={{ borderRadius: px('dialog') }}><span className="h-2.5 w-1/2 rounded-full bg-ink/70" /><span className="h-2 w-full rounded-full bg-ink/15" /><span className="mt-1 h-6 w-20 self-end bg-[#2f6bed] transition-[border-radius] duration-500" style={{ borderRadius: px('button') }} /></span>}
                  {s.id === 'badge' && <span className="flex gap-2">{['New', 'Beta', '3'].map(b => <span key={b} className="bg-[#e8efff] px-2.5 py-0.5 text-[12px] font-medium text-[#184ec7] transition-[border-radius] duration-500" style={{ borderRadius: px('badge') }}>{b}</span>)}</span>}
                  {s.id === 'avatar' && <span className="flex gap-2">{['AO', 'MK', 'JL'].map(a => <span key={a} className="grid h-11 w-11 place-items-center bg-[#ffe8dd] text-[13px] font-semibold text-[#a3401a] transition-[border-radius] duration-500" style={{ borderRadius: px('avatar') }}>{a}</span>)}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
      <section>
        <Sub>Nested corners</Sub>
        <div className="grid gap-3 md:grid-cols-2">
          {[['Same radius inside', outer, false], ['Inner = outer − padding', inner, true]].map(([label, ir, ok]) => (
            <Card key={label as string} className="flex flex-col gap-3 p-4">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">{label as string}<span className={`rounded-full px-2 py-px text-[11px] ${ok ? 'bg-[#dcf5e4] text-[#11652f]' : 'bg-[#ffe1dc] text-[#9a2a14]'}`}>{ok ? 'Even' : 'Bulges'}</span></span>
              <div className="self-center border-2 border-[#2f6bed] bg-[#2f6bed]/[0.06] transition-[border-radius,padding] duration-500" style={{ borderRadius: outer, padding: pad, width: 220 }}>
                <div className="h-24 bg-[#2f6bed]/30 transition-[border-radius] duration-500" style={{ borderRadius: ir as number }} />
              </div>
              <span className="text-center font-mono text-[11.5px] text-ink/55">outer {outer} · padding {pad} · inner {ir as number}</span>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-[12px] leading-snug text-ink/50">An inner corner looks right when it shares a centre with the outer one: subtract the padding from the outer radius. Here the outer corner is radius/dialog and the padding is inset/sm.</p>
      </section>
    </>
  );
}

/* ---------- depth ---------- */

function DepthView({ res, mode }: Props) {
  const [open, setOpen] = useState<Level>('lg');
  const modes: Mode[] = mode === 'both' ? ['light', 'dark'] : [mode];
  return (
    <>
      <Head title="Depth">Five levels of elevation, each a stack of soft shadows. Things that float higher cast longer, softer shadows.</Head>
      {modes.map(m => (
        <section key={m}>
          <Sub>{m === 'light' ? 'Light' : 'Dark'}</Sub>
          <div className="grid grid-cols-2 gap-6 rounded-[22px] p-8 transition-colors duration-700 sm:grid-cols-5" style={{ background: res.semantic[m]['bg/canvas'].hex }}>
            {LEVELS.map(l => (
              <button key={l} type="button" onClick={() => setOpen(l)} className="flex flex-col items-center gap-3 text-left">
                <span className="grid aspect-[4/3] w-full place-items-center rounded-[14px] transition-[box-shadow,background-color] duration-500"
                  style={{ background: res.semantic[m][l === 'xl' || l === 'lg' ? 'bg/raised' : 'bg/surface'].hex, boxShadow: shadowCss(res.shadow[m][l]) + (open === l ? `, 0 0 0 2px ${res.semantic[m]['border/focus'].hex}` : '') }}>
                  <span className="font-mono text-[13px] font-semibold" style={{ color: res.semantic[m]['fg/default'].hex }}>{l}</span>
                </span>
                <span className="text-center text-[11.5px]" style={{ color: res.semantic[m]['fg/muted'].hex }}>{LEVEL_USE[l]}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
      <section>
        <Sub>shadow/{open}, one layer at a time</Sub>
        <Card className="p-5">
          <div className="flex items-end gap-4 overflow-x-auto px-2 pb-4 pt-2">
            {res.shadow.light[open].map((l, i) => (
              <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                <span className="h-14 w-16 rounded-[10px] bg-white transition-shadow duration-500" style={{ boxShadow: shadowCss([{ ...l, a: Math.min(1, l.a * 3) }]) }} />
                <span className="font-mono text-[10.5px] text-ink/55">y {l.y} · blur {l.blur}</span>
                <span className="font-mono text-[10.5px] text-ink/40">{Math.round(l.a * 100)}%</span>
              </div>
            ))}
            <span className="shrink-0 pb-8 text-[20px] text-ink/30">=</span>
            <div className="flex shrink-0 flex-col items-center gap-2">
              <span className="h-14 w-16 rounded-[10px] bg-white transition-shadow duration-500" style={{ boxShadow: shadowCss(res.shadow.light[open]) }} />
              <span className="font-mono text-[10.5px] text-ink/55">together</span>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-ink/45">Each layer is shown three times darker so you can see it. Close layers keep the edge crisp; far ones carry the softness.</p>
        </Card>
      </section>
    </>
  );
}

/* ---------- grid ---------- */

function GridView({ res, deltas }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);
  useLayoutEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const g = res.grid;
  const total = BPS.reduce((a, b) => a + FRAME_W[b], 0);
  const z = Math.min(0.62, (w - 40) / total);
  const H = 420;
  return (
    <>
      <Head title="Grid">Columns, gutters and margins for each width. The sample site lays itself out on these columns, so turn on the grid in the canvas to see them line up.</Head>
      <section ref={wrap}>
        <div className="flex items-end gap-4 overflow-x-auto pb-2">
          {BPS.map(bp => {
            const F = FRAME_W[bp], c = g[bp];
            const inner = Math.min(g.max, F - 2 * c.margin);
            const d = ['columns', 'gutter', 'margin'].map(k => deltas[`grid/${bp}/${k}`]).find(Boolean);
            return (
              <div key={bp} className="flex shrink-0 flex-col gap-2" style={{ width: F * z }}>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] font-semibold text-ink">{{ mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' }[bp]} <span className="font-mono font-normal text-ink/45">{F}px</span>{d && <Delta from={d.from} to={d.to} />}</span>
                <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_0_0_1px_rgba(23,25,30,.1)]" style={{ width: F * z, height: H * z }}>
                  <div style={{ width: F, height: H, zoom: z } as CSSProperties} className="relative">
                    <div className="absolute inset-0" style={{ background: HATCH, opacity: 0.6 }} />
                    <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 bg-white transition-[width,gap] duration-500" style={{ width: inner, gap: c.gutter }}>
                      {Array.from({ length: c.columns }, (_, i) => (
                        <span key={i} className="flex-1 bg-[#2f6bed]/[0.13]" style={{ animation: 'tk-col .45s cubic-bezier(.2,.7,.2,1) both', boxShadow: 'inset 0 0 0 1px rgba(47,107,237,.25)' }} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[11px] leading-snug text-ink/55">{c.columns} col · gutter {c.gutter} · margin {c.margin}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] text-ink/45">Blue columns, white gutters, pink margins. Desktop content stops at {g.max}px and centres.</p>
      </section>
      <section>
        <Sub>Breakpoints</Sub>
        <Card className="p-5">
          <div className="relative h-16">
            <div className="absolute inset-x-0 top-7 h-[2px] rounded-full bg-ink/10" />
            {[['Mobile', 0], ['Tablet', g.tabletAt], ['Desktop', g.desktopAt]].map(([l, x], i, a) => {
              const end = i < a.length - 1 ? (a[i + 1][1] as number) : 1600;
              return (
                <div key={l as string}>
                  <div className="absolute top-[26px] h-[6px] rounded-full transition-[left,width] duration-500" style={{ left: `${((x as number) / 1600) * 100}%`, width: `${((end - (x as number)) / 1600) * 100}%`, background: ['#ff2d6f', '#f5a524', '#2f6bed'][i] }} />
                  <span className="absolute top-0 -translate-x-[2px] whitespace-nowrap text-[12px] font-medium text-ink transition-[left] duration-500" style={{ left: `${((x as number) / 1600) * 100}%` }}>{l as string}</span>
                  <span className="absolute top-10 whitespace-nowrap font-mono text-[11px] text-ink/50 transition-[left] duration-500" style={{ left: `${((x as number) / 1600) * 100}%` }}>{x as number}px</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] text-ink/45">Mobile type sizes apply below {g.tabletAt}px; tablets and up use the desktop sizes.</p>
        </Card>
      </section>
    </>
  );
}
