import { useState, type ReactNode } from 'react';
import { PRESETS, fixFor, resolve, shuffle, withPreset, type Resolved, type State } from './model';
import type { Edit } from './choices';
import type { Tab } from './Editor';
import {
  AccentPicker, BrandPicker, DensityPicker, DepthPicker, GreysPicker, PairPicker, Row, ScalePicker, ShapePicker, SizePicker,
} from './Pickers';
import { useToast } from '../ui';

/**
 * The side panel: a handful of whole decisions, each one tap. Everything else (palettes,
 * dark mode, mobile type, contrast) follows from them. Fine-tune opens every token.
 */

type Props = { st: State; res: Resolved; edit: Edit; onAspect: (t: Tab) => void; onExport: () => void; onFineTune: (t?: Tab) => void };

function Section({ title, children, onTouch }: { title: string; children: ReactNode; onTouch?: () => void }) {
  return (
    <section onPointerDownCapture={onTouch} className="flex flex-col gap-3.5 border-t border-ink/[0.07] px-4 py-4">
      <h3 className="pg-label">{title}</h3>
      {children}
    </section>
  );
}
const Touch = ({ on, children }: { on: () => void; children: ReactNode }) => <div onPointerDownCapture={on}>{children}</div>;

export function ContrastLine({ res, edit }: { res: Resolved; edit: Edit }) {
  const fails = res.checks.filter(c => !c.pass);
  if (!fails.length) return (
    <p className="flex items-start gap-2 text-[12.5px] leading-snug text-[#11652f]">
      <span aria-hidden className="mt-[3px] grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-[#11652f] text-[9px] text-white">✓</span>
      All {res.checks.length} text and background pairs pass WCAG AA, in light and dark.
    </p>
  );
  return (
    <div className="flex items-center justify-between gap-2 rounded-[12px] bg-[#ffe9e4] px-3 py-2">
      <span className="text-[12.5px] font-medium text-[#9a2a14]">{fails.length} {fails.length === 1 ? 'pair fails' : 'pairs fail'} contrast</span>
      <button type="button" className="rounded-full bg-[#9a2a14] px-2.5 py-1 text-[12px] font-medium text-white"
        onClick={() => edit(s => {
          const map = { ...s.color.map };
          for (const c of fails) { const f = fixFor(res, c); if (f) map[f.key] = f.ref; }
          return { ...s, color: { ...s.color, map } };
        })}>Fix</button>
    </div>
  );
}

export function ColourChoices({ st, edit, onAspect }: Pick<Props, 'st' | 'edit' | 'onAspect'>) {
  return (
    <Touch on={() => onAspect('color')}>
      <div className="flex flex-col gap-3.5">
        <Row label="Brand" hint={<span className="text-[11px] text-ink/40">Drop a logo here</span>}><BrandPicker st={st} edit={edit} /></Row>
        <Row label="Accent"><AccentPicker st={st} edit={edit} /></Row>
        <Row label="Greys"><GreysPicker st={st} edit={edit} /></Row>
      </div>
    </Touch>
  );
}
export function TypeChoices({ st, edit, onAspect }: Pick<Props, 'st' | 'edit' | 'onAspect'>) {
  return (
    <Touch on={() => onAspect('type')}>
      <div className="flex flex-col gap-3.5">
        <PairPicker st={st} edit={edit} />
        <Row label="Text size"><SizePicker st={st} edit={edit} /></Row>
        <Row label="Headings"><ScalePicker st={st} edit={edit} /></Row>
      </div>
    </Touch>
  );
}
export function FeelChoices({ st, edit, onAspect }: Pick<Props, 'st' | 'edit' | 'onAspect'>) {
  return (
    <div className="flex flex-col gap-3.5">
      <Touch on={() => onAspect('radius')}><Row label="Corners"><ShapePicker st={st} edit={edit} /></Row></Touch>
      <Touch on={() => onAspect('space')}><Row label="Space"><DensityPicker st={st} edit={edit} /></Row></Touch>
      <Touch on={() => onAspect('depth')}><Row label="Depth"><DepthPicker st={st} edit={edit} /></Row></Touch>
    </div>
  );
}
export function StartFrom({ edit }: { edit: Edit }) {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map(p => {
        const r = resolve(withPreset(p.state));
        return (
          <button key={p.id} type="button" title={p.note} onClick={() => { edit(() => withPreset(p.state)); toast(`${p.name}. Undo to go back`); }}
            className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white py-1 pl-1 pr-2.5 text-[12px] font-medium text-ink/75 hover:border-ink/30">
            <span className="h-4 w-4 rounded-full" style={{ background: r.semantic.light['bg/brand'].hex }} />{p.name}
          </button>
        );
      })}
      <button type="button" onClick={() => { edit(s => shuffle(s)); toast('Shuffled. Undo to go back'); }}
        className="rounded-full border border-dashed border-ink/25 px-2.5 py-1 text-[12px] font-medium text-ink/70 hover:border-ink/50">Shuffle</button>
    </div>
  );
}

