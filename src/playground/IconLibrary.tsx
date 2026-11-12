import { Suspense, lazy, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Button, ColorField, Segmented, useCopy, useToast } from './ui';
import { ICON_CSS } from './icons/motion';
import { CATEGORIES, loadCategory, loadIndex, search, type IconMeta } from './icons/data';
import { CATEGORY_HUES, COLOURFUL, STYLES, iconSvg, paletteFrom, type Geo, type IconOpts, type IconStyle, type Palette } from './icons/render';
import type { Icon3DHandle, Material3D } from './icons/Icon3D';

const Icon3D = lazy(() => import('./icons/Icon3D'));
const MATERIALS: { value: Material3D; label: string }[] = [
  { value: 'glossy', label: 'Glossy' }, { value: 'clay', label: 'Clay' }, { value: 'glass', label: 'Glass' }, { value: 'metal', label: 'Metal' },
];

/**
 * An animated icon library: Phosphor's 1,500 drawings in seven styles, each icon with a motion
 * that suits what it is. Hover (or tap) to see one move; pick one to copy or download it as an
 * SVG, still or animated (the animation travels inside the file), or as a PNG from real 3D.
 */

type Motion = 'hover' | 'loop' | 'off';
type ColourMode = 'one' | 'category';
const PAGE = 96;

