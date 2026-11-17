import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { canvasVars, weightsOf, type Bp, type Mode, type Resolved, type State } from './model';
import { GridOverlay, SITE_CSS, Site, annotations, type Annot } from './Site';
import { Pick } from './controls';
import { FONTS } from '../data';
import {
  AccentPicker, BrandPicker, CornerPicker, DarkPicker, DensityPicker, DepthPicker, GreysPicker, Row, ShapePicker, StatusPicker,
} from './Pickers';
import type { Edit } from './choices';
import type { Tab } from './Editor';
import iClick from '@phosphor-icons/core/assets/regular/cursor-click.svg?raw';

/**
 * View one: the sample site, sitting in the page (it scrolls with the page, nothing scrolls
 * inside it). Hover shows what a thing is; click it to change it right there.
 */

export const FRAME_W: Record<Bp, number> = { mobile: 390, tablet: 834, desktop: 1440 };

const NAMES: [string, string][] = [
  ['.btn-primary', 'Primary button'], ['.btn-secondary', 'Secondary button'], ['.btn-ghost', 'Text button'], ['.btn-inverse', 'Button on brand'],
  ['.btn-outline-on', 'Outline button'], ['.mark', 'Logo mark'], ['.logo', 'Logo'], ['.badge', 'Badge'], ['.icon-box', 'Icon'], ['.input', 'Input'],
  ['.toggle', 'Switch'], ['.tick', 'Checkbox'], ['.alert', 'Message'], ['.tile', 'Stat tile'], ['.app', 'Dashboard panel'], ['.seg', 'Tabs'],
  ['.chart', 'Chart'], ['table', 'Table'], ['.av', 'Avatar'], ['.inv', 'Toast'], ['.cta', 'Call to action'], ['.price', 'Pricing card'], ['.card', 'Card'],
  ['.nav', 'Navigation'], ['.foot', 'Footer'], ['.band', 'Section'], ['.link', 'Link'], ['.links', 'Navigation links'], ['.setting', 'Setting row'],
  ['.field', 'Field'], ['.ticks', 'List'], ['.tks', 'Page'],
];
const LABELS: Record<string, string> = { display: 'Display heading', h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3', h4: 'Heading 4', 'body-lg': 'Lead text', body: 'Body text', 'body-sm': 'Small text', label: 'Label', caption: 'Caption', overline: 'Overline', code: 'Code' };
function nameOf(el: HTMLElement) {
  for (const [sel, n] of NAMES) if (el.matches(sel)) return n;
  const t = [...el.classList].find(c => c.startsWith('t-'));
  return t ? LABELS[t.slice(2)] ?? 'Text' : 'Element';
}

type Target = { el: HTMLElement; annots: Annot[]; mode: Mode; name: string };
type Props = { st: State; res: Resolved; edit: Edit; view: Mode | 'both'; device: Bp; grid: boolean; onFineTune: (tab: Tab, focus?: string) => void };

export function Preview({ st, res, edit, view, device, grid, onFineTune }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);
  const [hover, setHover] = useState<Target | null>(null);
  const [open, setOpen] = useState<Target | null>(null);
  const [, tick] = useState(0);
  const [hint, setHint] = useState(() => { try { return !localStorage.getItem('tk-clicked'); } catch { return true; } });
  useLayoutEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  // overlays follow their element as the page scrolls
  useEffect(() => {
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => tick(x => x + 1)); };
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);

  const modes: Mode[] = view === 'both' ? ['light', 'dark'] : [view];
  const F = FRAME_W[device], gap = 16;
  const zoom = Math.min(1, (w - gap * (modes.length - 1)) / (F * modes.length));

  const find = (e: React.MouseEvent): Target | null => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-t]');
    const root = el?.closest<HTMLElement>('.tks');
    return el && root ? { el, annots: annotations(el.dataset.t ?? ''), mode: root.dataset.mode as Mode, name: nameOf(el) } : null;
  };

  return (
    <div ref={wrap} className="relative">
      <style>{SITE_CSS}</style>
      {hint && (
        <p className="mb-3 flex items-center gap-2 text-[13px] text-ink/60">
          <span className="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: iClick }} />
          Click anything in the site to change it: a button, a heading, a card, the page itself.
        </p>
      )}
      <div className="flex justify-center" style={{ gap }}>
        {modes.map(m => (
          <div key={m} className="min-w-0" style={{ width: F * zoom }}>
            {modes.length > 1 && <p className="mb-1.5 px-1 text-[12px] font-medium text-ink/50">{m === 'light' ? 'Light' : 'Dark'}</p>}
            <div className={`overflow-hidden shadow-[0_24px_50px_-30px_rgba(15,30,55,0.45),0_0_0_1px_rgba(23,25,30,0.08)] ${device === 'mobile' ? 'rounded-[28px]' : 'rounded-[16px]'}`} style={{ zoom } as CSSProperties}>
              <div className={`tks anim bp-${device} cursor-pointer`} data-mode={m} data-t="bg:bg/canvas fg:fg/default" style={canvasVars(res, m, device) as CSSProperties}
                onMouseMove={e => { if (!open) setHover(find(e)); }} onMouseLeave={() => setHover(null)}
                onClick={e => {
                  e.preventDefault();
                  const t = find(e); if (!t) return;
                  setOpen(t); setHover(null);
                  if (hint) { setHint(false); try { localStorage.setItem('tk-clicked', '1'); } catch { /* fine */ } }
                }}>
                <Site name={res.name} bp={device} columns={res.grid[device].columns} />
                {grid && <GridOverlay columns={res.grid[device].columns} />}
              </div>
            </div>
          </div>
        ))}
      </div>
      {hover && !open && <Outline el={hover.el} label={hover.name} />}
      {open && <Outline el={open.el} label={open.name} solid />}
      {open && <EditPopover target={open} st={st} res={res} edit={edit} onClose={() => setOpen(null)} onFineTune={(t, f) => { setOpen(null); onFineTune(t, f); }} />}
    </div>
  );
}

