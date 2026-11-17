import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { fontByName, loadFont } from './data';
import { useToast } from './ui';
import { flat, resolve, type Bp, type Mode } from './tokens/model';
import { decodeState, encodeState, loadSaved, useAutosave, useDeltas, useHistory } from './tokens/hooks';
import { Editor, type Tab } from './tokens/Editor';
import { Preview } from './tokens/Preview';
import { Outline } from './tokens/Outline';
import { ExportPanel } from './tokens/ExportPanel';
import { Dock, MobileDock } from './tokens/Dock';

/**
 * Design Tokens. The site preview sits in the page and scrolls with it; the choices stay
 * pinned beside it (a sheet on phones). Click anything in the preview to change it there.
 * Spec lays the tokens out, one clean view per group.
 */

export function DesignTokens() {
  const { st, edit, undo, redo, canUndo, canRedo } = useHistory(loadSaved);
  useAutosave(st);
  const toast = useToast();
  const res = useMemo(() => resolve(st), [st]);
  const flatNow = useMemo(() => flat(res), [res]);
  const deltas = useDeltas(flatNow);

  const [view, setView] = useState<'preview' | 'spec'>('preview');
  const [mode, setMode] = useState<Mode | 'both'>('light');
  const [device, setDevice] = useState<Bp>(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'mobile' : 'desktop'));
  const [grid, setGrid] = useState(false);
  const [aspect, setAspect] = useState<Tab>('color');
  const [fine, setFine] = useState<{ id: string; n: number } | null | false>(false);
  const [exporting, setExporting] = useState(false);

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
      if (e.target instanceof Element && e.target.closest('input:not([type=range]):not([type=color]), textarea, select')) return;
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [undo, redo]);

  const fineTune = useCallback((t?: Tab, focus?: string) => {
    if (t) setAspect(t);
    setFine(focus ? { id: focus, n: Date.now() } : null);
  }, []);

  const share = async () => {
    const url = `${location.origin}${location.pathname}#t=${await encodeState(st)}`;
    try { await navigator.clipboard.writeText(url); toast('Link copied: it opens this exact system'); }
    catch { toast('Copy blocked by the browser'); }
  };

  const fineOpen = fine !== false;
  const editor = <Editor st={st} res={res} edit={edit} tab={aspect} setTab={setAspect} focus={fine || null} deltas={deltas} />;

  return (
    <div ref={root} className="mx-auto w-full max-w-[1560px] px-3 pb-28 md:px-5 lg:pb-4">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_356px] lg:items-start lg:gap-6">
        <div className="min-w-0">
          <div className="sticky top-[4.6rem] z-30 mb-4 flex flex-wrap items-center gap-2 rounded-[20px] bg-[#f7f6f2]/90 py-1.5 backdrop-blur-md">
            <Pills label="View" value={view} onChange={setView} options={[['preview', 'Preview'], ['spec', 'Spec']]} />
            <Pills label="Mode" value={mode} onChange={setMode} options={[['light', 'Light'], ['dark', 'Dark'], ['both', 'Both']]} />
            {view === 'preview' && (
              <>
                <Pills label="Width" value={device} onChange={setDevice} titles={{ desktop: 'Desktop, 1440', tablet: 'Tablet, 834', mobile: 'Phone, 390' }}
                  options={[['desktop', <Icon key="d" d="M3 5h18v11H3zM8 20h8M12 16v4" />], ['tablet', <Icon key="t" d="M6 3h12v18H6zM11 18h2" />], ['mobile', <Icon key="m" d="M8 3h8v18H8zM11 18h2" />]]} />
                <button type="button" onClick={() => setGrid(g => !g)} aria-pressed={grid} title="Show the layout grid"
                  className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${grid ? 'bg-ink text-white' : 'bg-ink/[0.06] text-ink/70 hover:text-ink'}`}>Grid</button>
              </>
            )}
            <span className="ml-auto flex items-center">
              <IconBtn label="Undo" disabled={!canUndo} onClick={undo} d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" />
              <IconBtn label="Redo" disabled={!canRedo} onClick={redo} d="M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3" />
              <IconBtn label="Copy a link to this system" onClick={share} d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
            </span>
          </div>
          {view === 'preview'
            ? <Preview st={st} res={res} edit={edit} view={mode} device={device} grid={grid} onFineTune={fineTune} />
            : <Outline res={res} st={st} tab={aspect} setTab={setAspect} deltas={deltas} mode={mode} />}
        </div>

        <aside className={`cs-glass sticky top-[4.6rem] hidden flex-col overflow-hidden rounded-[22px] lg:flex ${fineOpen ? 'h-[calc(100svh-5.6rem)]' : 'max-h-[calc(100svh-5.6rem)]'}`}>
          {fineOpen ? (
            <>
              <button type="button" onClick={() => setFine(false)} className="flex items-center gap-2 border-b border-ink/[0.08] px-4 py-3 text-left text-[13px] font-medium text-ink/70 hover:text-ink">
                <span aria-hidden>←</span> Quick choices
              </button>
              <div className="min-h-0 flex-1">{editor}</div>
            </>
          ) : (
            <div className="overflow-y-auto overscroll-contain">
              <Dock st={st} res={res} edit={edit} onAspect={setAspect} onExport={() => setExporting(true)} onFineTune={t => fineTune(t)} />
            </div>
          )}
        </aside>
      </div>

      <MobileDock st={st} res={res} edit={edit} onAspect={setAspect} onExport={() => setExporting(true)} onFineTune={t => fineTune(t)} />
      {fineOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#0d0f14]/30 pt-[8svh] lg:hidden" onClick={() => setFine(false)}>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px] bg-[#f7f6f2]" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setFine(false)} className="border-b border-ink/[0.08] px-4 py-3 text-left text-[13.5px] font-medium text-ink/70">← Done</button>
            <div className="min-h-0 flex-1">{editor}</div>
          </div>
        </div>
      )}
      {exporting && <ExportPanel res={res} st={st} edit={edit} onClose={() => setExporting(false)} />}
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
