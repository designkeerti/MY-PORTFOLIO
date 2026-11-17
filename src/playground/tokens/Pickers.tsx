import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { isHex, normHex, contrastRatio } from '../color';
import { useToast } from '../ui';
import { RADII, familyCss, shadowCss, shadows, type RadiusKey, type RadiusSem, type Resolved, type State } from './model';
import {
  DENSITIES, DEPTHS, GREYS, SCALES, SHAPES, SWATCHES, TEXT_SIZES, TYPE_PAIRS,
  accentsFor, coloursFromImage, depthOf, eyeDropper, fontCss, greysPreview, shapeOf, withBrand, type Edit,
} from './choices';
import iDrop from '@phosphor-icons/core/assets/regular/eyedropper.svg?raw';
import iImage from '@phosphor-icons/core/assets/regular/image.svg?raw';

/** The quick choices, as small visual pickers. Used in the side panel and in the canvas popovers. */

type P = { st: State; edit: Edit };
const Ic = ({ svg }: { svg: string }) => <span aria-hidden className="block h-[18px] w-[18px] [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />;

/** one choice: a little picture of what it does, and its name */
function Choice({ on, onClick, label, children, title }: { on: boolean; onClick: () => void; label: string; children: ReactNode; title?: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} title={title ?? label}
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[12px] border px-1 pb-1.5 pt-2 transition-all ${on ? 'border-ink bg-white shadow-[0_0_0_1px_rgba(23,25,30,1)]' : 'border-ink/10 bg-white/60 hover:border-ink/30 hover:bg-white'}`}>
      <span className="grid h-7 w-full place-items-center">{children}</span>
      <span className={`truncate text-[11px] font-medium ${on ? 'text-ink' : 'text-ink/60'}`}>{label}</span>
    </button>
  );
}
export function Row({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2"><span className="text-[12.5px] font-medium text-ink/70">{label}</span>{hint}</div>
      {children}
    </div>
  );
}

/* ---------- colour ---------- */

export function BrandPicker({ st, edit }: P) {
  const brand = st.color.brand;
  const [text, setText] = useState(brand);
  const [found, setFound] = useState<string[] | null>(null);
  const [over, setOver] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const toast = useToast();
  useEffect(() => setText(brand), [brand]);
  const set = (hex: string) => edit(s => withBrand(s, normHex(hex)), 'quick.brand');
  const Drop = eyeDropper();
  const take = async (f?: File | null) => {
    if (!f || !f.type.startsWith('image/')) { if (f) toast('That isn’t an image'); return; }
    try { const cs = await coloursFromImage(f); setFound(cs); set(cs[0]); toast('Took the strongest colour from your image'); }
    catch (e) { toast((e as Error).message); }
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]); };

  return (
    <div onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={onDrop}
      className={`flex flex-col gap-2 rounded-[14px] transition-colors ${over ? 'bg-[#2f6bed]/10 outline-dashed outline-2 outline-[#2f6bed]/50' : ''}`}>
      <div className="flex items-center gap-1.5">
        <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-[11px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.1)]" style={{ background: brand }} title="Pick any colour">
          <input type="color" value={brand} onChange={e => set(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Brand colour" />
        </label>
        <input value={text} spellCheck={false} aria-label="Brand colour, hex"
          onChange={e => { setText(e.target.value); if (isHex(e.target.value)) set(e.target.value); }} onBlur={() => setText(brand)}
          className="h-10 min-w-0 flex-1 rounded-[11px] border border-ink/12 bg-white px-2.5 font-mono text-[13.5px] uppercase text-ink outline-none focus:border-ink/40" />
        {Drop && (
          <button type="button" title="Pick a colour from anywhere on your screen" aria-label="Pick a colour from your screen"
            onClick={async () => { try { const r = await new Drop().open(); set(r.sRGBHex); } catch { /* cancelled */ } }}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border border-ink/12 bg-white text-ink/70 hover:border-ink/40 hover:text-ink"><Ic svg={iDrop} /></button>
        )}
        <button type="button" title="Take the colour from a logo or image (or drop one here)" aria-label="Take the colour from a logo or image" onClick={() => file.current?.click()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border border-ink/12 bg-white text-ink/70 hover:border-ink/40 hover:text-ink"><Ic svg={iImage} /></button>
        <input ref={file} type="file" accept="image/*" hidden onChange={e => { take(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {(found ?? SWATCHES).map(hex => (
          <button key={hex} type="button" onClick={() => set(hex)} aria-label={`Use ${hex}`} title={hex}
            className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${hex === brand ? 'ring-2 ring-ink ring-offset-2' : ''}`} style={{ background: hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }} />
        ))}
        {found && <button type="button" onClick={() => setFound(null)} className="ml-1 text-[11.5px] font-medium text-ink/50 hover:text-ink">From your image ×</button>}
      </div>
    </div>
  );
}

