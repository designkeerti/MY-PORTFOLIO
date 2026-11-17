import { useMemo, useState } from 'react';
import { Panel, Button, ColorField, Segmented, useCopy } from './ui';
import { contrastRatio, hexToOklch, oklchToHex, readableOn } from './color';

/**
 * One colour in, an 11-step scale out (50..950), built in OKLCH so the steps look evenly spaced.
 * Your colour sits on the step nearest its lightness; chroma tapers towards white and black.
 */

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const LIGHTNESS = [0.975, 0.94, 0.885, 0.81, 0.72, 0.635, 0.55, 0.465, 0.38, 0.295, 0.215];

function buildScale(base: string) {
  const [L, C, H] = hexToOklch(base);
  const nearest = LIGHTNESS.reduce((best, l, i) => (Math.abs(l - L) < Math.abs(LIGHTNESS[best] - L) ? i : best), 0);
  return STEPS.map((step, i) => {
    if (i === nearest) return { step, hex: base, base: true };
    const l = LIGHTNESS[i];
    // chroma eases off away from the base lightness, more so towards white
    const away = Math.abs(l - L) / (l > L ? 1 - L + 0.001 : L + 0.001);
    const c = C * (1 - 0.82 * Math.pow(Math.min(1, away), l > L ? 1.1 : 1.6));
    return { step, hex: oklchToHex(l, Math.max(0, c), H), base: false };
  });
}

const HARMONIES = [
  { name: 'Complementary', turns: [180] },
  { name: 'Analogous', turns: [-30, 30] },
  { name: 'Triadic', turns: [120, 240] },
  { name: 'Split complementary', turns: [150, 210] },
];

type Format = 'css' | 'tailwind' | 'json';

export function ColourScales() {
  const [base, setBase] = useState('#2c8bc6');
  const [name, setName] = useState('brand');
  const [format, setFormat] = useState<Format>('css');
  const copy = useCopy();
  const scale = useMemo(() => buildScale(base), [base]);
  const [L, C, H] = hexToOklch(base);
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'brand';

  const exported = () => {
    if (format === 'css') return `:root {\n${scale.map(s => `  --${slug}-${s.step}: ${s.hex};`).join('\n')}\n}`;
    if (format === 'tailwind') return `// tailwind.config.js > theme.extend.colors\n'${slug}': {\n${scale.map(s => `  ${s.step}: '${s.hex}',`).join('\n')}\n},`;
    return JSON.stringify({ [slug]: Object.fromEntries(scale.map(s => [s.step, s.hex])) }, null, 2);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-4 md:gap-5 md:px-6">
      <div className="grid gap-4 md:grid-cols-[320px_minmax(0,1fr)] md:gap-5">
        <Panel className="flex flex-col gap-4 self-start p-5">
          <ColorField label="Base colour" value={base} onChange={setBase} />
          <label className="flex flex-col gap-1.5">
            <span className="pg-label">Name</span>
            <input value={name} onChange={e => setName(e.target.value)} spellCheck={false}
              className="rounded-[14px] border border-ink/14 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none" />
          </label>
          <p className="font-mono text-[12px] text-ink/50">oklch({(L * 100).toFixed(1)}% {C.toFixed(3)} {H.toFixed(0)})</p>
        </Panel>
        <Panel className="overflow-hidden p-2">
          <div className="grid grid-cols-6 gap-1 sm:grid-cols-11">
            {scale.map(s => {
              const ink = readableOn(s.hex), on = contrastRatio(s.hex, ink);
              return (
                <button key={s.step} type="button" onClick={() => copy(s.hex, s.hex)} title={`Copy ${s.hex}`}
                  className={`group flex min-h-[112px] flex-col justify-between rounded-[12px] p-2 text-left transition-transform hover:-translate-y-0.5 sm:min-h-[150px] ${s.base ? 'ring-2 ring-ink ring-offset-2 ring-offset-white' : ''}`}
                  style={{ background: s.hex, color: ink }}>
                  <span className="text-[13px] font-semibold">{s.step}</span>
                  <span>
                    <span className="block font-mono text-[10.5px] uppercase opacity-80">{s.hex}</span>
                    <span className="block text-[10.5px] opacity-70">{on.toFixed(1)}:1</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-5">
        <Panel className="p-5">
          <p className="pg-label">Harmonies</p>
          <div className="mt-3 flex flex-col gap-3">
            {HARMONIES.map(h => (
              <div key={h.name} className="flex items-center gap-3">
                <span className="w-[150px] shrink-0 text-[14px] text-ink/70">{h.name}</span>
                <div className="flex flex-1 gap-1.5">
                  {[base, ...h.turns.map(t => oklchToHex(L, C, (H + t + 360) % 360))].map((hex, i) => (
                    <button key={i} type="button" onClick={() => copy(hex, hex)} title={`Copy ${hex}`}
                      className="flex h-12 flex-1 items-end rounded-[10px] p-1.5 font-mono text-[10px] uppercase" style={{ background: hex, color: readableOn(hex) }}>{hex}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="flex flex-col p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="pg-label">Export</p>
            <Segmented value={format} onChange={setFormat} options={[{ value: 'css', label: 'CSS' }, { value: 'tailwind', label: 'Tailwind' }, { value: 'json', label: 'JSON' }]} />
          </div>
          <pre className="mt-3 max-h-[260px] flex-1 overflow-auto rounded-[14px] bg-[#17191e] p-4 font-mono text-[12.5px] leading-relaxed text-[#f1ece4]">{exported()}</pre>
          <Button className="mt-3" onClick={() => copy(exported(), format === 'css' ? 'CSS' : format === 'tailwind' ? 'Tailwind config' : 'JSON')}>Copy</Button>
        </Panel>
      </div>
    </div>
  );
}