function Outline({ el, label, solid }: { el: HTMLElement; label: string; solid?: boolean }) {
  const r = el.getBoundingClientRect();
  const page = el.matches('.tks');
  return (
    <>
      <div className={`pointer-events-none fixed z-30 rounded-[6px] border-[1.5px] ${solid ? 'border-[#2f6bed] bg-[#2f6bed]/[0.06]' : 'border-dashed border-[#2f6bed]'}`}
        style={{ left: r.left - 2, top: Math.max(r.top - 2, 0), width: r.width + 4, height: Math.min(r.height + 4, window.innerHeight) }} />
      {!page && (
        <span className="pointer-events-none fixed z-30 rounded-[6px] bg-[#2f6bed] px-1.5 py-0.5 text-[11px] font-medium text-white"
          style={{ left: r.left - 2, top: r.top > 26 ? r.top - 24 : r.bottom + 4 }}>{label}</span>
      )}
    </>
  );
}

/* ---------- the popover: just the choices that change the thing you clicked ---------- */

const colourGroup = (t: string) =>
  /brand|focus/.test(t) ? 'brand' : /accent/.test(t) ? 'accent' : (t.match(/success|warning|danger|info/)?.[0] as 'success' | 'warning' | 'danger' | 'info' | undefined) ?? 'neutral';

