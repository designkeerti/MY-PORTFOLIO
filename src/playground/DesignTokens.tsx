import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { fontByName, loadFont } from './data';
import { useToast } from './ui';
import { PRESETS, flat, resolve, shuffle, withPreset, type Bp, type Mode } from './tokens/model';
import { decodeState, encodeState, loadSaved, useAutosave, useDeltas, useHistory } from './tokens/hooks';
import { Editor, type Tab } from './tokens/Editor';
import { Canvas } from './tokens/Canvas';
import { Outline } from './tokens/Outline';
import { ExportPanel } from './tokens/ExportPanel';
import type { Annot } from './tokens/Site';

/**
 * Design Tokens: build a whole system (colour, type, spacing, radius, depth, grids) and
 * watch it work. View one is a real website made only from the tokens; view two lays the
 * tokens out as a spec, a view per group. Both move as you change anything.
 */

const KIND_TAB: Record<string, [Tab, (t: string) => string]> = {
  bg: ['color', t => `color/${t}`], fg: ['color', t => `color/${t}`], border: ['color', t => `color/${t}`],
  text: ['type', t => `text/${t}`], pad: ['space', t => `space/${t}`], gap: ['space', t => `space/${t}`],
  radius: ['radius', t => `radius/${t}`], shadow: ['depth', t => `shadow/${t}`],
};

export function DesignTokens() {
  const { st, edit, undo, redo, canUndo, canRedo } = useHistory(loadSaved);
  useAutosave(st);
  const toast = useToast();
  const res = useMemo(() => resolve(st), [st]);
  const flatNow = useMemo(() => flat(res), [res]);
  const deltas = useDeltas(flatNow);

  const [view, setView] = useState<'canvas' | 'outline'>('canvas');
  const [mode, setMode] = useState<Mode | 'both'>('light');
  const [device, setDevice] = useState<Bp>(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'mobile' : 'desktop'));
  const [grid, setGrid] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [tab, setTab] = useState<Tab>('color');
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [presets, setPresets] = useState(false);

  // a shared link carries a whole system: open it on arrival, or when one is pasted in
  const applied = useRef('');
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const apply = () => {
      const m = location.hash.match(/^#t=([\w-]+)/);
      if (!m || applied.current === m[1]) return;
      applied.current = m[1];
      decodeState(m[1]).then(s => {
        history.replaceState(null, '', location.pathname + location.search);
        if (!s) { toast('That link didn’t open'); return; }
        edit(() => s); toast(`Opened ${s.name}`);
        // a link is for the tool, so go straight to it (once the page has settled)
        let tries = 0;
        const go = () => {
          const el = root.current; if (!el) return;
          const top = el.getBoundingClientRect().top + window.scrollY - 92;
          window.scrollTo({ top });
          if (Math.abs(window.scrollY - top) > 4 && ++tries < 20) setTimeout(go, 150);
        };
        setTimeout(go, 250);
      });
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, [edit, toast]);

  useEffect(() => {
    for (const n of [st.type.heading, st.type.body, st.type.mono]) { const f = fontByName(n); if (f) loadFont(f); }
  }, [st.type.heading, st.type.body, st.type.mono]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      const el = e.target as HTMLElement;
      if (el.closest('input:not([type=range]):not([type=color]), textarea, select')) return;
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [undo, redo]);

  const onPick = useCallback((a: Annot) => {
    const k = KIND_TAB[a.kind]; if (!k) return;
    setTab(k[0]); setFocus({ id: k[1](a.token), n: Date.now() });
  }, []);

  const share = async () => {
    const code = await encodeState(st);
    const url = `${location.origin}${location.pathname}#t=${code}`;
    try { await navigator.clipboard.writeText(url); toast('Link copied: it opens this exact system'); }
    catch { toast('Copy blocked by the browser'); }
  };
  const fails = res.checks.filter(c => !c.pass).length;

  return (
    <div ref={root} className="mx-auto w-full max-w-[1680px] px-3 md:px-5">
      <div className="grid gap-3 lg:h-[calc(100svh-6.5rem)] lg:min-h-[640px] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="cs-glass order-2 flex min-h-0 flex-col overflow-hidden rounded-[22px] lg:order-1">
          <Editor st={st} res={res} edit={edit} tab={tab} setTab={t => { setTab(t); }} focus={focus} deltas={deltas} />
        </aside>
        <section className="cs-glass order-1 flex h-[82svh] min-h-0 flex-col overflow-hidden rounded-[22px] lg:order-2 lg:h-auto">
          <div className="flex flex-wrap items-center gap-2 border-b border-ink/[0.08] px-3 py-2.5">
            <Pills value={view} onChange={setView} options={[['canvas', 'Canvas'], ['outline', 'Outline']]} label="View" />
            <span className="mx-1 hidden h-5 w-px bg-ink/10 sm:block" />
            <Pills value={mode} onChange={setMode} options={[['light', 'Light'], ['dark', 'Dark'], ['both', 'Both']]} label="Mode" />
            {view === 'canvas' && (
              <>
                <Pills value={device} onChange={setDevice} label="Width" options={[['desktop', <Icon key="d" d="M3 5h18v11H3zM8 20h8M12 16v4" />], ['tablet', <Icon key="t" d="M6 3h12v18H6zM11 18h2" />], ['mobile', <Icon key="m" d="M8 3h8v18H8zM11 18h2" />]]} titles={{ desktop: 'Desktop, 1440', tablet: 'Tablet, 834', mobile: 'Mobile, 390' }} />
                <Chip on={grid} onClick={() => setGrid(g => !g)} title="Show the grid">Grid</Chip>
                <Chip on={inspect} onClick={() => setInspect(i => !i)} title="Hover anything to see its tokens">Inspect</Chip>
              </>
            )}
            <span className="ml-auto flex items-center gap-1.5">
              {fails > 0 && <button type="button" onClick={() => { setTab('color'); setFocus({ id: 'contrast', n: Date.now() }); }} className="rounded-full bg-[#ffe1dc] px-2.5 py-1 text-[12px] font-semibold text-[#9a2a14]" title="Pairs that fail WCAG AA">{fails} contrast {fails === 1 ? 'issue' : 'issues'}</button>}
              <IconBtn label="Undo" disabled={!canUndo} onClick={undo} d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" />
              <IconBtn label="Redo" disabled={!canRedo} onClick={redo} d="M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3" />
              <span className="relative">
                <button type="button" onClick={() => setPresets(p => !p)} aria-expanded={presets} className="rounded-full border border-ink/12 bg-white px-3 py-1.5 text-[13px] font-medium text-ink hover:border-ink/30">Start from</button>
                {presets && <PresetMenu onClose={() => setPresets(false)} onPick={id => {
                  if (id === 'shuffle') { edit(s => shuffle(s)); toast('Shuffled. Undo to go back'); }
                  else { const p = PRESETS.find(x => x.id === id)!; edit(() => withPreset(p.state)); toast(`${p.name}. Undo to go back`); }
                  setPresets(false);
                }} />}
              </span>
              <IconBtn label="Copy a link to this system" onClick={share} d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
              <button type="button" onClick={() => setExporting(true)} className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white hover:-translate-y-0.5">Export</button>
            </span>
          </div>
          <div className="min-h-0 flex-1">
            {view === 'canvas'
              ? <Canvas res={res} view={mode} device={device} grid={grid} inspect={inspect} onPick={onPick} />
              : <Outline res={res} st={st} tab={tab} deltas={deltas} mode={mode} />}
          </div>
        </section>
      </div>
      {exporting && <ExportPanel res={res} onClose={() => setExporting(false)} />}
    </div>
  );
}

