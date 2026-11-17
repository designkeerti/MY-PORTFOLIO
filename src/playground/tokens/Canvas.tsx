import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { canvasVars, familyCss, shadowCss, type Bp, type Level, type Mode, type Resolved } from './model';
import { GridOverlay, SITE_CSS, Site, annotations, type Annot } from './Site';

/**
 * View one: the sample site in a browser frame (or two, light beside dark), scaled to fit.
 * With the inspector on, hovering anything names the tokens it's built from, and clicking
 * opens that token in the editor.
 */

export const FRAME_W: Record<Bp, number> = { mobile: 390, tablet: 834, desktop: 1440 };

type Props = {
  res: Resolved; view: Mode | 'both'; device: Bp; grid: boolean; inspect: boolean;
  onPick: (a: Annot) => void;
};

export function Canvas({ res, view, device, grid, inspect, onPick }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(900);
  const [hover, setHover] = useState<{ rect: DOMRect; annots: Annot[]; mode: Mode } | null>(null);
  useLayoutEffect(() => {
    const el = scroller.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { if (!inspect) setHover(null); }, [inspect]);

  const modes: Mode[] = view === 'both' ? ['light', 'dark'] : [view];
  const F = FRAME_W[device], gap = 20, pad = 24;
  const zoom = Math.min(1, (w - pad * 2 - gap * (modes.length - 1)) / (F * modes.length));

  const target = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-t]');
    const root = el?.closest<HTMLElement>('.tks');
    return el && root ? { el, mode: root.dataset.mode as Mode } : null;
  };
  const onMove = (e: React.MouseEvent) => {
    if (!inspect) return;
    const t = target(e);
    if (!t) { setHover(null); return; }
    setHover({ rect: t.el.getBoundingClientRect(), annots: annotations(t.el.dataset.t ?? ''), mode: t.mode });
  };
  const onClick = (e: React.MouseEvent) => {
    if (!inspect) return;
    e.preventDefault();
    const t = target(e);
    const a = t && annotations(t.el.dataset.t ?? '')[0];
    if (a) onPick(a);
  };

  const box = stage.current?.getBoundingClientRect();
  return (
    <div ref={stage} className="relative h-full min-h-0">
      <style>{SITE_CSS}</style>
      <div ref={scroller} onMouseMove={onMove} onMouseLeave={() => setHover(null)} onClickCapture={onClick} onScroll={() => setHover(null)}
        className={`h-full overflow-auto overscroll-contain ${inspect ? 'cursor-crosshair' : ''}`}
        style={{ backgroundImage: 'radial-gradient(rgba(23,25,30,.13) 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
        <div className="flex min-w-min justify-center" style={{ gap, padding: pad }}>
          {modes.map(m => (
            <div key={m} className="shrink-0" style={{ width: F * zoom }}>
              <p className="mb-2 flex items-center gap-2 px-1 text-[12px] font-medium text-ink/55">
                <span className="h-2.5 w-2.5 rounded-full border border-ink/25" style={{ background: res.semantic[m]['bg/canvas'].hex }} />
                {m === 'light' ? 'Light' : 'Dark'} · {F}px
              </p>
              <div className="overflow-hidden rounded-[14px] shadow-[0_30px_60px_-30px_rgba(15,30,55,0.45),0_0_0_1px_rgba(23,25,30,0.08)]" style={{ zoom } as CSSProperties}>
                <Chrome mode={m} res={res} device={device} />
                <div className={`tks anim bp-${device}`} data-mode={m} style={canvasVars(res, m, device) as CSSProperties}>
                  <Site name={res.name} bp={device} columns={res.grid[device].columns} />
                  {grid && <GridOverlay columns={res.grid[device].columns} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {inspect && hover && box && <Inspector res={res} hover={hover} box={box} device={device} />}
    </div>
  );
}

/** a browser's top bar, or a phone's status bar */
function Chrome({ mode, res, device }: { mode: Mode; res: Resolved; device: Bp }) {
  const dark = mode === 'dark';
  const bg = dark ? '#1f2126' : '#eceef1', fg = dark ? 'rgba(255,255,255,.55)' : 'rgba(23,25,30,.5)';
  const host = (res.name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'tokens') + '.app';
  if (device === 'mobile') return (
    <div className="flex items-center justify-between px-6 pb-1.5 pt-3 text-[13px] font-semibold" style={{ background: res.semantic[mode]['bg/canvas'].hex, color: res.semantic[mode]['fg/default'].hex }}>
      <span>9:41</span><span className="h-[22px] w-[90px] rounded-full bg-black" /><span className="flex gap-1"><span className="h-2.5 w-4 rounded-[3px] border border-current" /></span>
    </div>
  );
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5" style={{ background: bg }}>
      <span className="flex gap-1.5">{['#ff5f57', '#febc2e', '#28c840'].map(c => <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />)}</span>
      <span className="mx-auto flex h-7 w-[min(420px,60%)] items-center justify-center rounded-[8px] text-[12.5px]" style={{ background: dark ? '#2b2e34' : '#fff', color: fg }}>{host}</span>
      <span className="w-[54px]" />
    </div>
  );
}

const KIND: Record<string, string> = { bg: 'Fill', fg: 'Text', border: 'Border', radius: 'Radius', pad: 'Padding', gap: 'Gap', shadow: 'Shadow', text: 'Type' };

/** the tokens behind whatever is under the pointer */
function Inspector({ res, hover, box, device }: { res: Resolved; hover: { rect: DOMRect; annots: Annot[]; mode: Mode }; box: DOMRect; device: Bp }) {
  const r = hover.rect;
  const left = r.left - box.left, top = r.top - box.top;
  const below = top + r.height + 200 < box.height;
  const tipTop = below ? top + r.height + 8 : Math.max(8, top - 8);
  const tipLeft = Math.min(Math.max(8, left), box.width - 290);
  const seen = new Set<string>();
  const rows = hover.annots.filter(a => { const k = a.kind + a.token; if (seen.has(k)) return false; seen.add(k); return true; });
  return (
    <>
      <div className="pointer-events-none absolute z-30 rounded-[4px] border-[1.5px] border-[#ff2d6f] bg-[#ff2d6f]/[0.06] transition-all duration-100" style={{ left, top, width: r.width, height: r.height }} />
      <div className="pointer-events-none absolute z-40 w-[280px] rounded-[14px] bg-[#17191e] p-3 text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,0.6)]"
        style={{ left: tipLeft, top: tipTop, transform: below ? undefined : 'translateY(-100%)' }}>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">{hover.mode === 'light' ? 'Light' : 'Dark'} · click to edit</p>
        <ul className="flex flex-col gap-1.5">
          {rows.map(a => <Row key={a.kind + a.token} a={a} res={res} mode={hover.mode} device={device} />)}
        </ul>
      </div>
    </>
  );
}

function Row({ a, res, mode, device }: { a: Annot; res: Resolved; mode: Mode; device: Bp }) {
  let name = a.token, value = '', swatch: CSSProperties | null = null;
  if (a.kind === 'bg' || a.kind === 'fg' || a.kind === 'border') {
    const s = res.semantic[mode][a.token];
    if (!s) return null;
    name = `color/${a.token}`; value = `${s.ref.replace('.', ' ')} · ${s.hex}`; swatch = { background: s.hex };
  } else if (a.kind === 'radius') {
    const s = res.radius.sem[a.token as keyof Resolved['radius']['sem']]; if (!s) return null;
    name = `radius/${a.token}`; value = `${s.ref} · ${s.ref === 'full' ? 'full' : s.px + 'px'}`;
  } else if (a.kind === 'pad' || a.kind === 'gap') {
    const s = res.space.sem[a.token as keyof Resolved['space']['sem']]; if (!s) return null;
    name = `space/${a.token}`; value = `space/${s.ref} · ${s.px}px`;
  } else if (a.kind === 'shadow') {
    name = `shadow/${a.token}`; swatch = { background: '#fff', boxShadow: shadowCss(res.shadow[mode][a.token as Level] ?? []) };
    value = `${res.shadow[mode][a.token as Level]?.length ?? 0} layers`;
  } else if (a.kind === 'text') {
    const s = res.type.styles.find(x => x.id === a.token); if (!s) return null;
    const m = device === 'mobile' ? s.mobile : s.desktop;
    name = `text/${a.token}`; value = `${m.size}/${m.lh} · ${s.weight} · ${s.family}`;
  }
  return (
    <li className="flex items-center gap-2">
      <span className="w-[52px] shrink-0 text-[11px] text-white/45">{KIND[a.kind] ?? a.kind}</span>
      {swatch && <span className="h-3.5 w-3.5 shrink-0 rounded-[4px] border border-white/20" style={swatch} />}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-[12px]">{name}</span>
        <span className="block truncate text-[11px] text-white/55" style={a.kind === 'text' ? { fontFamily: familyCss(res.type.styles.find(x => x.id === a.token)?.family ?? '') } : undefined}>{value}</span>
      </span>
    </li>
  );
}
