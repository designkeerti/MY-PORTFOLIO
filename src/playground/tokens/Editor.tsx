import { useEffect, useRef, useState } from 'react';
import { FONTS } from '../data';
import { contrastRatio } from '../color';
import {
  BPS, DENSITY, LEVELS, LEVEL_USE, MODES, PALETTES, RADII, RADIUS_SEM, RATIOS, SEMANTIC, SPACE_SEM, STEPS,
  fixFor, shadowCss, weightsOf, type Mode, type Ref, type Resolved, type State,
} from './model';
import { Delta, Field, Group, Hex, Pick, Range, Seg, Toggle } from './controls';

export type Tab = 'color' | 'type' | 'space' | 'radius' | 'depth' | 'grid';
export const TABS: { id: Tab; label: string }[] = [
  { id: 'color', label: 'Colour' }, { id: 'type', label: 'Type' }, { id: 'space', label: 'Spacing' },
  { id: 'radius', label: 'Radius' }, { id: 'depth', label: 'Depth' }, { id: 'grid', label: 'Grid' },
];

type Edit = (fn: (s: State) => State, key?: string) => void;
type Props = { st: State; res: Resolved; edit: Edit; tab: Tab; setTab: (t: Tab) => void; focus: { id: string; n: number } | null; deltas: Record<string, { from: string; to: string }> };

const fontOptions = (cats?: string[]) => FONTS.filter(f => !cats || cats.includes(f.cat)).map(f => ({ value: f.name, label: f.name, group: { sans: 'Sans', serif: 'Serif', display: 'Display', mono: 'Mono', slab: 'Slab' }[f.cat] }));
const pct = (v: number) => `${Math.round(v * 100)}%`;
const shortRef = (r: Ref) => (r === 'white' || r === 'black' ? r : r.replace('.', ' '));

