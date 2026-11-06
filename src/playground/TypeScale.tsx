import { useEffect, useState } from 'react';
import { Panel, Slider, Button, Select, Segmented, useCopy } from './ui';
import { FONTS, fontByName, fallbackFor, loadFont } from './data';

/**
 * A fluid modular scale: a base size and ratio for a small screen and for a large one, and
 * every step grows smoothly between them as a CSS clamp(). Drag the width to see it move.
 */

const RATIOS = [
  { value: '1.067', label: 'Minor second · 1.067' }, { value: '1.125', label: 'Major second · 1.125' },
  { value: '1.2', label: 'Minor third · 1.2' }, { value: '1.25', label: 'Major third · 1.25' },
  { value: '1.333', label: 'Perfect fourth · 1.333' }, { value: '1.414', label: 'Augmented fourth · 1.414' },
  { value: '1.5', label: 'Perfect fifth · 1.5' }, { value: '1.618', label: 'Golden ratio · 1.618' },
];
const NAMES: Record<number, string> = { [-2]: 'xs', [-1]: 'sm', 0: 'base', 1: 'lg', 2: 'xl', 3: '2xl', 4: '3xl', 5: '4xl', 6: '5xl', 7: '6xl' };
const rem = (px: number) => +(px / 16).toFixed(4);

export function TypeScale() {
  const [minVw, setMinVw] = useState(360), [maxVw, setMaxVw] = useState(1280);
  const [minBase, setMinBase] = useState(16), [maxBase, setMaxBase] = useState(19);
  const [minRatio, setMinRatio] = useState('1.2'), [maxRatio, setMaxRatio] = useState('1.333');
  const [up, setUp] = useState(5);
  const [width, setWidth] = useState(1024);
  const [fontName, setFontName] = useState('Sofia Sans');
  const [format, setFormat] = useState<'css' | 'tailwind'>('css');
  const copy = useCopy();
  const font = fontByName(fontName)!;
  useEffect(() => { loadFont(font); }, [font]);

  const steps = Array.from({ length: up + 3 }, (_, i) => i - 2).map(i => {
    const a = minBase * Math.pow(+minRatio, i), b = maxBase * Math.pow(+maxRatio, i);
    const slope = (b - a) / (maxVw - minVw), at0 = a - slope * minVw;
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const clamp = `clamp(${rem(lo)}rem, ${rem(at0)}rem + ${+(slope * 100).toFixed(4)}vw, ${rem(hi)}rem)`;
    const now = Math.min(hi, Math.max(lo, at0 + slope * width));
    return { i, name: NAMES[i] ?? String(i), a, b, clamp, now };
  }).reverse();

  const exported = () => format === 'css'
    ? `:root {\n${[...steps].reverse().map(s => `  --step-${s.i}: ${s.clamp}; /* ${s.a.toFixed(1)}px → ${s.b.toFixed(1)}px */`).join('\n')}\n}`
    : `// tailwind.config.js > theme.extend.fontSize\n${[...steps].reverse().map(s => `'${s.name}': '${s.clamp}',`).join('\n')}`;

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 md:grid-cols-[320px_minmax(0,1fr)] md:gap-5 md:px-6">
      <div className="flex flex-col gap-4 self-start">
        <Panel className="flex flex-col gap-4 p-5">
          <p className="text-[14px] font-semibold text-ink">Small screen <span className="font-normal text-ink/50">at {minVw}px</span></p>
          <Slider label="Base size" min={12} max={22} step={0.5} value={minBase} onChange={setMinBase} unit="px" />
          <Select label="Ratio" value={minRatio} onChange={setMinRatio} options={RATIOS} />
          <div className="h-px bg-ink/8" />
          <p className="text-[14px] font-semibold text-ink">Large screen <span className="font-normal text-ink/50">at {maxVw}px</span></p>
          <Slider label="Base size" min={12} max={26} step={0.5} value={maxBase} onChange={setMaxBase} unit="px" />
          <Select label="Ratio" value={maxRatio} onChange={setMaxRatio} options={RATIOS} />
          <div className="h-px bg-ink/8" />
          <Slider label="Small screen width" min={320} max={600} step={10} value={minVw} onChange={setMinVw} unit="px" />
          <Slider label="Large screen width" min={900} max={1920} step={10} value={maxVw} onChange={setMaxVw} unit="px" />
          <Slider label="Steps up" min={3} max={7} step={1} value={up} onChange={setUp} />
          <Select label="Preview font" value={fontName} onChange={setFontName} options={FONTS.filter(f => f.cat !== 'mono').map(f => ({ value: f.name, label: f.name }))} />
        </Panel>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <Panel className="p-5">
          <Slider label="Preview at screen width" min={minVw} max={maxVw} step={1} value={Math.min(maxVw, Math.max(minVw, width))} onChange={setWidth} unit="px" />
          <ul className="mt-4 flex flex-col">
            {steps.map(s => (
              <li key={s.i} className="flex items-baseline gap-4 border-t border-ink/8 py-3 first:border-t-0">
                <span className="w-[74px] shrink-0">
                  <span className="block text-[13px] font-semibold text-ink">{s.name}</span>
                  <span className="block font-mono text-[11px] tabular-nums text-ink/50">{s.now.toFixed(1)}px</span>
                </span>
                <span className="min-w-0 truncate text-ink" style={{ fontFamily: `"${font.name}", ${fallbackFor(font.cat)}`, fontSize: s.now, lineHeight: 1.1, fontWeight: s.i >= 2 ? 600 : 400, letterSpacing: s.i >= 3 ? '-0.02em' : undefined }}>
                  {s.i >= 3 ? 'Headlines that scale' : s.i >= 1 ? 'A subheading with room' : 'Body text and small print, set to read well.'}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="flex flex-col p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="pg-label">Export</p>
            <Segmented value={format} onChange={setFormat} options={[{ value: 'css', label: 'CSS variables' }, { value: 'tailwind', label: 'Tailwind' }]} />
          </div>
          <pre className="mt-3 max-h-[260px] overflow-auto rounded-[14px] bg-[#17191e] p-4 font-mono text-[12px] leading-relaxed text-[#f1ece4]">{exported()}</pre>
          <Button className="mt-3" onClick={() => copy(exported(), format === 'css' ? 'CSS' : 'Tailwind config')}>Copy</Button>
        </Panel>
      </div>
    </div>
  );
}