export function AccentPicker({ st, edit }: P) {
  const opts = accentsFor(st.color.brand);
  const names = ['Opposite', 'Split', 'Triad', 'Neighbour'];
  const set = (hex: string) => edit(s => ({ ...s, color: { ...s.color, accent: hex } }), 'quick.accent');
  const custom = !opts.includes(st.color.accent);
  return (
    <div className="flex gap-1.5">
      {opts.map((hex, i) => (
        <Choice key={i} on={st.color.accent === hex} onClick={() => set(hex)} label={names[i]}>
          <span className="flex h-5 w-9 overflow-hidden rounded-[6px]"><span className="flex-1" style={{ background: st.color.brand }} /><span className="flex-1" style={{ background: hex }} /></span>
        </Choice>
      ))}
      <label className={`relative flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 rounded-[12px] border px-1 pb-1.5 pt-2 ${custom ? 'border-ink bg-white shadow-[0_0_0_1px_rgba(23,25,30,1)]' : 'border-ink/10 bg-white/60 hover:border-ink/30'}`} title="Any colour">
        <span className="grid h-7 place-items-center"><span className="h-5 w-5 rounded-full" style={{ background: custom ? st.color.accent : 'conic-gradient(#f43f5e,#f59e0b,#22c55e,#06b6d4,#6366f1,#d946ef,#f43f5e)' }} /></span>
        <span className="text-[11px] font-medium text-ink/60">Own</span>
        <input type="color" value={st.color.accent} onChange={e => set(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Accent colour" />
      </label>
    </div>
  );
}

export function GreysPicker({ st, edit }: P) {
  return (
    <div className="flex gap-1.5">
      {GREYS.map(g => (
        <Choice key={g.id} label={g.label} on={st.color.lean === g.lean && Math.abs(st.color.tint - g.tint) < 0.1}
          onClick={() => edit(s => ({ ...s, color: { ...s.color, lean: g.lean, tint: g.tint } }), 'quick.greys')}>
          <span className="flex h-5 w-11 overflow-hidden rounded-[6px]">{greysPreview(g.lean, g.tint, st.color.brand).map(c => <span key={c} className="flex-1" style={{ background: c }} />)}</span>
        </Choice>
      ))}
    </div>
  );
}

export function DarkPicker({ st, edit }: P) {
  const opts = [['dim', 'Dim', '#2c2f35'], ['dark', 'Dark', '#191c20'], ['black', 'Black', '#000000']] as const;
  return (
    <div className="flex gap-1.5">
      {opts.map(([v, l, c]) => (
        <Choice key={v} label={l} on={st.color.depth === v} onClick={() => edit(s => ({ ...s, color: { ...s.color, depth: v } }), 'quick.dark')}>
          <span className="h-5 w-9 rounded-[6px]" style={{ background: c }} />
        </Choice>
      ))}
    </div>
  );
}

export function StatusPicker({ st, edit, which }: P & { which: 'success' | 'warning' | 'danger' | 'info' }) {
  return (
    <label className="flex items-center gap-2">
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-[9px]" style={{ background: st.color[which] }}>
        <input type="color" value={st.color[which]} onChange={e => edit(s => ({ ...s, color: { ...s.color, [which]: e.target.value } }), 'quick.' + which)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`${which} colour`} />
      </span>
      <span className="text-[12.5px] text-ink/70">The {which} colour. Its light and dark steps follow.</span>
    </label>
  );
}

/* ---------- type ---------- */

export function PairPicker({ st, edit }: P) {
  useEffect(() => { for (const p of TYPE_PAIRS) { fontCss(p.heading); fontCss(p.body); } }, []);
  const list = useRef<HTMLDivElement>(null);
  const cur = TYPE_PAIRS.findIndex(p => p.heading === st.type.heading && p.body === st.type.body);
  useEffect(() => {
    const el = list.current?.children[cur] as HTMLElement | undefined;
    if (el && list.current) list.current.scrollTo({ left: el.offsetLeft - 8, behavior: 'smooth' });
  }, [cur]);
  return (
    <div ref={list} className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:thin]">
      {TYPE_PAIRS.map(p => {
        const on = p.heading === st.type.heading && p.body === st.type.body;
        return (
          <button key={p.heading + p.body} type="button" aria-pressed={on} title={`${p.heading} and ${p.body}`}
            onClick={() => edit(s => ({ ...s, type: { ...s.type, heading: p.heading, body: p.body, headingWeight: p.weight } }), 'quick.pair')}
            className={`w-[118px] shrink-0 snap-start rounded-[14px] border bg-white p-2.5 text-left transition-all ${on ? 'border-ink shadow-[0_0_0_1px_rgba(23,25,30,1)]' : 'border-ink/10 hover:border-ink/30'}`}>
            <span className="block truncate text-[25px] leading-none text-ink" style={{ fontFamily: familyCss(p.heading), fontWeight: p.weight }}>Ag</span>
            <span className="mt-1.5 block text-[11px] leading-[1.35] text-ink/65" style={{ fontFamily: familyCss(p.body) }}>Calm tools for busy teams.</span>
            <span className="mt-1.5 block truncate text-[10.5px] font-semibold text-ink/45">{p.mood}</span>
          </button>
        );
      })}
    </div>
  );
}

export function SizePicker({ st, edit }: P) {
  return (
    <div className="flex gap-1.5">
      {TEXT_SIZES.map((t, i) => (
        <Choice key={t.id} label={t.label} on={st.type.base === t.base} onClick={() => edit(s => ({ ...s, type: { ...s.type, base: t.base, mBase: t.mBase } }), 'quick.size')}>
          <span className="font-semibold leading-none text-ink" style={{ fontSize: 11 + i * 3 }}>Aa</span>
        </Choice>
      ))}
    </div>
  );
}
export function ScalePicker({ st, edit }: P) {
  return (
    <div className="flex gap-1.5">
      {SCALES.map(sc => (
        <Choice key={sc.id} label={sc.label} on={st.type.ratio === sc.ratio} title={`${sc.label}: each step ×${sc.ratio}`}
          onClick={() => edit(s => ({ ...s, type: { ...s.type, ratio: sc.ratio, mRatio: sc.mRatio } }), 'quick.scale')}>
          <span className="flex items-end gap-[2px]">{[0, 1, 2, 3].map(k => <span key={k} className="w-[5px] rounded-[1.5px] bg-ink/70" style={{ height: 5 * Math.pow(sc.ratio, k * 1.6) }} />)}</span>
        </Choice>
      ))}
    </div>
  );
}

/* ---------- feel: corners, space, depth ---------- */

const rough = (base: number, k: RadiusKey) => ({ none: 0, xs: base / 4, sm: base / 2, md: base, lg: base * 1.5, xl: base * 2.25, '2xl': base * 3.4, full: 99 }[k]);

export function ShapePicker({ st, edit }: P) {
  const cur = shapeOf(st);
  return (
    <div className="flex gap-1.5">
      {SHAPES.map(sh => (
        <Choice key={sh.id} label={sh.label} on={cur === sh.id} onClick={() => edit(s => ({ ...s, radius: { base: sh.base, step: sh.step, map: { ...sh.map } } }), 'quick.shape')}>
          <span className="flex items-center gap-1">
            <span className="h-4 w-4 border-[1.5px] border-b-0 border-l-0 border-ink/70" style={{ borderTopRightRadius: Math.min(rough(sh.base, sh.map.card) * 0.7, 16) }} />
            <span className="h-[11px] w-5 bg-ink/75" style={{ borderRadius: Math.min(rough(sh.base, sh.map.button) * 0.5, 6) }} />
          </span>
        </Choice>
      ))}
    </div>
  );
}
export function DensityPicker({ st, edit }: P) {
  return (
    <div className="flex gap-1.5">
      {DENSITIES.map(d => (
        <Choice key={d.id} label={d.label} on={st.space.density === d.id} onClick={() => edit(s => ({ ...s, space: { ...s.space, density: d.id } }), 'quick.density')}>
          <span className="flex flex-col" style={{ gap: d.gap / 2.2 }}>{[0, 1, 2].map(k => <span key={k} className="h-[3px] w-6 rounded-full bg-ink/60" />)}</span>
        </Choice>
      ))}
    </div>
  );
}
export function DepthPicker({ st, edit }: P) {
  const cur = depthOf(st);
  return (
    <div className="flex gap-1.5">
      {DEPTHS.map(d => (
        <Choice key={d.id} label={d.label} on={cur === d.id} onClick={() => edit(s => ({ ...s, shadow: { ...s.shadow, strength: d.strength, softness: d.softness } }), 'quick.depth')}>
          <span className="h-[18px] w-7 rounded-[5px] bg-white" style={{ boxShadow: shadowCss(shadows({ strength: d.strength, softness: d.softness, tint: 0.4 }, 250, 'light').md) + ', 0 0 0 1px rgba(0,0,0,.04)' }} />
        </Choice>
      ))}
    </div>
  );
}

/** the corners of one kind of component */
export function CornerPicker({ st, res, edit, which }: P & { res: Resolved; which: RadiusSem }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={`Corners of ${which}`}>
      {RADII.map(k => (
        <button key={k} type="button" role="radio" aria-checked={st.radius.map[which] === k} title={`${k} · ${k === 'full' ? 'full' : res.radius.prims[k] + 'px'}`}
          onClick={() => edit(s => ({ ...s, radius: { ...s.radius, map: { ...s.radius.map, [which]: k } } }), 'quick.corner.' + which)}
          className={`grid h-8 flex-1 place-items-center rounded-[8px] transition-colors ${st.radius.map[which] === k ? 'bg-ink' : 'bg-ink/[0.06] hover:bg-ink/[0.12]'}`}>
          <span className={`block h-3.5 w-3.5 border-[1.5px] border-b-0 border-l-0 ${st.radius.map[which] === k ? 'border-white' : 'border-ink/70'}`} style={{ borderTopRightRadius: Math.min(res.radius.prims[k], 14) }} />
        </button>
      ))}
    </div>
  );
}

/** a readable label colour for text drawn on a swatch */
export const inkOn = (hex: string) => (contrastRatio(hex, '#ffffff') > 3 ? '#ffffff' : '#17191e');
