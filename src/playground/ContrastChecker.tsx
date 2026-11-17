import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Panel, Button, ColorField, useCopy } from './ui';
import { contrastRatio, isHex, nearestPassing, normHex } from './color';

/** WCAG 2 contrast for a text colour on a background, and the nearest colours that pass. */

const CHECKS = [
  { label: 'Normal text', level: 'AA', min: 4.5, note: 'Body copy, under 24px (19px bold)' },
  { label: 'Normal text', level: 'AAA', min: 7 },
  { label: 'Large text', level: 'AA', min: 3, note: '24px and up, or 19px bold' },
  { label: 'Large text', level: 'AAA', min: 4.5 },
  { label: 'Icons and UI', level: 'AA', min: 3, note: 'Borders, icons, focus rings, inputs' },
];

export function ContrastChecker() {
  const [params, setParams] = useSearchParams();
  const pick = (k: string, d: string) => { const v = params.get(k); return v && isHex(v) ? normHex(v) : d; };
  const [fg, setFg] = useState(() => pick('fg', '#7a8aa0'));
  const [bg, setBg] = useState(() => pick('bg', '#f7f6f2'));
  const copy = useCopy();
  useEffect(() => { setParams({ fg: fg.slice(1), bg: bg.slice(1) }, { replace: true }); }, [fg, bg, setParams]);

  const r = contrastRatio(fg, bg);
  const fixes = [{ level: 'AA', min: 4.5 }, { level: 'AAA', min: 7 }]
    .filter(f => r < f.min)
    .map(f => ({ ...f, hex: nearestPassing(fg, bg, f.min) }));
  const verdict = r >= 7 ? 'Passes everything' : r >= 4.5 ? 'Good for body text' : r >= 3 ? 'Only for large text and UI' : 'Too low for text';

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 md:grid-cols-[320px_minmax(0,1fr)] md:gap-5 md:px-6">
      <div className="flex flex-col gap-4 self-start">
        <Panel className="flex flex-col gap-4 p-5">
          <ColorField label="Text" value={fg} onChange={setFg} />
          <ColorField label="Background" value={bg} onChange={setBg} />
          <Button variant="ghost" onClick={() => { setFg(bg); setBg(fg); }}>Swap</Button>
        </Panel>
        <Panel className="p-5">
          <p className="pg-label">Contrast</p>
          <p className="mt-1 text-[44px] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">{r.toFixed(2)}<span className="text-[22px] text-ink/45">:1</span></p>
          <p className="mt-2 text-[15px] font-medium text-ink/70">{verdict}</p>
          <ul className="mt-4 flex flex-col divide-y divide-ink/8">
            {CHECKS.map(c => {
              const ok = r >= c.min;
              return (
                <li key={c.label + c.level} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-[14px] text-ink/80">{c.label} <span className="text-ink/45">· {c.level} {c.min}:1</span>{c.note && <span className="block text-[12px] text-ink/45">{c.note}</span>}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${ok ? 'bg-[#2f9e6a] text-white' : 'bg-[#e0533d]/12 text-[#b8432f]'}`}>{ok ? 'Pass' : 'Fail'}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-[24px] p-6 md:p-10" style={{ background: bg, color: fg, boxShadow: '0 30px 60px -40px rgba(15,30,55,.5), 0 0 0 1px rgba(23,25,30,.06)' }}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em]">Preview</p>
          <p className="mt-3 text-[clamp(28px,5vw,44px)] font-bold leading-[1.05] tracking-[-0.02em]">Large text reads at 3:1</p>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed">Body text needs 4.5:1. That is the line most people cross without noticing: light grey on off-white looks elegant on a calibrated screen and disappears on a phone in the sun.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full px-5 py-2.5 text-[14px] font-semibold" style={{ background: fg, color: bg }}>Button</span>
            <span className="rounded-full border-2 px-5 py-2 text-[14px] font-semibold" style={{ borderColor: fg }}>Outline</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.6 2.5L16 9.5" /></svg>
            <span className="text-[12px]">12px caption</span>
          </div>
        </div>

        {fixes.length > 0 ? (
          <Panel className="p-5">
            <p className="pg-label">Nearest passing text colour</p>
            <p className="mt-1 text-[14px] text-ink/60">Same hue and chroma, only as much lighter or darker as it needs to be.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {fixes.map(({ level, hex }) => hex ? (
                <div key={level} className="flex items-center gap-3 rounded-[16px] border border-ink/10 bg-white p-2.5">
                  <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-[11px] text-[15px] font-semibold" style={{ background: bg, color: hex }}>Aa</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-ink">{level} · {contrastRatio(hex, bg).toFixed(2)}:1</span>
                    <button type="button" onClick={() => copy(hex, hex)} className="font-mono text-[13px] uppercase text-ink/60 hover:text-ink">{hex}</button>
                  </span>
                  <Button variant="ghost" onClick={() => setFg(hex)}>Use</Button>
                </div>
              ) : (
                <p key={level} className="rounded-[16px] border border-ink/10 bg-white p-4 text-[14px] text-ink/60">No shade of this hue reaches {level} here; change the background instead.</p>
              ))}
            </div>
          </Panel>
        ) : (
          <Panel className="p-5"><p className="text-[15px] text-ink/70"><span className="font-semibold text-ink">Nothing to fix.</span> This pair passes AAA for every size.</p></Panel>
        )}
        <p className="px-1 text-[13px] text-ink/55">Contrast is the WCAG 2 ratio, worked out from the relative luminance of the two colours. The link in your address bar keeps these colours, so you can share a check.</p>
      </div>
    </div>
  );
}