export function Editor(p: Props) {
  const { st, edit, tab, setTab, focus } = p;
  const body = useRef<HTMLDivElement>(null);
  // each group starts at its top
  useEffect(() => { body.current?.scrollTo(0, 0); }, [tab]);
  // the inspector or a check asked to show a token: scroll to it and flash it
  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => {
      const panel = body.current, el = panel?.querySelector<HTMLElement>(`[data-focus="${CSS.escape(focus.id)}"]`);
      if (!panel || !el) return;
      // scroll the panel, not the page; when the panel doesn't scroll (phones), bring it into view
      if (panel.scrollHeight > panel.clientHeight + 4) {
        const b = panel.getBoundingClientRect(), r = el.getBoundingClientRect();
        panel.scrollBy({ top: r.top - b.top - b.height / 2 + Math.min(r.height, b.height / 2) / 2, behavior: 'smooth' });
      } else el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el.classList.remove('tk-flash'); void el.offsetWidth; el.classList.add('tk-flash');
    }, 60);
    return () => clearTimeout(t);
  }, [focus]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 border-b border-ink/[0.08] p-4 pb-3">
        <label className="flex items-center gap-2.5">
          <span className="pg-label shrink-0">Name</span>
          <input value={st.name} spellCheck={false} maxLength={24} aria-label="System name"
            onChange={e => { const name = e.target.value; edit(s => ({ ...s, name }), 'name'); }}
            className="min-w-0 flex-1 rounded-[10px] border border-ink/12 bg-white px-2.5 py-1.5 text-[14px] font-medium text-ink outline-none focus:border-ink/40" />
        </label>
        <div role="tablist" aria-label="Token groups" className="grid grid-cols-6 gap-0.5 rounded-[13px] bg-ink/[0.06] p-[3px]">
          {TABS.map(t => (
            <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`min-w-0 truncate rounded-[10px] px-0.5 py-1.5 text-[12.5px] font-medium transition-all ${tab === t.id ? 'bg-white text-ink shadow-[0_1px_4px_-1px_rgba(15,30,55,0.25)]' : 'text-ink/60 hover:text-ink'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={body} className="min-h-0 flex-1 overflow-y-auto overscroll-contain" role="tabpanel">
        {tab === 'color' && <ColourPanel {...p} />}
        {tab === 'type' && <TypePanel {...p} />}
        {tab === 'space' && <SpacePanel {...p} />}
        {tab === 'radius' && <RadiusPanel {...p} />}
        {tab === 'depth' && <DepthPanel {...p} />}
        {tab === 'grid' && <GridPanel {...p} />}
      </div>
    </div>
  );
}

/* ---------- colour ---------- */

function ColourPanel({ st, res, edit, deltas }: Props) {
  const c = st.color;
  const set = (patch: Partial<State['color']>, key: string) => edit(s => ({ ...s, color: { ...s.color, ...patch } }), 'color.' + key);
  const [open, setOpen] = useState<{ id: string; mode: Mode } | null>(null);
  const [all, setAll] = useState(false);
  const fails = res.checks.filter(x => !x.pass);
  const overrides = Object.keys(c.map).length;
  const pickRef = (mode: Mode, id: string, ref: Ref | null) => edit(s => {
    const map = { ...s.color.map };
    if (ref === null || ref === res.semantic[mode][id].auto) delete map[`${mode}:${id}`]; else map[`${mode}:${id}`] = ref;
    return { ...s, color: { ...s.color, map } };
  }, `map.${mode}.${id}`);
  const fixAll = () => edit(s => {
    const map = { ...s.color.map };
    for (const chk of fails) { const f = fixFor(res, chk); if (f) map[f.key] = f.ref; }
    return { ...s, color: { ...s.color, map } };
  });

  return (
    <>
      <Group title="Brand">
        <div className="grid grid-cols-2 gap-2">
          <Hex label="Brand" value={c.brand} onChange={v => set({ brand: v }, 'brand')} />
          <Hex label="Accent" value={c.accent} onChange={v => set({ accent: v }, 'accent')} />
        </div>
        <p className="text-[12px] leading-snug text-ink/50">Each colour becomes an 11-step palette, made in OKLCH so the steps look even. Your exact colour sits on the step nearest its lightness.</p>
      </Group>
      <Group title="Neutrals">
        <Seg label="Greys lean" value={c.lean} onChange={v => set({ lean: v }, 'lean')} options={[{ value: 'brand', label: 'To brand' }, { value: 'warm', label: 'Warm' }, { value: 'cool', label: 'Cool' }]} />
        <Range label="Tint" min={0} max={1} step={0.01} value={c.tint} onChange={v => set({ tint: v }, 'tint')} show={pct} hint="0% is pure grey." />
      </Group>
      <Group title="Status">
        <div className="grid grid-cols-2 gap-2">
          {(['success', 'warning', 'danger', 'info'] as const).map(k => <Hex key={k} small label={k[0].toUpperCase() + k.slice(1)} value={c[k]} onChange={v => set({ [k]: v }, k)} />)}
        </div>
        <Range label="Harmonise with brand" min={0} max={1} step={0.01} value={c.harmonize} onChange={v => set({ harmonize: v }, 'harmonize')} show={pct} hint="Turns their hues a little toward the brand, so they feel like one family." />
      </Group>
      <Group title="Palettes">
        <div className="flex flex-col gap-[3px]">
          {PALETTES.map(pal => (
            <div key={pal} className="flex items-center gap-2">
              <span className="w-[54px] shrink-0 text-[11px] text-ink/55">{pal}</span>
              <div className="flex flex-1 overflow-hidden rounded-[6px]">
                {STEPS.map(s => <span key={s} title={`${pal} ${s} · ${res.palettes[pal][s]}`} className="h-[18px] flex-1 transition-colors duration-500" style={{ background: res.palettes[pal][s] }} />)}
              </div>
            </div>
          ))}
        </div>
        <Range label="Range" min={0} max={1} step={0.01} value={c.range} onChange={v => set({ range: v }, 'range')} show={pct} hint="How close the lightest and darkest steps get to white and black." />
      </Group>
      <Group title="Dark mode">
        <Seg label="Dark mode depth" value={c.depth} onChange={v => set({ depth: v }, 'depth')} options={[{ value: 'dim', label: 'Dim' }, { value: 'dark', label: 'Dark' }, { value: 'black', label: 'Black' }]} />
        <p className="text-[12px] leading-snug text-ink/50">Dark mode isn’t an inverted light mode: surfaces step up in lightness as they rise, and brand colours shift lighter to keep their contrast.</p>
      </Group>
      <div data-focus="contrast" className="rounded-[10px]"><Group title="Contrast" aside={<span className={`rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${fails.length ? 'bg-[#ffe1dc] text-[#9a2a14]' : 'bg-[#dcf5e4] text-[#11652f]'}`}>{res.checks.length - fails.length}/{res.checks.length} pass</span>}>
        {fails.length > 0 ? (
          <>
            <ul className="flex flex-col gap-1.5">
              {fails.map(chk => {
                const f = fixFor(res, chk);
                return (
                  <li key={chk.mode + chk.fg + chk.bg} className="flex items-center gap-2 rounded-[12px] bg-white px-2.5 py-2">
                    <span className="grid h-7 w-9 shrink-0 place-items-center rounded-[7px] text-[12px] font-semibold" style={{ background: res.semantic[chk.mode][chk.bg].hex, color: res.semantic[chk.mode][chk.fg].hex, border: '1px solid rgba(0,0,0,.08)' }}>Aa</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-ink">{chk.label}</span>
                      <span className="block text-[11.5px] text-ink/55">{chk.mode === 'light' ? 'Light' : 'Dark'} · {chk.ratio.toFixed(2)}:1, needs {chk.min}:1</span>
                    </span>
                    {f && <button type="button" onClick={() => edit(s => ({ ...s, color: { ...s.color, map: { ...s.color.map, [f.key]: f.ref } } }))} className="shrink-0 rounded-full border border-ink/15 px-2.5 py-1 text-[12px] font-medium text-ink hover:border-ink/40" title={`Use ${shortRef(f.ref)} for ${chk.fg}`}>Fix</button>}
                  </li>
                );
              })}
            </ul>
            {fails.length > 1 && <button type="button" onClick={fixAll} className="self-start rounded-full bg-ink px-3 py-1.5 text-[12.5px] font-medium text-white">Fix all</button>}
          </>
        ) : <p className="text-[12.5px] leading-snug text-ink/60">Every pair that’s read together passes WCAG AA, in light and dark.</p>}
        <button type="button" onClick={() => setAll(a => !a)} className="self-start text-[12.5px] font-medium text-ink/60 underline decoration-ink/20 underline-offset-4 hover:text-ink">{all ? 'Hide the pairs' : 'See every pair'}</button>
        {all && (
          <ul className="flex flex-col gap-1">
            {res.checks.map(chk => (
              <li key={chk.mode + chk.fg + chk.bg} className="flex items-center gap-2 text-[12px]">
                <span className="grid h-6 w-8 shrink-0 place-items-center rounded-[6px] text-[11px] font-semibold" style={{ background: res.semantic[chk.mode][chk.bg].hex, color: res.semantic[chk.mode][chk.fg].hex, border: '1px solid rgba(0,0,0,.08)' }}>Aa</span>
                <span className="min-w-0 flex-1 truncate text-ink/70">{chk.label} <span className="text-ink/40">· {chk.mode}</span></span>
                <span className={`font-mono tabular-nums ${chk.pass ? 'text-[#11652f]' : 'text-[#b4321a]'}`}>{chk.ratio.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        )}
      </Group></div>
      <Group title="Semantic colours" aside={overrides > 0 && <button type="button" onClick={() => edit(s => ({ ...s, color: { ...s.color, map: {} } }))} className="text-[12px] font-medium text-ink/60 hover:text-ink">Reset {overrides}</button>}>
        <p className="-mt-1 text-[12px] leading-snug text-ink/50">What the interface uses. Each one points at a palette step, once for light and once for dark. Tap a swatch to point it somewhere else.</p>
        {(['bg', 'fg', 'border'] as const).map(g => (
          <div key={g} className="flex flex-col">
            <p className="mb-1 mt-1 text-[11.5px] font-semibold text-ink/45">{{ bg: 'Backgrounds', fg: 'Text and icons', border: 'Borders' }[g]}</p>
            {SEMANTIC.filter(s => s.group === g).map(s => (
              <div key={s.id} data-focus={`color/${s.id}`} className="rounded-[10px]">
                <div className="flex items-center gap-2 py-[3px]">
                  {MODES.map(m => {
                    const v = res.semantic[m][s.id];
                    const isOpen = open?.id === s.id && open.mode === m;
                    return (
                      <button key={m} type="button" onClick={() => setOpen(isOpen ? null : { id: s.id, mode: m })} aria-label={`${s.id}, ${m}: ${shortRef(v.ref)}. Change`} aria-expanded={isOpen}
                        className={`relative h-7 w-7 shrink-0 rounded-[8px] transition-[background-color,box-shadow] duration-500 ${isOpen ? 'ring-2 ring-ink ring-offset-1' : ''}`}
                        style={{ background: v.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)' }}>
                        {v.changed && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-[#2f6bed]" />}
                      </button>
                    );
                  })}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[12px] text-ink">{s.id}</span>
                    <span className="block truncate text-[11px] text-ink/45">{shortRef(res.semantic.light[s.id].ref)} · {shortRef(res.semantic.dark[s.id].ref)}</span>
                  </span>
                  {deltas[`light:color/${s.id}`] && <Delta from={shortRef(deltas[`light:color/${s.id}`].from as Ref)} to={shortRef(deltas[`light:color/${s.id}`].to as Ref)} />}
                </div>
                {open?.id === s.id && <StepPicker res={res} mode={open.mode} id={s.id} onPick={r => pickRef(open.mode, s.id, r)} onMode={m => setOpen({ id: s.id, mode: m })} />}
              </div>
            ))}
          </div>
        ))}
      </Group>
    </>
  );
}

function StepPicker({ res, mode, id, onPick, onMode }: { res: Resolved; mode: Mode; id: string; onPick: (r: Ref | null) => void; onMode: (m: Mode) => void }) {
  const cur = res.semantic[mode][id];
  const pair = id.startsWith('fg/') || id.startsWith('border/') ? (id === 'fg/on-brand' ? 'bg/brand' : id === 'fg/on-accent' ? 'bg/accent' : id === 'fg/inverse' ? 'bg/inverse' : 'bg/canvas') : null;
  const against = pair ? res.semantic[mode][pair].hex : null;
  return (
    <div className="mb-2 mt-1 rounded-[14px] border border-ink/10 bg-white p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Seg value={mode} onChange={onMode} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} label="Mode" />
        {cur.changed && <button type="button" onClick={() => onPick(null)} className="shrink-0 text-[12px] font-medium text-ink/60 hover:text-ink">Auto</button>}
      </div>
      <div className="flex flex-col gap-[3px]">
        {PALETTES.map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <span className="w-[46px] shrink-0 text-[10.5px] text-ink/50">{p}</span>
            <div className="grid flex-1 grid-cols-11 gap-[2px]">
              {STEPS.map(s => {
                const ref = `${p}.${s}` as Ref, hex = res.palettes[p][s], on = cur.ref === ref, auto = cur.auto === ref;
                const ok = against ? contrastRatio(hex, against) >= (id.startsWith('border/') ? 3 : 4.5) : true;
                return (
                  <button key={s} type="button" onClick={() => onPick(ref)} title={`${p} ${s} · ${hex}${against ? ` · ${contrastRatio(hex, against).toFixed(1)}:1` : ''}${auto ? ' · auto' : ''}`}
                    className={`relative aspect-square rounded-[4px] ${on ? 'z-10 ring-2 ring-ink ring-offset-1' : ''}`} style={{ background: hex }}>
                    {auto && !on && <span className="absolute inset-0 m-auto h-1 w-1 rounded-full" style={{ background: contrastRatio(hex, '#fff') > 3 ? '#fff' : '#17191e' }} />}
                    {!ok && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#e5484d]" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="mt-1 flex items-center gap-1.5">
          <span className="w-[46px] shrink-0 text-[10.5px] text-ink/50">base</span>
          {(['white', 'black'] as Ref[]).map(r => (
            <button key={r} type="button" onClick={() => onPick(r)} className={`h-5 rounded-[4px] px-2 text-[10.5px] font-medium ${cur.ref === r ? 'ring-2 ring-ink ring-offset-1' : ''}`}
              style={{ background: r === 'white' ? '#fff' : '#000', color: r === 'white' ? '#000' : '#fff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)' }}>{r}</button>
          ))}
        </div>
      </div>
      {against && <p className="mt-2 text-[11px] leading-snug text-ink/50">A red line marks steps that don’t reach {id.startsWith('border/') ? '3' : '4.5'}:1 on {pair}. The dot is the automatic choice.</p>}
    </div>
  );
}

/* ---------- type ---------- */

function TypePanel({ st, res, edit, deltas }: Props) {
  const t = st.type;
  const set = (patch: Partial<State['type']>, key: string) => edit(s => ({ ...s, type: { ...s.type, ...patch } }), 'type.' + key);
  const weightOpts = (name: string, only?: number[]) => weightsOf(name).filter(w => !only || only.includes(w)).map(w => ({ value: w, label: String(w) }));
  const ratioOpts = RATIOS.map(r => ({ value: String(r.v), label: `${r.v} · ${r.label}` }));
  const over = (id: string, patch: { weight?: number; step?: number } | null) => edit(s => {
    const o = { ...s.type.over } as Record<string, { weight?: number; step?: number }>;
    if (patch === null) delete o[id]; else o[id] = { ...o[id], ...patch };
    return { ...s, type: { ...s.type, over: o } };
  }, 'type.over.' + id);
  const hw = weightOpts(t.heading), bw = weightOpts(t.body, [300, 400, 500]), sw = weightOpts(t.body, [500, 600, 700, 800]);

  return (
    <>
      <Group title="Families">
        <Field label="Headings"><Pick label="Heading font" value={t.heading} onChange={v => set({ heading: v }, 'heading')} options={fontOptions()} /></Field>
        <Field label="Body"><Pick label="Body font" value={t.body} onChange={v => set({ body: v }, 'body')} options={fontOptions(['sans', 'serif', 'slab'])} /></Field>
        <Field label="Code"><Pick label="Code font" value={t.mono} onChange={v => set({ mono: v }, 'mono')} options={fontOptions(['mono'])} /></Field>
      </Group>
      <Group title="Weights">
        {hw.length > 1 ? <Field label="Headings"><Seg label="Heading weight" value={res.type.weights.heading} onChange={v => set({ headingWeight: v }, 'hw')} options={hw} /></Field>
          : <p className="text-[12px] text-ink/50">{t.heading} comes in one weight.</p>}
        {bw.length > 1 && <Field label="Body"><Seg label="Body weight" value={res.type.weights.body} onChange={v => set({ bodyWeight: v }, 'bw')} options={bw} /></Field>}
        {sw.length > 1 && <Field label="Strong" hint="Overlines, bold text and emphasis."><Seg label="Strong weight" value={res.type.weights.strong} onChange={v => set({ strongWeight: v }, 'sw')} options={sw} /></Field>}
      </Group>
      <Group title="Scale">
        <p className="-mt-1 text-[12px] leading-snug text-ink/50">Each style is the base size times the ratio, raised to its step. Phones get their own base and ratio, kept as a second mode.</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          <p className="text-[12px] font-semibold text-ink/70">Desktop</p><p className="text-[12px] font-semibold text-ink/70">Mobile</p>
          <Range label="Base" min={12} max={22} step={1} value={t.base} onChange={v => set({ base: v }, 'base')} show={v => v + 'px'} />
          <Range label="Base" min={12} max={22} step={1} value={t.mBase} onChange={v => set({ mBase: v }, 'mBase')} show={v => v + 'px'} />
          <Pick label="Desktop ratio" value={String(t.ratio)} onChange={v => set({ ratio: +v }, 'ratio')} options={ratioOpts} />
          <Pick label="Mobile ratio" value={String(t.mRatio)} onChange={v => set({ mRatio: +v }, 'mRatio')} options={ratioOpts} />
        </div>
      </Group>
      <Group title="Spacing in text">
        <Range label="Body line height" min={1.2} max={1.9} step={0.01} value={t.bodyLh} onChange={v => set({ bodyLh: v }, 'bodyLh')} />
        <Range label="Heading line height" min={0.9} max={1.5} step={0.01} value={t.headingLh} onChange={v => set({ headingLh: v }, 'headingLh')} hint="Smaller headings ease toward the body’s line height." />
        <Range label="Heading tracking" min={-0.06} max={0.03} step={0.001} value={t.tracking} onChange={v => set({ tracking: v }, 'tracking')} show={v => `${(v * 100).toFixed(1)}%`} hint="Applied in full at Display, less as headings get smaller." />
        <Toggle label="Snap line heights to 4px" checked={t.snap} onChange={v => set({ snap: v }, 'snap')} hint="Keeps text on the same 4px rhythm as spacing." />
      </Group>
      <Group title="Styles" aside={Object.keys(t.over).length > 0 && <button type="button" onClick={() => edit(s => ({ ...s, type: { ...s.type, over: {} } }))} className="text-[12px] font-medium text-ink/60 hover:text-ink">Reset</button>}>
        <div className="flex flex-col">
          {res.type.styles.map(s => {
            const d = deltas[`text/${s.id}/size`];
            return (
              <div key={s.id} data-focus={`text/${s.id}`} className="flex items-center gap-2 rounded-[10px] py-1.5">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5"><span className="truncate text-[13px] font-medium text-ink">{s.label}</span>{d && <Delta from={d.from} to={d.to} />}</span>
                  <span className="block font-mono text-[11px] text-ink/50">{s.desktop.size}/{s.desktop.lh} · {s.mobile.size}/{s.mobile.lh}</span>
                </span>
                <span className="flex items-center rounded-[9px] border border-ink/12 bg-white">
                  <button type="button" aria-label={`${s.label} smaller`} onClick={() => over(s.id, { step: s.step - 1 })} className="px-2 py-1 text-[13px] text-ink/60 hover:text-ink">−</button>
                  <span className="w-5 text-center font-mono text-[11.5px] text-ink/70" title="Step on the scale">{s.step}</span>
                  <button type="button" aria-label={`${s.label} bigger`} onClick={() => over(s.id, { step: s.step + 1 })} className="px-2 py-1 text-[13px] text-ink/60 hover:text-ink">+</button>
                </span>
                <select aria-label={`${s.label} weight`} value={s.weight} onChange={e => over(s.id, { weight: +e.target.value })} className="rounded-[9px] border border-ink/12 bg-white px-1.5 py-1 font-mono text-[12px] text-ink">
                  {weightsOf(s.family).map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </Group>
    </>
  );
}

/* ---------- spacing ---------- */

function SpacePanel({ st, res, edit, deltas }: Props) {
  const sp = st.space;
  const set = (patch: Partial<State['space']>, key: string) => edit(s => ({ ...s, space: { ...s.space, ...patch } }), 'space.' + key);
  const pickSem = (id: string, mult: number | null) => edit(s => {
    const map = { ...s.space.map } as Record<string, number>;
    if (mult === null) delete map[id]; else map[id] = mult;
    return { ...s, space: { ...s.space, map } };
  }, 'space.map.' + id);
  const max = Math.max(...res.space.prims.map(p => p.px));
  return (
    <>
      <Group title="Scale">
        <Range label="Base unit" min={2} max={8} step={1} value={sp.base} onChange={v => set({ base: v }, 'base')} show={v => v + 'px'} hint="Every space is a multiple of this." />
        <Field label="Steps"><Seg label="Scale" value={sp.scale} onChange={v => set({ scale: v }, 'scale')} options={[{ value: 'linear', label: 'Linear' }, { value: 'geometric', label: 'Geometric' }, { value: 'fibonacci', label: 'Fibonacci' }]} /></Field>
        <Field label="Density" hint="Moves every semantic space up or down the scale."><Seg label="Density" value={sp.density} onChange={v => set({ density: v }, 'density')} options={(Object.keys(DENSITY) as State['space']['density'][]).map(d => ({ value: d, label: d[0].toUpperCase() + d.slice(1) }))} /></Field>
        <div className="flex flex-col gap-1">
          {res.space.prims.map(p => (
            <div key={p.name} className="flex items-center gap-2 text-[11.5px]">
              <span className="w-[62px] shrink-0 font-mono text-ink/60">space/{p.name}</span>
              <span className="h-2 rounded-full bg-[#2f6bed]/70 transition-[width] duration-500" style={{ width: `${(p.px / max) * 100}%`, minWidth: p.px ? 2 : 0 }} />
              <span className="ml-auto shrink-0 font-mono tabular-nums text-ink/50">{p.px}</span>
            </div>
          ))}
        </div>
      </Group>
      <Group title="Semantic spacing" aside={Object.keys(sp.map).length > 0 && <button type="button" onClick={() => set({ map: {} }, 'map')} className="text-[12px] font-medium text-ink/60 hover:text-ink">Reset</button>}>
        <p className="-mt-1 text-[12px] leading-snug text-ink/50">Inset is padding inside things, stack is the gap between things above and below, inline is the gap beside.</p>
        {SPACE_SEM.map(s => {
          const v = res.space.sem[s.id]; const d = deltas[`space/${s.id}`];
          return (
            <div key={s.id} data-focus={`space/${s.id}`} className="flex items-center gap-2 rounded-[10px] py-0.5">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5"><span className="truncate font-mono text-[12px] text-ink">{s.id}</span>{d && <Delta from={d.from} to={d.to} />}</span>
                <span className="block truncate text-[11px] text-ink/45">{s.use}</span>
              </span>
              {v.changed && <button type="button" onClick={() => pickSem(s.id, null)} className="text-[11px] text-ink/50 hover:text-ink" aria-label={`Reset ${s.id}`}>auto</button>}
              <select aria-label={`${s.id} size`} value={v.ref} onChange={e => pickSem(s.id, +e.target.value)} className={`w-[92px] rounded-[9px] border bg-white px-1.5 py-1 font-mono text-[12px] text-ink ${v.changed ? 'border-[#2f6bed]' : 'border-ink/12'}`}>
                {res.space.prims.slice(1).map(p => <option key={p.name} value={p.name}>{p.name} · {p.px}px</option>)}
              </select>
            </div>
          );
        })}
      </Group>
    </>
  );
}

/* ---------- radius ---------- */

function RadiusPanel({ st, res, edit, deltas }: Props) {
  const r = st.radius;
  const set = (patch: Partial<State['radius']>, key: string) => edit(s => ({ ...s, radius: { ...s.radius, ...patch } }), 'radius.' + key);
  return (
    <>
      <Group title="Scale">
        <Range label="Base (md)" min={0} max={32} step={1} value={r.base} onChange={v => set({ base: v }, 'base')} show={v => v + 'px'} />
        <Range label="Step" min={1.2} max={2.2} step={0.05} value={r.step} onChange={v => set({ step: v }, 'step')} show={v => '×' + v.toFixed(2)} hint="How much bigger lg, xl and 2xl get." />
        <div className="grid grid-cols-4 gap-2">
          {RADII.map(k => (
            <div key={k} className="flex flex-col items-center gap-1">
              <span className="h-10 w-10 border-2 border-ink/70 bg-white transition-[border-radius] duration-500" style={{ borderRadius: Math.min(res.radius.prims[k], 20) }} />
              <span className="font-mono text-[11px] text-ink/60">{k} · {k === 'full' ? '∞' : res.radius.prims[k]}</span>
            </div>
          ))}
        </div>
      </Group>
      <Group title="Components">
        {RADIUS_SEM.map(s => {
          const v = res.radius.sem[s.id]; const d = deltas[`radius/${s.id}`];
          return (
            <div key={s.id} data-focus={`radius/${s.id}`} className="flex flex-col gap-1.5 rounded-[10px] py-1">
              <span className="flex items-center gap-1.5"><span className="font-mono text-[12px] text-ink">radius/{s.id}</span><span className="text-[11px] text-ink/45">{s.use}</span>{d && <Delta from={d.from === '9999' ? '∞' : d.from} to={d.to === '9999' ? '∞' : d.to} />}</span>
              <div className="flex gap-1" role="radiogroup" aria-label={`radius/${s.id}`}>
                {RADII.map(k => (
                  <button key={k} type="button" role="radio" aria-checked={v.ref === k} title={`${k} · ${k === 'full' ? 'full' : res.radius.prims[k] + 'px'}`}
                    onClick={() => set({ map: { ...r.map, [s.id]: k } }, 'map.' + s.id)}
                    className={`grid h-8 flex-1 place-items-center rounded-[8px] transition-colors ${v.ref === k ? 'bg-ink' : 'bg-ink/[0.06] hover:bg-ink/[0.12]'}`}>
                    <span className={`block h-3.5 w-3.5 border-[1.5px] border-b-0 border-l-0 ${v.ref === k ? 'border-white' : 'border-ink/70'}`} style={{ borderTopRightRadius: Math.min(res.radius.prims[k], 14) }} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </Group>
    </>
  );
}

/* ---------- depth ---------- */

function DepthPanel({ st, res, edit }: Props) {
  const sh = st.shadow;
  const set = (patch: Partial<State['shadow']>, key: string) => edit(s => ({ ...s, shadow: { ...s.shadow, ...patch } }), 'shadow.' + key);
  return (
    <>
      <Group title="Shadows">
        <Range label="Strength" min={0} max={1} step={0.01} value={sh.strength} onChange={v => set({ strength: v }, 'strength')} show={pct} />
        <Range label="Softness" min={0.4} max={2.2} step={0.05} value={sh.softness} onChange={v => set({ softness: v }, 'softness')} show={v => '×' + v.toFixed(2)} />
        <Range label="Tint" min={0} max={1} step={0.01} value={sh.tint} onChange={v => set({ tint: v }, 'tint')} show={pct} hint="Shadows take a little of the greys’ hue, so they don’t look dirty on coloured surfaces." />
        <p className="text-[12px] leading-snug text-ink/50">Each level is several shadows that grow and fade the way light does. Dark mode gets deeper, black shadows of its own.</p>
      </Group>
      <Group title="Levels">
        <div className="grid grid-cols-5 gap-2 rounded-[14px] bg-[#f3f2ee] p-3">
          {LEVELS.map(l => (
            <div key={l} data-focus={`shadow/${l}`} className="flex flex-col items-center gap-1.5 rounded-[10px]">
              <span className="h-10 w-full rounded-[8px] bg-white transition-shadow duration-500" style={{ boxShadow: shadowCss(res.shadow.light[l]) }} />
              <span className="font-mono text-[11px] text-ink/60">{l}</span>
            </div>
          ))}
        </div>
        <ul className="flex flex-col gap-1 text-[12px] text-ink/60">{LEVELS.map(l => <li key={l}><span className="font-mono text-ink">shadow/{l}</span> · {LEVEL_USE[l]}</li>)}</ul>
      </Group>
    </>
  );
}

/* ---------- grid ---------- */

function GridPanel({ st, edit }: Props) {
  const g = st.grid;
  const setBp = (bp: (typeof BPS)[number], patch: Partial<State['grid']['mobile']>, key: string) => edit(s => ({ ...s, grid: { ...s.grid, [bp]: { ...s.grid[bp], ...patch } } }), `grid.${bp}.${key}`);
  const set = (patch: Partial<State['grid']>, key: string) => edit(s => ({ ...s, grid: { ...s.grid, ...patch } }), 'grid.' + key);
  return (
    <>
      {BPS.map(bp => (
        <Group key={bp} title={{ mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' }[bp]}>
          <Range label="Columns" min={2} max={16} step={1} value={g[bp].columns} onChange={v => setBp(bp, { columns: v }, 'columns')} />
          <Range label="Gutter" min={0} max={48} step={2} value={g[bp].gutter} onChange={v => setBp(bp, { gutter: v }, 'gutter')} show={v => v + 'px'} />
          <Range label="Margin" min={0} max={160} step={2} value={g[bp].margin} onChange={v => setBp(bp, { margin: v }, 'margin')} show={v => v + 'px'} />
        </Group>
      ))}
      <Group title="Container and breakpoints">
        <Range label="Max content width" min={720} max={1600} step={8} value={g.max} onChange={v => set({ max: v }, 'max')} show={v => v + 'px'} />
        <Range label="Tablet from" min={560} max={1000} step={8} value={g.tabletAt} onChange={v => set({ tabletAt: Math.min(v, g.desktopAt - 8) }, 'tabletAt')} show={v => v + 'px'} />
        <Range label="Desktop from" min={840} max={1600} step={8} value={g.desktopAt} onChange={v => set({ desktopAt: Math.max(v, g.tabletAt + 8) }, 'desktopAt')} show={v => v + 'px'} />
      </Group>
    </>
  );
}
