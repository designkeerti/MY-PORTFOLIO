import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { useCopy, useToast } from './ui';
import { contrastRatio, isHex, normHex } from './color';
import { analyse, generate, nameOf, rolesOf, type Mood, type Slot } from './palette/engine';
import { loadSaved, encodeState } from './tokens/hooks';
import { accentsFor } from './tokens/choices';
import { remember, useTransitionTo } from '../components/PageTransition';
import iLock from '@phosphor-icons/core/assets/fill/lock-simple-fill.svg?raw';
import iOpen from '@phosphor-icons/core/assets/regular/lock-simple-open.svg?raw';
import iCopy from '@phosphor-icons/core/assets/regular/copy.svg?raw';
import iX from '@phosphor-icons/core/assets/regular/x.svg?raw';
import iDrop from '@phosphor-icons/core/assets/regular/drop.svg?raw';

/**
 * Palette Generator: press space for a new palette, lock the colours you like, and the
 * rest are chosen to go with them, scored on harmony, contrast, balance and more (see
 * palette/engine.ts). It says why each palette works, and hands it to Design Tokens.
 */

const MOODS: { id: Mood; label: string }[] = [
  { id: 'any', label: 'Any' }, { id: 'soft', label: 'Soft' }, { id: 'vivid', label: 'Vivid' }, { id: 'earthy', label: 'Earthy' }, { id: 'deep', label: 'Deep' },
];
const ink = (hex: string) => (contrastRatio(hex, '#ffffff') > contrastRatio(hex, '#17191e') ? '#ffffff' : '#17191e');
const Ic = ({ svg, className = 'h-[18px] w-[18px]' }: { svg: string; className?: string }) => <span aria-hidden className={`block [&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;

function fromHash(): Slot[] | null {
  const m = location.hash.match(/^#p=([0-9a-f-]+)(?:~([01]+))?$/i);
  if (!m) return null;
  const hexes = m[1].split('-').filter(h => isHex(h)).slice(0, 8);
  if (hexes.length < 2) return null;
  return hexes.map((h, i) => ({ hex: normHex(h), locked: m[2]?.[i] === '1' }));
}

export function PaletteGenerator() {
  const [slots, setSlots] = useState<Slot[]>(() => fromHash() ?? generate(Array.from({ length: 5 }, () => ({ hex: '#888888', locked: false })), 'any').hexes.map(hex => ({ hex, locked: false })));
  const [mood, setMood] = useState<Mood>('any');
  const past = useRef<Slot[][]>([]), future = useRef<Slot[][]>([]);
  const [, bump] = useState(0);
  const copy = useCopy();
  const toast = useToast();
  const go = useTransitionTo();
  const hexes = slots.map(s => s.hex);
  const analysis = useMemo(() => analyse(hexes, undefined, slots.map(s => s.locked)), [slots]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = useRef(slots);
  cur.current = slots;
  const commit = useCallback((next: Slot[]) => {
    past.current.push(cur.current); if (past.current.length > 60) past.current.shift();
    future.current = [];
    setSlots(next);
  }, []);
  const roll = useCallback(() => {
    const prev = cur.current;
    if (prev.every(s => s.locked)) { toast('Everything is locked: unlock a colour to change it'); return; }
    const g = generate(prev, mood);
    commit(g.hexes.map((hex, i) => ({ hex, locked: prev[i].locked })));
  }, [mood, toast, commit]);
  const undo = () => { const p = past.current.pop(); if (!p) return; future.current.push(cur.current); setSlots(p); bump(x => x + 1); };
  const redo = () => { const f = future.current.pop(); if (!f) return; past.current.push(cur.current); setSlots(f); bump(x => x + 1); };

  // space for a new palette; the link always holds the current one
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      if (e.code !== 'Space' || t?.closest('input, textarea, select, button, [contenteditable]')) return;
      e.preventDefault(); roll();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [roll]);
  useEffect(() => {
    const h = `#p=${slots.map(s => s.hex.slice(1)).join('-')}~${slots.map(s => (s.locked ? 1 : 0)).join('')}`;
    history.replaceState(history.state, '', location.pathname + location.search + h);
  }, [slots]);

  const setAt = (i: number, patch: Partial<Slot>) => commit(slots.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const lockAt = (i: number) => { setSlots(ss => ss.map((s, j) => (j === i ? { ...s, locked: !s.locked } : s))); };
  const add = () => {
    if (slots.length >= 8) return;
    const next = [...slots, { hex: '#888888', locked: false }];
    const g = generate(next.map((s, i) => ({ ...s, locked: i < slots.length ? true : false })), mood);
    commit(next.map((_, i) => ({ hex: g.hexes[i], locked: i < slots.length ? slots[i].locked : false })));
  };
  const remove = (i: number) => { if (slots.length > 2) commit(slots.filter((_, j) => j !== i)); };

  const toTokens = async (e: MouseEvent<HTMLButtonElement>) => {
    const r = rolesOf(hexes);
    const base = loadSaved();
    const st = { ...base, color: { ...base.color, brand: r.brand, accent: r.accent ?? accentsFor(r.brand)[1], lean: r.lean, tint: r.tint, depth: r.depth, map: {} } };
    const to = `/playground/tokens#t=${await encodeState(st)}`;
    remember(to, e.currentTarget);
    go(to);
  };

  const lightest = [...slots].sort((a, b) => contrastRatio(b.hex, '#000') - contrastRatio(a.hex, '#000'))[0].hex;
  const darkest = [...slots].sort((a, b) => contrastRatio(a.hex, '#000') - contrastRatio(b.hex, '#000'))[0].hex;
  const roles = rolesOf(hexes);
  const meters: [string, number][] = [
    ['Harmony', analysis.parts.harmony], ['Contrast', analysis.parts.contrast], ['Range', analysis.parts.lightness],
    ['Balance', analysis.parts.lead], ['Natural order', analysis.parts.natural], ['Distinct', analysis.parts.distinct],
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-4 md:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={roll} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-white transition-transform hover:-translate-y-0.5">
          Generate <kbd className="hidden rounded-[6px] bg-white/15 px-1.5 py-0.5 font-sans text-[11.5px] text-white/80 sm:inline">Space</kbd>
        </button>
        <div role="radiogroup" aria-label="Mood" className="flex rounded-full bg-ink/[0.06] p-[3px]">
          {MOODS.map(m => (
            <button key={m.id} type="button" role="radio" aria-checked={mood === m.id} onClick={() => setMood(m.id)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-all ${mood === m.id ? 'bg-white text-ink shadow-[0_1px_4px_-1px_rgba(15,30,55,0.25)]' : 'text-ink/60 hover:text-ink'}`}>{m.label}</button>
          ))}
        </div>
        <span className="flex items-center rounded-full bg-ink/[0.06] p-[3px]">
          <button type="button" aria-label="Fewer colours" disabled={slots.length <= 2} onClick={() => remove(slots.length - 1)} className="grid h-8 w-8 place-items-center rounded-full text-[17px] text-ink/70 hover:bg-white disabled:opacity-30">−</button>
          <span className="w-6 text-center text-[13px] font-medium tabular-nums text-ink">{slots.length}</span>
          <button type="button" aria-label="More colours" disabled={slots.length >= 8} onClick={add} className="grid h-8 w-8 place-items-center rounded-full text-[17px] text-ink/70 hover:bg-white disabled:opacity-30">+</button>
        </span>
        <span className="flex items-center">
          <button type="button" onClick={undo} disabled={!past.current.length} aria-label="Previous palette" title="Previous palette" className="grid h-9 w-9 place-items-center rounded-full text-ink/70 hover:bg-ink/[0.06] disabled:opacity-30">←</button>
          <button type="button" onClick={redo} disabled={!future.current.length} aria-label="Next palette" title="Next palette" className="grid h-9 w-9 place-items-center rounded-full text-ink/70 hover:bg-ink/[0.06] disabled:opacity-30">→</button>
        </span>
        <span className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={() => copy(hexes.join(', '), 'Hex codes')} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-[13.5px] font-medium text-ink hover:border-ink/35">Copy hex</button>
          <button type="button" onClick={() => copy(`:root {\n${slots.map((s, i) => `  --palette-${i + 1}: ${s.hex}; /* ${nameOf(s.hex)} */`).join('\n')}\n}`, 'CSS')} className="rounded-full border border-ink/15 bg-white px-4 py-2 text-[13.5px] font-medium text-ink hover:border-ink/35">Copy CSS</button>
          <button type="button" onClick={toTokens} className="rounded-full bg-[#2f6bed] px-4 py-2 text-[13.5px] font-medium text-white transition-transform hover:-translate-y-0.5">Build a design system →</button>
        </span>
      </div>

      <div className="flex h-auto flex-col overflow-hidden rounded-[26px] shadow-[0_30px_60px_-34px_rgba(15,30,55,0.5),0_0_0_1px_rgba(23,25,30,0.06)] md:h-[min(60svh,540px)] md:flex-row">
        {slots.map((s, i) => {
          const c = ink(s.hex);
          return (
            <div key={i} className="group relative flex min-h-[96px] flex-1 flex-row items-end justify-between p-4 transition-[background-color] duration-500 ease-out md:flex-col md:items-stretch md:justify-end md:p-5"
              style={{ background: s.hex, color: c }}>
              <div className="flex flex-col gap-0.5 md:mb-4">
                <span className="text-[14.5px] font-semibold capitalize leading-tight">{nameOf(s.hex)}</span>
                <button type="button" onClick={() => copy(s.hex.toUpperCase(), s.hex.toUpperCase())} className="self-start font-mono text-[13px] uppercase opacity-80 hover:opacity-100" title="Copy">{s.hex}</button>
              </div>
              <div className="flex items-center gap-1 md:justify-between">
                <button type="button" onClick={() => lockAt(i)} aria-pressed={s.locked} aria-label={s.locked ? `Unlock ${nameOf(s.hex)}` : `Lock ${nameOf(s.hex)}`} title={s.locked ? 'Locked: stays when you generate' : 'Lock this colour'}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12.5px] font-medium transition-all ${s.locked ? '' : 'opacity-80 hover:opacity-100'}`}
                  style={{ background: s.locked ? c : `${c === '#ffffff' ? 'rgba(255,255,255,.14)' : 'rgba(23,25,30,.08)'}`, color: s.locked ? s.hex : c }}>
                  <Ic svg={s.locked ? iLock : iOpen} className="h-4 w-4" />{s.locked ? 'Locked' : 'Lock'}
                </button>
                <span className="flex items-center gap-0.5 opacity-80 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <label className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-full hover:bg-black/10" title="Change this colour">
                    <Ic svg={iDrop} className="h-4 w-4" />
                    <input type="color" value={s.hex} onChange={e => setAt(i, { hex: e.target.value, locked: true })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`Change ${nameOf(s.hex)}`} />
                  </label>
                  <button type="button" onClick={() => copy(s.hex.toUpperCase(), s.hex.toUpperCase())} aria-label="Copy hex" className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/10"><Ic svg={iCopy} className="h-4 w-4" /></button>
                  {slots.length > 2 && <button type="button" onClick={() => remove(i)} aria-label={`Remove ${nameOf(s.hex)}`} className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/10"><Ic svg={iX} className="h-4 w-4" /></button>}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="px-1 text-[13px] text-ink/50">Lock the colours you like and press space: the rest are picked to go with them. Changing a colour by hand locks it.</p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="cs-glass flex flex-col gap-4 rounded-[22px] p-5">
          <h2 className="pg-label">Why it works</h2>
          <ul className="flex flex-col gap-2.5">
            {analysis.reasons.map(r => <li key={r} className="flex gap-2.5 text-[14.5px] leading-snug text-ink/80"><span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink/40" />{r}</li>)}
          </ul>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
            {meters.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <span className="flex justify-between text-[12px] text-ink/55"><span>{k}</span><span className="tabular-nums">{Math.round(v * 100)}</span></span>
                <span className="h-1.5 overflow-hidden rounded-full bg-ink/[0.08]"><span className="block h-full rounded-full bg-ink/70 transition-[width] duration-500" style={{ width: `${Math.round(v * 100)}%` }} /></span>
              </div>
            ))}
          </div>
        </section>
        <section className="cs-glass flex flex-col gap-4 rounded-[22px] p-5">
          <h2 className="pg-label">In use</h2>
          <div className="rounded-[18px] p-5 transition-colors duration-500" style={{ background: lightest, color: darkest, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' }}>
            <span className="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ background: roles.accent ?? roles.brand, color: ink(roles.accent ?? roles.brand) }}>New</span>
            <p className="mt-2.5 text-[20px] font-semibold leading-tight tracking-[-0.01em]">Know where your week is going.</p>
            <p className="mt-1.5 text-[13.5px] leading-snug opacity-75">One calm view of what shipped and what’s stuck.</p>
            <span className="mt-4 inline-block rounded-[10px] px-4 py-2 text-[13.5px] font-medium" style={{ background: roles.brand, color: ink(roles.brand) }}>Get started</span>
          </div>
          {analysis.textPairs.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[12.5px] text-ink/55">Pairs that pass for text</span>
              <div className="flex flex-wrap gap-2">
                {analysis.textPairs.map(p => (
                  <span key={p.fg + p.bg} className="flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-[13px] font-semibold" style={{ background: p.bg, color: p.fg, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.08)' }}>
                    Aa <span className="font-mono text-[11px] font-medium opacity-80">{p.ratio.toFixed(1)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
