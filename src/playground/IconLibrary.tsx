import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Button, ColorField, Segmented, Slider, useCopy, useToast } from './ui';
import { ICONS, PALETTES, type IconDef } from './icons/set';
import { ICON_CSS } from './icons/motion';
import { STYLES, iconSvg, paletteFrom, type IconOpts, type IconStyle } from './icons/render';

/**
 * An animated icon library: every icon drawn once and shown in six styles, each with its own
 * motion. Hover (or, on touch screens, just look) to see them move; pick one to copy or
 * download it as an SVG, still or animated (the animation travels inside the file).
 */

type Motion = 'hover' | 'loop' | 'off';
type ColourMode = 'own' | 'mine';

const Svg = ({ html, className = '' }: { html: string; className?: string }) => (
  <span aria-hidden className={`flex items-center justify-center [&>svg]:block [&>svg]:h-auto [&>svg]:max-w-full ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
);

export function IconLibrary() {
  const touch = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches, []);
  const [style, setStyle] = useState<IconStyle>('graphical');
  const [query, setQuery] = useState('');
  const [stroke, setStroke] = useState(1.6);
  const [color, setColor] = useState('#17191e');
  const [accent, setAccent] = useState('#2c8bc6');
  const [mode, setMode] = useState<ColourMode>('own');
  const [motion, setMotion] = useState<Motion>(touch ? 'loop' : 'hover');
  const [hovered, setHovered] = useState<string | null>(null);
  const [sel, setSel] = useState('bell');
  const [exportSize, setExportSize] = useState('48');
  const copy = useCopy();
  const toast = useToast();
  const detailRef = useRef<HTMLDivElement>(null);

  const colourful = style === 'graphical' || style === 'glass' || style === 'isometric';
  const opts = (uid: string, play: boolean, extra: Partial<IconOpts> = {}): IconOpts =>
    ({ stroke, color, accent, palette: mode === 'mine' ? paletteFrom(accent) : null, uid, play, ...extra });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ICONS.filter(i => i.name.toLowerCase().includes(q) || i.tags.some(t => t.includes(q))) : ICONS;
  }, [query]);
  const icon = ICONS.find(i => i.id === sel) ?? ICONS[0];

  // on phones the detail sits under the grid: bring it into view
  const pick = (id: string) => {
    setSel(id);
    if (window.matchMedia('(max-width: 1023px)').matches) detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const exportSvg = (animated: boolean) =>
    iconSvg(icon, style, opts(`ic-${icon.id}`, animated, { css: animated, size: parseInt(exportSize, 10) }));
  const download = () => {
    const blob = new Blob([exportSvg(true)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${icon.id}-${style}.svg`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Downloaded');
  };

  const cellSize = style === 'isometric' ? 80 : 48;
  const playing = (id: string) => motion === 'loop' || (motion === 'hover' && hovered === id);

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-4 md:gap-5 md:px-6">
      <style>{ICON_CSS}</style>

      {/* style: each choice shows the bell in that style */}
      <Panel className="p-2">
        <div role="radiogroup" aria-label="Style" className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {STYLES.map(s => (
            <button key={s.value} type="button" role="radio" aria-checked={style === s.value} onClick={() => setStyle(s.value)}
              onPointerEnter={() => setHovered('style-' + s.value)} onPointerLeave={() => setHovered(null)}
              className={`group flex flex-col items-center gap-1.5 rounded-[16px] px-2 pb-2.5 pt-3 transition-colors ${style === s.value ? 'bg-ink text-white' : 'text-ink/75 hover:bg-white'}`}>
              <Svg className="h-10" html={iconSvg(ICONS[2], s.value, opts(`st-${s.value}`, motion !== 'off' && (motion === 'loop' || hovered === 'style-' + s.value || style === s.value), {
                size: s.value === 'isometric' ? 50 : 32,
                // on the dark chip the one-colour styles turn white
                ...(style === s.value && (s.value === 'regular' || s.value === 'duotone' || s.value === 'filled') ? { color: '#ffffff' } : {}),
              }))} />
              <span className="text-[13px] font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-5">
        {/* the grid */}
        <div className="flex flex-col gap-4">
          <Panel className="flex flex-wrap items-end gap-x-6 gap-y-4 p-4">
            <label className="flex min-w-[180px] flex-1 flex-col gap-1.5">
              <span className="pg-label">Search</span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder={`${ICONS.length} icons: bell, mail, rocket…`} spellCheck={false}
                className="rounded-[14px] border border-ink/14 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink/35" />
            </label>
            <Segmented label="Motion" value={motion} onChange={setMotion}
              options={[{ value: 'hover', label: touch ? 'On tap' : 'On hover' }, { value: 'loop', label: 'Always' }, { value: 'off', label: 'Still' }]} />
          </Panel>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
            {shown.map(i => (
              <Cell key={i.id} icon={i} selected={i.id === sel} onPick={() => pick(i.id)}
                onHover={on => setHovered(on ? i.id : null)}
                html={iconSvg(i, style, opts(`g-${i.id}`, motion !== 'off' && playing(i.id), { size: cellSize }))} />
            ))}
            {!shown.length && <p className="col-span-full py-10 text-center text-[15px] text-ink/55">Nothing called “{query}” yet.</p>}
          </div>
        </div>

        {/* the selected icon, its settings and the export */}
        <div ref={detailRef} className="scroll-mt-24">
          <Panel className="flex flex-col gap-5 p-5 lg:sticky lg:top-24">
            <div className={`relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[18px] ${colourful ? 'bg-[radial-gradient(120%_90%_at_30%_10%,#ffffff,#e8eef5)]' : 'bg-white'}`}>
              <Svg key={`${icon.id}-${style}`} html={iconSvg(icon, style, opts(`d-${icon.id}`, motion !== 'off', { size: style === 'isometric' ? 220 : 132 }))} />
              <span className="absolute bottom-3 left-4 text-[12px] font-medium uppercase tracking-[0.2em] text-ink/40">{STYLES.find(s => s.value === style)!.note}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-[20px] font-semibold tracking-[-0.01em]">{icon.name}</p>
                <p className="mt-0.5 text-[13px] text-ink/50">{icon.tags.join(', ')}</p>
              </div>
              <button type="button" onClick={() => copy(icon.id, 'Name')} className="font-mono text-[12px] text-ink/45 hover:text-ink">{icon.id}</button>
            </div>

            {/* the same icon in every style */}
            <div className="grid grid-cols-6 gap-1 rounded-[14px] bg-white/70 p-1">
              {STYLES.map(s => (
                <button key={s.value} type="button" title={s.label} onClick={() => setStyle(s.value)} aria-pressed={style === s.value}
                  className={`flex aspect-square items-center justify-center rounded-[10px] transition-colors ${style === s.value ? 'bg-white shadow-[0_2px_10px_-4px_rgba(15,30,55,0.35)]' : 'hover:bg-white/70'}`}>
                  <Svg html={iconSvg(icon, s.value, opts(`m-${s.value}`, false, { size: s.value === 'isometric' ? 34 : 22 }))} />
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {!colourful && <Slider label="Stroke" min={1} max={2.4} step={0.1} value={stroke} onChange={setStroke} />}
              {!colourful && (
                <div className="grid grid-cols-2 gap-3">
                  <ColorField label="Colour" value={color} onChange={setColor} />
                  <ColorField label="Accent" value={accent} onChange={setAccent} />
                </div>
              )}
              {colourful && (
                <>
                  <Segmented label="Colours" value={mode} onChange={setMode} options={[{ value: 'own', label: 'Each its own' }, { value: 'mine', label: 'One colour' }]} />
                  {mode === 'mine'
                    ? <ColorField label="Colour" value={accent} onChange={setAccent} />
                    : <div className="flex gap-1.5">{PALETTES.map(p => <span key={p.name} title={p.name} className="h-5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${p.light}, ${p.base}, ${p.dark})` }} />)}</div>}
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-ink/10 pt-4">
              <Segmented label="Export size" value={exportSize} onChange={setExportSize}
                options={['24', '32', '48', '64', '128'].map(v => ({ value: v, label: `${v}px` }))} />
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => copy(exportSvg(true), 'Animated SVG')}>Copy animated</Button>
                <Button variant="ghost" onClick={() => copy(exportSvg(false), 'SVG')}>Copy still</Button>
              </div>
              <Button variant="ghost" onClick={download}>Download .svg</Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Cell({ icon, html, selected, onPick, onHover }: { icon: IconDef; html: string; selected: boolean; onPick: () => void; onHover: (on: boolean) => void }) {
  // a touch shows the motion too: play for a moment after a tap
  const [tapped, setTapped] = useState(false);
  useEffect(() => { if (!tapped) return; const t = setTimeout(() => { setTapped(false); onHover(false); }, 2400); return () => clearTimeout(t); }, [tapped, onHover]);
  return (
    <button type="button" onClick={() => { onPick(); setTapped(true); onHover(true); }} aria-pressed={selected} aria-label={icon.name}
      onPointerEnter={e => e.pointerType === 'mouse' && onHover(true)} onPointerLeave={e => e.pointerType === 'mouse' && onHover(false)}
      className={`cs-glass group flex aspect-square flex-col items-center justify-center gap-2 rounded-[18px] p-2 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 ${selected ? 'ring-2 ring-ink ring-offset-2 ring-offset-[#f7f6f2]' : ''}`}>
      <Svg html={html} className="h-[64%] w-full" />
      <span className="max-w-full truncate text-[12px] font-medium text-ink/60 group-hover:text-ink">{icon.name}</span>
    </button>
  );
}