function EditPopover({ target, st, res, edit, onClose, onFineTune }: { target: Target; st: State; res: Resolved; edit: Edit; onClose: () => void; onFineTune: (t: Tab, f?: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(320);
  useEffect(() => {
    const down = (e: MouseEvent) => {
      const t = e.target as Node;
      if (box.current?.contains(t) || (t instanceof HTMLElement && t.closest('.tks'))) return;
      onClose();
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [onClose]);
  useLayoutEffect(() => { if (box.current) setH(box.current.offsetHeight); });

  const { el, annots, mode, name } = target;
  const kinds: string[] = [];
  for (const a of annots) {
    const k = a.kind === 'bg' || a.kind === 'fg' || a.kind === 'border' ? 'colour' : a.kind === 'pad' || a.kind === 'gap' ? 'space' : a.kind;
    if (!kinds.includes(k)) kinds.push(k);
  }
  const first = (k: string) => annots.find(a => (k === 'colour' ? ['bg', 'fg', 'border'].includes(a.kind) : k === 'space' ? ['pad', 'gap'].includes(a.kind) : a.kind === k));
  const sections: ReactNode[] = [];
  if (el.matches('.logo')) sections.push(
    <Row key="name" label="Product name">
      <input value={st.name} maxLength={24} onChange={e => { const v = e.target.value; edit(s => ({ ...s, name: v }), 'name'); }}
        className="h-9 rounded-[10px] border border-ink/12 bg-white px-2.5 text-[14px] text-ink outline-none focus:border-ink/40" aria-label="Product name" />
    </Row>,
  );
  for (const k of kinds) {
    if (sections.length >= 3) break;
    const a = first(k)!;
    if (k === 'colour') {
      const g = colourGroup(a.token);
      sections.push(
        <div key="c" className="flex flex-col gap-3">
          {g === 'brand' && <Row label="Brand colour"><BrandPicker st={st} edit={edit} /></Row>}
          {g === 'accent' && <Row label="Accent colour"><AccentPicker st={st} edit={edit} /></Row>}
          {(g === 'success' || g === 'warning' || g === 'danger' || g === 'info') && <StatusPicker st={st} edit={edit} which={g} />}
          {g === 'neutral' && <Row label="Greys"><GreysPicker st={st} edit={edit} /></Row>}
          {g === 'neutral' && mode === 'dark' && <Row label="Dark mode"><DarkPicker st={st} edit={edit} /></Row>}
          <button type="button" onClick={() => onFineTune('color', `color/${a.token}`)} className="self-start text-[12px] font-medium text-ink/55 underline decoration-ink/20 underline-offset-4 hover:text-ink">
            Point {a.token} at another shade
          </button>
        </div>,
      );
    } else if (k === 'radius') {
      const which = a.token as keyof State['radius']['map'];
      sections.push(
        <div key="r" className="flex flex-col gap-3">
          <Row label="All corners"><ShapePicker st={st} edit={edit} /></Row>
          {which in st.radius.map && <Row label={`Only ${which}s`}><CornerPicker st={st} res={res} edit={edit} which={which} /></Row>}
        </div>,
      );
    } else if (k === 'text') {
      const s = res.type.styles.find(x => x.id === a.token);
      if (!s) continue;
      const role = s.role === 'heading' ? 'heading' : s.role === 'mono' ? 'mono' : 'body';
      const over = (patch: { weight?: number; step?: number }) => edit(x => ({ ...x, type: { ...x.type, over: { ...x.type.over, [s.id]: { ...x.type.over[s.id], ...patch } } } }), 'quick.over.' + s.id);
      sections.push(
        <div key="t" className="flex flex-col gap-3">
          <Row label={`${s.label} · ${s.desktop.size}px`} hint={<span className="flex items-center rounded-[9px] border border-ink/12 bg-white">
            <button type="button" aria-label="Smaller" onClick={() => over({ step: s.step - 1 })} className="px-2.5 py-0.5 text-[15px] text-ink/60 hover:text-ink">−</button>
            <button type="button" aria-label="Bigger" onClick={() => over({ step: s.step + 1 })} className="px-2.5 py-0.5 text-[15px] text-ink/60 hover:text-ink">+</button>
          </span>}>
            <div className="flex gap-1">
              {weightsOf(s.family).map(wt => (
                <button key={wt} type="button" onClick={() => over({ weight: wt })} aria-pressed={s.weight === wt}
                  className={`flex-1 rounded-[9px] py-1.5 text-[13px] transition-colors ${s.weight === wt ? 'bg-ink text-white' : 'bg-ink/[0.06] text-ink hover:bg-ink/[0.12]'}`} style={{ fontWeight: wt }}>{wt}</button>
              ))}
            </div>
          </Row>
          <Row label={role === 'heading' ? 'Heading font' : role === 'mono' ? 'Code font' : 'Body font'}>
            <Pick label="Font" value={st.type[role]} onChange={v => edit(x => ({ ...x, type: { ...x.type, [role]: v } }), 'quick.font.' + role)}
              options={FONTS.filter(f => (role === 'mono' ? f.cat === 'mono' : role === 'body' ? f.cat !== 'mono' && f.cat !== 'display' : f.cat !== 'mono')).map(f => ({ value: f.name, label: f.name }))} />
          </Row>
        </div>,
      );
    } else if (k === 'shadow') {
      sections.push(<Row key="s" label="Depth"><DepthPicker st={st} edit={edit} /></Row>);
    } else if (k === 'space') {
      sections.push(
        <div key="p" className="flex flex-col gap-2">
          <Row label="Space everywhere"><DensityPicker st={st} edit={edit} /></Row>
          <button type="button" onClick={() => onFineTune('space', `space/${a.token}`)} className="self-start text-[12px] font-medium text-ink/55 underline decoration-ink/20 underline-offset-4 hover:text-ink">
            Change just space/{a.token}
          </button>
        </div>,
      );
    }
  }

  // beside the thing if there's room, else below or above it; never on top of it
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  const W = Math.min(320, vw - 24);
  const clampY = (y: number) => Math.min(Math.max(84, y), vh - h - 12);
  let left: number, top: number;
  if (el.matches('.tks')) { left = vw / 2 - W / 2; top = clampY(vh / 2 - h / 2); }
  else if (r.right + 14 + W < vw - 8) { left = r.right + 14; top = clampY(r.top); }
  else if (r.left - 14 - W > 8) { left = r.left - 14 - W; top = clampY(r.top); }
  else {
    left = Math.min(Math.max(12, r.left + r.width / 2 - W / 2), vw - W - 12);
    top = r.bottom + 10 + h < vh ? r.bottom + 10 : Math.max(84, r.top - h - 10);
  }

  return (
    <div ref={box} role="dialog" aria-label={`Change ${name}`} className="tk-fade fixed z-[45] flex max-h-[min(560px,calc(100svh-100px))] flex-col overflow-hidden rounded-[18px] bg-[#f7f6f2] shadow-[0_24px_60px_-20px_rgba(15,30,55,0.55),0_0_0_1px_rgba(23,25,30,0.08)]"
      style={{ left, top, width: W }}>
      <header className="flex items-center justify-between gap-2 border-b border-ink/[0.07] px-4 py-2.5">
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-semibold text-ink">{name}</span>
          <span className="block truncate font-mono text-[10.5px] text-ink/45">{[...new Set(annots.map(a => a.token))].slice(0, 4).join(' · ')}</span>
        </span>
        <button type="button" onClick={onClose} aria-label="Close" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink/50 hover:bg-ink/[0.06] hover:text-ink">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>
      <div className="flex flex-col gap-4 overflow-y-auto overscroll-contain p-4">
        {sections.length ? sections : <p className="text-[13px] text-ink/60">Nothing to change here.</p>}
      </div>
    </div>
  );
}