export function Dock({ st, res, edit, onAspect, onExport, onFineTune }: Props) {
  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 px-4 pb-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0">
            <span className="pg-label">Your system</span>
            <span className="block truncate text-[18px] font-semibold tracking-[-0.01em] text-ink">{res.name}</span>
          </span>
          <button type="button" onClick={onExport} className="shrink-0 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-white transition-transform hover:-translate-y-0.5">Export</button>
        </div>
        <ContrastLine res={res} edit={edit} />
      </header>
      <Section title="Colour"><ColourChoices st={st} edit={edit} onAspect={onAspect} /></Section>
      <Section title="Type"><TypeChoices st={st} edit={edit} onAspect={onAspect} /></Section>
      <Section title="Feel"><FeelChoices st={st} edit={edit} onAspect={onAspect} /></Section>
      <section className="flex flex-col gap-3 border-t border-ink/[0.07] px-4 py-4">
        <button type="button" onClick={() => onFineTune()} className="flex items-center justify-between rounded-[14px] border border-ink/10 bg-white px-3.5 py-2.5 text-left hover:border-ink/30">
          <span><span className="block text-[13.5px] font-medium text-ink">Fine-tune every token</span><span className="block text-[12px] text-ink/50">Exact colours, each type style, every space and corner</span></span>
          <span aria-hidden className="text-ink/40">→</span>
        </button>
        <Row label="Or start from"><StartFrom edit={edit} /></Row>
      </section>
    </div>
  );
}

/** on phones: a bar at the bottom, and the choices in a sheet above it */
export function MobileDock({ st, res, edit, onAspect, onExport, onFineTune }: Props) {
  const [tab, setTab] = useState<'colour' | 'type' | 'feel' | 'more' | null>(null);
  const tabs = [['colour', 'Colour'], ['type', 'Type'], ['feel', 'Feel'], ['more', 'More']] as const;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden">
      {tab && (
        <div className="tk-fade mb-2 max-h-[54svh] overflow-y-auto overscroll-contain rounded-[22px] bg-[#f7f6f2] p-4 shadow-[0_-10px_40px_-12px_rgba(15,30,55,0.45),0_0_0_1px_rgba(23,25,30,0.06)]">
          {tab === 'colour' && <div className="flex flex-col gap-4"><ContrastLine res={res} edit={edit} /><ColourChoices st={st} edit={edit} onAspect={onAspect} /></div>}
          {tab === 'type' && <TypeChoices st={st} edit={edit} onAspect={onAspect} />}
          {tab === 'feel' && <FeelChoices st={st} edit={edit} onAspect={onAspect} />}
          {tab === 'more' && (
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => { setTab(null); onFineTune(); }} className="rounded-[14px] border border-ink/10 bg-white px-3.5 py-2.5 text-left text-[13.5px] font-medium text-ink">Fine-tune every token →</button>
              <Row label="Start from"><StartFrom edit={edit} /></Row>
            </div>
          )}
        </div>
      )}
      <nav className="flex items-center gap-1 rounded-full bg-white/95 p-1.5 shadow-[0_10px_30px_-10px_rgba(15,30,55,0.5),0_0_0_1px_rgba(23,25,30,0.06)] backdrop-blur">
        {tabs.map(([v, l]) => (
          <button key={v} type="button" onClick={() => setTab(t => (t === v ? null : v))} aria-expanded={tab === v}
            className={`flex-1 rounded-full py-2 text-[13px] font-medium transition-colors ${tab === v ? 'bg-ink text-white' : 'text-ink/70'}`}>{l}</button>
        ))}
        <button type="button" onClick={onExport} className="rounded-full bg-[#2f6bed] px-3.5 py-2 text-[13px] font-medium text-white">Export</button>
      </nav>
    </div>
  );
}
