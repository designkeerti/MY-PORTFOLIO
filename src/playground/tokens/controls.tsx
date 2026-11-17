import { useEffect, useState, type ReactNode } from 'react';
import { isHex, normHex } from '../color';

/** Compact controls for the token editor's side panel. */

export function Field({ label, hint, children, value }: { label: string; hint?: string; children: ReactNode; value?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-ink/80">{label}</span>
        {value !== undefined && <span className="font-mono text-[12px] tabular-nums text-ink/55">{value}</span>}
      </div>
      {children}
      {hint && <p className="text-[12px] leading-snug text-ink/50">{hint}</p>}
    </div>
  );
}

export function Range({ label, hint, min, max, step, value, onChange, show }:
  { label: string; hint?: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; show?: (v: number) => string }) {
  return (
    <Field label={label} hint={hint} value={show ? show(value) : +value.toFixed(3)}>
      <input type="range" min={min} max={max} step={step} value={value} aria-label={label} onChange={e => onChange(parseFloat(e.target.value))} className="pg-range" />
    </Field>
  );
}

export function Seg<T extends string | number>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-[12px] bg-ink/[0.06] p-[3px]">
      {options.map(o => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={`min-w-0 flex-1 truncate rounded-[9px] px-2 py-1.5 text-[12.5px] font-medium transition-all ${value === o.value ? 'bg-white text-ink shadow-[0_1px_4px_-1px_rgba(15,30,55,0.25)]' : 'text-ink/60 hover:text-ink'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Hex({ label, value, onChange, small }: { label: string; value: string; onChange: (hex: string) => void; small?: boolean }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <label className={`flex items-center gap-2 rounded-[12px] border border-ink/12 bg-white ${small ? 'p-1 pr-2' : 'p-1.5 pr-2.5'}`}>
      <span className={`relative shrink-0 overflow-hidden rounded-[8px] border border-ink/10 ${small ? 'h-7 w-7' : 'h-8 w-8'}`} style={{ background: value }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`${label}: pick a colour`} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] leading-tight text-ink/55">{label}</span>
        <input value={text} spellCheck={false} aria-label={`${label}: hex`}
          onChange={e => { setText(e.target.value); if (isHex(e.target.value)) onChange(normHex(e.target.value)); }}
          onBlur={() => setText(value)}
          className="w-full min-w-0 bg-transparent font-mono text-[13px] uppercase leading-tight text-ink outline-none" />
      </span>
    </label>
  );
}

export function Pick({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string; group?: string }[]; label: string }) {
  const groups = [...new Set(options.map(o => o.group ?? ''))];
  return (
    <select value={value} aria-label={label} onChange={e => onChange(e.target.value)} className="pg-select !rounded-[12px] !py-2 !text-[14px]">
      {groups.map(g => g
        ? <optgroup key={g} label={g}>{options.filter(o => o.group === g).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
        : options.filter(o => !o.group).map(o => <option key={o.value} value={o.value}>{o.label}</option>))}
    </select>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-start justify-between gap-3 text-left">
      <span className="flex flex-col">
        <span className="text-[13px] font-medium text-ink/80">{label}</span>
        {hint && <span className="text-[12px] leading-snug text-ink/50">{hint}</span>}
      </span>
      <span className={`relative mt-0.5 h-[22px] w-[38px] shrink-0 rounded-full transition-colors ${checked ? 'bg-ink' : 'bg-ink/20'}`}>
        <span className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-[left] ${checked ? 'left-[19px]' : 'left-[3px]'}`} />
      </span>
    </button>
  );
}

export function Group({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 border-t border-ink/[0.08] px-4 py-4 first:border-t-0">
      <header className="flex items-center justify-between gap-2">
        <h3 className="pg-label">{title}</h3>
        {aside}
      </header>
      {children}
    </section>
  );
}

/** "16 → 18" for a moment after a token changes */
export function Delta({ from, to, unit = '' }: { from: string; to: string; unit?: string }) {
  return (
    <span key={`${from}>${to}`} className="tk-delta inline-flex items-center gap-1 rounded-full bg-[#ffe9a8] px-1.5 py-px font-mono text-[10.5px] font-medium text-[#6b4b00]">
      {from}{unit}<span aria-hidden>→</span>{to}{unit}
    </span>
  );
}