const Svg = ({ html, className = '' }: { html: string; className?: string }) => (
  <span aria-hidden className={`flex items-center justify-center [&>svg]:block [&>svg]:h-auto [&>svg]:max-w-full ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
);

const save = (href: string, name: string) => { const a = document.createElement('a'); a.href = href; a.download = name; a.click(); };
const fmt = (n: number) => n.toLocaleString('en');

export function IconLibrary() {
  const touch = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches, []);
  const still = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const [icons, setIcons] = useState<IconMeta[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [geo, setGeo] = useState<Record<string, Geo>>({});
  const [style, setStyle] = useState<IconStyle>('graphical');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [ink, setInk] = useState('#17191e');
  const [accent, setAccent] = useState('#2f6bed');
  const [mode, setMode] = useState<ColourMode>('one');
  const [motion, setMotion] = useState<Motion>(touch ? 'loop' : 'hover');
  const [sel, setSel] = useState('bell');
  const [exportSize, setExportSize] = useState('48');
  const [pngSize, setPngSize] = useState('1024');
  const [material, setMaterial] = useState<Material3D>('glossy');
  const [limit, setLimit] = useState(PAGE);
  const copy = useCopy();
  const toast = useToast();
  const detailRef = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLDivElement>(null);
  const three = useRef<Icon3DHandle>(null);

  useEffect(() => { loadIndex().then(setIcons, () => setFailed(true)); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    icons?.forEach(i => i.cats.forEach(k => { c[k] = (c[k] ?? 0) + 1; }));
    return c;
  }, [icons]);
  const shown = useMemo(() => icons ? search(cat === 'all' ? icons : icons.filter(i => i.cats.includes(cat)), query) : [], [icons, cat, query]);
  const visible = shown.slice(0, limit);
  const icon = icons?.find(i => i.name === sel) ?? null;

  useEffect(() => { setLimit(PAGE); }, [cat, query]);

  // drawings for what is on screen, a category file at a time
  const need = useMemo(() => [...new Set([...visible, ...(icon ? [icon] : [])].map(i => i.cats[0]))].sort().join(','), [visible, icon]);
  const loaded = useRef(new Set<string>());
  useEffect(() => {
    need.split(',').filter(c => c && !loaded.current.has(c)).forEach(c => {
      loaded.current.add(c);
      loadCategory(c).then(g => setGeo(prev => ({ ...prev, ...g })), () => loaded.current.delete(c));
    });
  }, [need]);

  // the next page when the end of the grid comes into view
  useEffect(() => {
    const el = more.current; if (!el) return;
    const io = new IntersectionObserver(e => { if (e[0].isIntersecting) setLimit(l => l + PAGE); }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [limit, shown.length]);

  const palettes = useRef(new Map<string, Palette>());
  const paletteOf = (i: IconMeta) => {
    const hex = mode === 'category' ? CATEGORY_HUES[i.cats[0]] ?? accent : accent;
    let p = palettes.current.get(hex);
    if (!p) { p = paletteFrom(hex); palettes.current.set(hex, p); }
    return p;
  };
  const opts = (i: IconMeta, uid: string, play: boolean, extra: Partial<IconOpts> = {}): IconOpts => {
    const palette = paletteOf(i);
    return { color: ink, accent: mode === 'category' ? palette.base : accent, palette, uid, play, ...extra };
  };

  const pick = (name: string) => {
    setSel(name);
    // on phones the detail sits under the grid: bring it into view
    if (window.matchMedia('(max-width: 1023px)').matches) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const g = icon ? geo[icon.name] : undefined;
  const exportSvg = (animated: boolean) => icon && g ? iconSvg(icon, g, style, opts(icon, `ic-${icon.name}`, animated, { css: animated, size: parseInt(exportSize, 10) })) : '';
  const downloadSvg = () => {
    const url = URL.createObjectURL(new Blob([exportSvg(true)], { type: 'image/svg+xml' }));
    save(url, `${sel}-${style}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Downloaded');
  };
  const downloadPng = () => {
    const url = three.current?.png(parseInt(pngSize, 10));
    if (!url) return;
    save(url, `${sel}-3d-${material}.png`);
    toast('Downloaded');
  };

  const colourful = COLOURFUL.has(style);
  const big = style === 'isometric' || style === '3d';

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-4 md:gap-5 md:px-6">
      <style>{ICON_CSS}</style>

      {/* style: each choice shows the selected icon in that style */}
      <Panel className="p-2">
        <div role="radiogroup" aria-label="Style" className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {STYLES.map(s => (
            <button key={s.value} type="button" role="radio" aria-checked={style === s.value} onClick={() => setStyle(s.value)}
              className={`flex flex-col items-center gap-1.5 rounded-[16px] px-2 pb-2.5 pt-3 transition-colors ${style === s.value ? 'bg-ink text-white' : 'text-ink/75 hover:bg-white'}`}>
              {icon && g
                ? <Svg className="h-10" html={iconSvg(icon, g, s.value, opts(icon, `st-${s.value}`, motion !== 'off' && style === s.value, {
                  size: s.value === 'isometric' ? 50 : s.value === '3d' ? 36 : 32,
                  // on the dark chip the one-colour styles turn white
                  ...(style === s.value && !COLOURFUL.has(s.value) ? { color: '#ffffff' } : {}),
                }))} />
                : <span className="h-10" />}
              <span className="text-[13px] font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-5">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="flex min-w-0 flex-col gap-4 p-4">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
              <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                <span className="pg-label">Search</span>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder={icons ? `${fmt(icons.length)} icons: bell, chart, rocket…` : 'Loading icons…'} spellCheck={false}
                  type="search" className="rounded-[14px] border border-ink/14 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink/35 focus:border-ink/35" />
              </label>
              <Segmented label="Motion" value={motion} onChange={setMotion}
                options={[{ value: 'hover', label: touch ? 'On tap' : 'On hover' }, { value: 'loop', label: 'Always' }, { value: 'off', label: 'Still' }]} />
            </div>
            {/* categories: one scrolling row */}
            <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-1.5">
                {[{ value: 'all', label: 'All' }, ...CATEGORIES].map(c => (
                  <button key={c.value} type="button" onClick={() => setCat(c.value)} aria-pressed={cat === c.value}
                    className={`flex items-baseline gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${cat === c.value ? 'border-ink bg-ink text-white' : 'border-ink/12 bg-white text-ink/70 hover:border-ink/30'}`}>
                    {c.label}
                    <span className={`text-[11px] tabular-nums ${cat === c.value ? 'text-white/55' : 'text-ink/35'}`}>{icons ? fmt(c.value === 'all' ? icons.length : counts[c.value] ?? 0) : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          <div className={`grid gap-2 ${big ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6' : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8'}`}>
            {visible.map(i => (
              <Cell key={i.name} icon={i} geo={geo[i.name]} style={style} motion={motion} selected={i.name === sel} onPick={pick}
                opts={opts(i, `g-${i.name}`, false, { size: style === 'isometric' ? 84 : style === '3d' ? 56 : 40 })} />
            ))}
            {!icons && !failed && Array.from({ length: 24 }, (_, k) => <div key={k} className="cs-glass aspect-square animate-pulse rounded-[16px]" />)}
            {failed && <p className="col-span-full py-10 text-center text-[15px] text-ink/55">The icons didn’t load. Refresh to try again.</p>}
            {icons && !shown.length && <p className="col-span-full py-10 text-center text-[15px] text-ink/55">Nothing matches “{query}”{cat !== 'all' ? ' here; try All' : ''}.</p>}
          </div>
          {visible.length < shown.length && <div ref={more} className="py-6 text-center text-[13px] text-ink/40">{fmt(shown.length - visible.length)} more</div>}
        </div>

        {/* the selected icon, its colours and the export */}
        <div ref={detailRef} className="min-w-0 scroll-mt-24">
          <Panel className="flex flex-col gap-5 p-5 lg:sticky lg:top-24">
            <div className={`relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[18px] ${colourful ? 'bg-[radial-gradient(120%_90%_at_30%_10%,#ffffff,#e9eef4)]' : 'bg-white'}`}>
              {icon && g && style === '3d' && (
                <Suspense fallback={<Svg html={iconSvg(icon, g, style, opts(icon, `d-${icon.name}`, false, { size: 150 }))} />}>
                  <Icon3D ref={three} solid={g.solid} color={paletteOf(icon).base} material={material} spin={motion !== 'off' && !still} className="absolute inset-0" />
                </Suspense>
              )}
              {icon && g && style !== '3d' && (
                <Svg key={`${icon.name}-${style}`} html={iconSvg(icon, g, style, opts(icon, `d-${icon.name}`, motion !== 'off', { size: style === 'isometric' ? 230 : 136 }))} />
              )}
              <span className="pointer-events-none absolute bottom-3 left-4 text-[11px] font-medium uppercase tracking-[0.2em] text-ink/40">
                {style === '3d' ? (touch ? 'Drag to turn' : 'Drag to turn it') : STYLES.find(s => s.value === style)!.note}
              </span>
            </div>
            {style === '3d' && <Segmented label="Material" value={material} onChange={setMaterial} options={MATERIALS} />}

            {icon && (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[20px] font-semibold tracking-[-0.01em]">{icon.name.replace(/-/g, ' ')}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-ink/50">
                    {icon.cats.map(c => CATEGORIES.find(k => k.value === c)?.label).filter(Boolean).join(' · ')}
                    {icon.tags.length ? ` — ${icon.tags.slice(0, 6).join(', ')}` : ''}
                  </p>
                </div>
                <button type="button" onClick={() => copy(icon.name, 'Name')} title="Copy the name" className="shrink-0 pt-1.5 font-mono text-[12px] text-ink/45 hover:text-ink">{icon.name}</button>
              </div>
            )}

            {/* the same icon in every style */}
            <div className="grid grid-cols-7 gap-1 rounded-[14px] bg-white/70 p-1">
              {STYLES.map(s => (
                <button key={s.value} type="button" title={s.label} onClick={() => setStyle(s.value)} aria-pressed={style === s.value}
                  className={`flex aspect-square items-center justify-center rounded-[10px] transition-colors ${style === s.value ? 'bg-white shadow-[0_2px_10px_-4px_rgba(15,30,55,0.35)]' : 'hover:bg-white/70'}`}>
                  {icon && g && <Svg html={iconSvg(icon, g, s.value, opts(icon, `m-${s.value}`, false, { size: s.value === 'isometric' ? 36 : s.value === '3d' ? 26 : 22 }))} />}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {colourful ? (
                <>
                  <Segmented label="Colour" value={mode} onChange={setMode} options={[{ value: 'one', label: 'One colour' }, { value: 'category', label: 'By category' }]} />
                  {mode === 'one' && <ColorField label="Colour" value={accent} onChange={setAccent} />}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <ColorField label="Ink" value={ink} onChange={setInk} />
                  {style === 'duotone' && <ColorField label="Tone" value={accent} onChange={setAccent} />}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-ink/10 pt-4">
              {style === '3d' ? (
                <>
                  <Segmented label="PNG size" value={pngSize} onChange={setPngSize} options={['512', '1024', '2048'].map(v => ({ value: v, label: `${v}px` }))} />
                  <Button onClick={downloadPng}>Download .png</Button>
                  <Button variant="ghost" onClick={() => copy(exportSvg(true), 'Animated SVG')}>Copy as SVG</Button>
                </>
              ) : (
                <>
                  <Segmented label="Export size" value={exportSize} onChange={setExportSize}
                    options={['24', '32', '48', '64', '128'].map(v => ({ value: v, label: `${v}px` }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => copy(exportSvg(true), 'Animated SVG')}>Copy animated</Button>
                    <Button variant="ghost" onClick={() => copy(exportSvg(false), 'SVG')}>Copy still</Button>
                  </div>
                  <Button variant="ghost" onClick={downloadSvg}>Download .svg</Button>
                </>
              )}
            </div>
            <p className="text-[12px] leading-relaxed text-ink/45">
              Drawings from <a href="https://phosphoricons.com" target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-ink">Phosphor Icons</a>,
              {' '}<a href="/icons/PHOSPHOR-LICENSE.txt" target="_blank" rel="noreferrer" className="underline decoration-ink/20 underline-offset-2 hover:text-ink">MIT licence</a>. Styles and motion made here.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

type CellProps = { icon: IconMeta; geo?: Geo; style: IconStyle; motion: Motion; selected: boolean; onPick: (name: string) => void; opts: IconOpts };

const Cell = memo(function Cell({ icon, geo, style, motion, selected, onPick, opts }: CellProps) {
  const [hover, setHover] = useState(false);
  // a touch shows the motion too: play for a moment after a tap
  const [tapped, setTapped] = useState(false);
  useEffect(() => { if (!tapped) return; const t = setTimeout(() => setTapped(false), 2400); return () => clearTimeout(t); }, [tapped]);
  const play = motion === 'loop' || (motion === 'hover' && (hover || tapped));
  const { color, accent, palette, size } = opts;
  const html = useMemo(() => geo ? iconSvg(icon, geo, style, { ...opts, play }) : '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [icon, geo, style, play, color, accent, palette, size]);
  return (
    <button type="button" onClick={() => { onPick(icon.name); setTapped(true); }} aria-pressed={selected} aria-label={icon.name.replace(/-/g, ' ')} title={icon.name}
      onPointerEnter={e => e.pointerType === 'mouse' && setHover(true)} onPointerLeave={e => e.pointerType === 'mouse' && setHover(false)}
      className={`cs-glass group flex aspect-square min-w-0 flex-col items-center justify-center gap-1.5 rounded-[16px] p-2 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 ${selected ? 'ring-2 ring-ink ring-offset-2 ring-offset-[#f7f6f2]' : ''}`}>
      {html ? <Svg html={html} className="h-[62%] w-full" /> : <span className="h-[62%]" />}
      <span className="max-w-full truncate text-[11px] font-medium text-ink/50 group-hover:text-ink">{icon.name}</span>
    </button>
  );
});