function Pills<T extends string>({ value, onChange, options, label, titles }: { value: T; onChange: (v: T) => void; options: [T, ReactNode][]; label: string; titles?: Partial<Record<T, string>> }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-ink/[0.06] p-[3px]">
      {options.map(([v, l]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} title={titles?.[v]} aria-label={titles?.[v]}
          className={`flex items-center rounded-full px-3 py-1 text-[13px] font-medium transition-all ${value === v ? 'bg-white text-ink shadow-[0_1px_4px_-1px_rgba(15,30,55,0.25)]' : 'text-ink/60 hover:text-ink'}`}>{l}</button>
      ))}
    </div>
  );
}
const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
function IconBtn({ label, onClick, d, disabled }: { label: string; onClick: () => void; d: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
      className="grid h-8 w-8 place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"><Icon d={d} /></button>
  );
}
function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: ReactNode; title: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} title={title}
      className={`rounded-full border px-3 py-1 text-[13px] font-medium transition-colors ${on ? 'border-ink bg-ink text-white' : 'border-ink/12 bg-white text-ink/70 hover:border-ink/30'}`}>{children}</button>
  );
}

function PresetMenu({ onPick, onClose }: { onPick: (id: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const on = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    setTimeout(() => document.addEventListener('mousedown', on));
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', on); document.removeEventListener('keydown', key); };
  }, [onClose]);
  return (
    <div ref={ref} role="menu" className="tk-fade absolute right-0 top-[calc(100%+6px)] z-50 w-[260px] rounded-[18px] bg-white p-1.5 shadow-[0_24px_50px_-20px_rgba(15,30,55,0.5),0_0_0_1px_rgba(23,25,30,0.06)]">
      {PRESETS.map(p => {
        const r = resolve(withPreset(p.state));
        return (
          <button key={p.id} type="button" role="menuitem" onClick={() => onPick(p.id)} className="flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left hover:bg-ink/[0.05]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[15px] font-semibold" style={{ background: r.semantic.light['bg/brand'].hex, color: r.semantic.light['fg/on-brand'].hex, borderRadius: Math.min(r.radius.sem.button.px, 18), fontFamily: `'${r.type.families.heading}', sans-serif` }}>Aa</span>
            <span className="min-w-0">
              <span className="block text-[14px] font-medium text-ink">{p.name}</span>
              <span className="block truncate text-[12px] text-ink/50">{p.note} · {r.type.families.heading}</span>
            </span>
          </button>
        );
      })}
      <div className="my-1 h-px bg-ink/[0.07]" />
      <button type="button" role="menuitem" onClick={() => onPick('shuffle')} className="flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left hover:bg-ink/[0.05]">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-ink/[0.06] text-ink"><Icon d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></span>
        <span><span className="block text-[14px] font-medium text-ink">Shuffle</span><span className="block text-[12px] text-ink/50">A random brand and font pairing</span></span>
      </button>
    </div>
  );
}
