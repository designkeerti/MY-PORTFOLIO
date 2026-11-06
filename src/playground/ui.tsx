import { useEffect, useState, type ReactNode } from 'react';
import { isHex, normHex } from './color';
import { AnimatePresence, motion } from 'framer-motion';

/** The playground's shared bits, in the site's light glass. */

export const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`cs-glass rounded-[22px] ${className}`}>{children}</div>
);

export function Slider({ label, min, max, step, value, onChange, unit = '' }:
  { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between">
        <span className="pg-label">{label}</span>
        <span className="font-mono text-[12px] tabular-nums text-ink/55">{+value.toFixed(3)}{unit}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="pg-range" />
    </label>
  );
}

export function Button({ children, onClick, variant = 'solid', className = '' }: { children: ReactNode; onClick?: () => void; variant?: 'solid' | 'ghost'; className?: string }) {
  const look = variant === 'solid'
    ? 'bg-ink text-white hover:-translate-y-0.5'
    : 'border border-ink/15 bg-white text-ink hover:border-ink/35';
  return <button type="button" onClick={onClick} className={`rounded-full px-4 py-2.5 text-[14px] font-medium transition-all duration-200 ${look} ${className}`}>{children}</button>;
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string; group?: string }[] }) {
  const groups = [...new Set(options.map(o => o.group ?? ''))];
  return (
    <label className="flex flex-col gap-1.5">
      <span className="pg-label">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="pg-select">
        {groups.map(g => g
          ? <optgroup key={g} label={g}>{options.filter(o => o.group === g).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
          : options.filter(o => !o.group).map(o => <option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
    </label>
  );
}

/* a tiny toast: any component can call useToast()('Copied') and the Toaster shows it */
const bus = new EventTarget();
export const useToast = () => (msg: string) => bus.dispatchEvent(new CustomEvent('toast', { detail: msg }));
export function Toaster() {
  const [msg, setMsg] = useState<{ text: string; id: number } | null>(null);
  useEffect(() => {
    let t = 0;
    const on = (e: Event) => { setMsg({ text: (e as CustomEvent<string>).detail, id: Date.now() }); clearTimeout(t); t = window.setTimeout(() => setMsg(null), 1800); };
    bus.addEventListener('toast', on);
    return () => { bus.removeEventListener('toast', on); clearTimeout(t); };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-[60] flex justify-center">
      <AnimatePresence>
        {msg && (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }}
            className="rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-white shadow-[0_16px_34px_-16px_rgba(15,30,55,0.6)]">
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A colour: the swatch opens the system picker, the hex can be typed or pasted. */
export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="pg-label">{label}</span>
      <span className="flex items-center gap-2.5 rounded-[14px] border border-ink/14 bg-white p-1.5 pr-3">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[10px] border border-ink/10" style={{ background: value }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`${label}: pick a colour`} />
        </span>
        <input value={text} spellCheck={false} aria-label={`${label}: hex`}
          onChange={e => { setText(e.target.value); if (isHex(e.target.value)) onChange(normHex(e.target.value)); }}
          onBlur={() => setText(value)}
          className="w-full min-w-0 bg-transparent font-mono text-[15px] uppercase text-ink outline-none" />
      </span>
    </label>
  );
}

/** Copy some text, and say so. */
export function useCopy() {
  const toast = useToast();
  return async (text: string, what = 'Copied') => {
    try { await navigator.clipboard.writeText(text); toast(what === 'Copied' ? what : `${what} copied`); }
    catch { toast('Copy blocked by the browser'); }
  };
}

/** A small set of mutually exclusive options. */
export function Segmented<T extends string>({ label, value, onChange, options }: { label?: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div>
      {label && <p className="pg-label">{label}</p>}
      <div className={`${label ? 'mt-2 ' : ''}flex flex-wrap gap-1.5`}>
        {options.map(o => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${value === o.value ? 'border-ink bg-ink text-white' : 'border-ink/12 bg-white text-ink/70 hover:border-ink/30'}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
