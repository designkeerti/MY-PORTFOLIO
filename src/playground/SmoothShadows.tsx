import { useState } from 'react';
import { Panel, Slider, Button, ColorField, Segmented, useCopy } from './ui';
import { hexToRgb } from './color';

/**
 * Layered shadows: several shadows that grow in offset and blur and fade as they spread, the
 * way real light falls off. One line of CSS, far softer than a single shadow.
 */

type Bg = 'paper' | 'sky' | 'ink';
const BGS: Record<Bg, string> = { paper: '#f7f6f2', sky: '#cfe6f4', ink: '#1a1a20' };

function layers(n: number, distance: number, blur: number, opacity: number, angle: number, curve: number, color: string) {
  const [r, g, b] = hexToRgb(color);
  const rad = (angle - 90) * Math.PI / 180, dx = Math.cos(rad), dy = Math.sin(rad);
  return Array.from({ length: n }, (_, k) => {
    const t = Math.pow((k + 1) / n, curve);                  // later layers reach further
    const a = (opacity / n) * (1.6 - 1.2 * ((k + 1) / n));   // and fade more
    const x = +(dx * distance * t).toFixed(1), y = +(dy * distance * t).toFixed(1), bl = +(blur * t).toFixed(1);
    return `${x}px ${y}px ${bl}px rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})`;
  });
}

export function SmoothShadows() {
  const [n, setN] = useState(6);
  const [distance, setDistance] = useState(40);
  const [blur, setBlur] = useState(80);
  const [opacity, setOpacity] = useState(0.35);
  const [angle, setAngle] = useState(180);
  const [curve, setCurve] = useState(1.8);
  const [color, setColor] = useState('#0f1e37');
  const [bg, setBg] = useState<Bg>('paper');
  const copy = useCopy();
  const list = layers(n, distance, blur, opacity, angle, curve, color);
  const shadow = list.join(',\n    ');
  const [r, g, b] = hexToRgb(color);
  const single = `0 ${Math.round(distance / 2)}px ${Math.round(blur / 2)}px rgba(${r}, ${g}, ${b}, ${+(opacity / 2).toFixed(3)})`;
  const card = bg === 'ink' ? '#26252d' : '#ffffff';

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 md:grid-cols-[320px_minmax(0,1fr)] md:gap-5 md:px-6">
      <Panel className="flex flex-col gap-4 self-start p-5">
        <Slider label="Layers" min={1} max={10} step={1} value={n} onChange={setN} />
        <Slider label="Distance" min={0} max={120} step={1} value={distance} onChange={setDistance} unit="px" />
        <Slider label="Blur" min={0} max={240} step={1} value={blur} onChange={setBlur} unit="px" />
        <Slider label="Strength" min={0.02} max={1} step={0.01} value={opacity} onChange={setOpacity} />
        <Slider label="Spread curve" min={1} max={3} step={0.1} value={curve} onChange={setCurve} />
        <Slider label="Light from" min={0} max={359} step={1} value={angle} onChange={setAngle} unit="°" />
        <ColorField label="Shadow colour" value={color} onChange={setColor} />
        <Segmented label="Background" value={bg} onChange={setBg} options={[{ value: 'paper', label: 'Paper' }, { value: 'sky', label: 'Sky' }, { value: 'ink', label: 'Ink' }]} />
      </Panel>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="grid gap-10 rounded-[24px] px-6 py-14 sm:grid-cols-2 sm:px-12 md:py-20" style={{ background: BGS[bg], boxShadow: '0 0 0 1px rgba(23,25,30,.06)' }}>
          {[{ label: `Layered · ${n}`, s: list.join(', ') }, { label: 'Single shadow', s: single }].map(c => (
            <div key={c.label} className="flex flex-col items-center gap-4">
              <div className="aspect-[4/3] w-full max-w-[260px] rounded-[22px]" style={{ background: card, boxShadow: c.s }} />
              <p className={`text-[13px] ${bg === 'ink' ? 'text-white/60' : 'text-ink/55'}`}>{c.label}</p>
            </div>
          ))}
        </div>
        <Panel className="flex flex-col p-5">
          <p className="pg-label">CSS</p>
          <pre className="mt-3 max-h-[240px] overflow-auto rounded-[14px] bg-[#17191e] p-4 font-mono text-[12px] leading-relaxed text-[#f1ece4]">{`box-shadow:\n    ${shadow};`}</pre>
          <Button className="mt-3" onClick={() => copy(`box-shadow:\n    ${shadow};`, 'box-shadow')}>Copy CSS</Button>
        </Panel>
      </div>
    </div>
  );
}
