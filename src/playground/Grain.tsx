import { useEffect, useRef, useState } from 'react';
import { Panel, Slider, Button, Segmented, useCopy } from './ui';

/**
 * A seamless grain tile: random noise you can lay over gradients and photos for a printed,
 * filmic feel. Download it as a PNG and use it with the CSS below.
 */

const BACKDROPS = {
  sky: 'linear-gradient(160deg, #1f78bd, #8fcbef 55%, #f7f6f2)',
  ember: 'linear-gradient(160deg, #120c0a, #ff6a2a 60%, #ffd27a)',
  violet: 'linear-gradient(160deg, #0e0a1c, #8b5cf6 60%, #f4f2f8)',
};

export function Grain() {
  const [size, setSize] = useState(256);
  const [amount, setAmount] = useState(0.55);
  const [grainSize, setGrainSize] = useState(1);
  const [mono, setMono] = useState<'mono' | 'colour'>('mono');
  const [show, setShow] = useState(0.28);
  const [backdrop, setBackdrop] = useState<keyof typeof BACKDROPS>('sky');
  const [url, setUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copy = useCopy();

  useEffect(() => {
    const c = canvasRef.current!; c.width = size; c.height = size;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(size, size), d = img.data, cell = grainSize;
    for (let y = 0; y < size; y += cell) for (let x = 0; x < size; x += cell) {
      const v = (Math.random() - 0.5) * 255 * amount;
      const rgb = mono === 'mono' ? [v, v, v] : [v, (Math.random() - 0.5) * 255 * amount, (Math.random() - 0.5) * 255 * amount];
      for (let yy = y; yy < Math.min(size, y + cell); yy++) for (let xx = x; xx < Math.min(size, x + cell); xx++) {
        const i = (yy * size + xx) * 4;
        d[i] = 128 + rgb[0]; d[i + 1] = 128 + rgb[1]; d[i + 2] = 128 + rgb[2]; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    c.toBlob(b => { if (!b) return; setUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(b); }); }, 'image/png');
  }, [size, amount, grainSize, mono]);

  const css = `.grain {\n  position: relative;\n}\n.grain::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background: url("grain.png");\n  background-size: ${size / 2}px;\n  mix-blend-mode: overlay;\n  opacity: ${+show.toFixed(2)};\n  pointer-events: none;\n}`;
  const download = () => { const a = document.createElement('a'); a.href = url; a.download = 'grain.png'; a.click(); };

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 md:grid-cols-[minmax(0,1fr)_320px] md:gap-5 md:px-6">
      <div className="relative self-start overflow-hidden rounded-[24px] border border-white/80 shadow-[0_30px_60px_-36px_rgba(15,30,55,0.55)]">
        <div className="aspect-[4/5] w-full sm:aspect-[16/10]" style={{ background: BACKDROPS[backdrop] }} />
        {url && <div className="absolute inset-0" style={{ backgroundImage: `url(${url})`, backgroundSize: `${size / 2}px`, mixBlendMode: 'overlay', opacity: show }} />}
        <p className="absolute bottom-4 left-5 text-[clamp(28px,5vw,52px)] font-semibold leading-none tracking-[-0.02em] text-white mix-blend-overlay">Grain</p>
      </div>
      <Panel className="flex flex-col gap-4 self-start p-5">
        <canvas ref={canvasRef} className="hidden" />
        <Slider label="Grain amount" min={0.1} max={1} step={0.01} value={amount} onChange={setAmount} />
        <Slider label="Grain size" min={1} max={4} step={1} value={grainSize} onChange={setGrainSize} unit="px" />
        <Slider label="Tile size" min={64} max={512} step={64} value={size} onChange={setSize} unit="px" />
        <Slider label="Opacity on the preview" min={0.05} max={0.8} step={0.01} value={show} onChange={setShow} />
        <Segmented label="Noise" value={mono} onChange={setMono} options={[{ value: 'mono', label: 'Mono' }, { value: 'colour', label: 'Colour' }]} />
        <Segmented label="Backdrop" value={backdrop} onChange={setBackdrop} options={[{ value: 'sky', label: 'Sky' }, { value: 'ember', label: 'Ember' }, { value: 'violet', label: 'Violet' }]} />
        <div className="flex flex-wrap gap-2">
          <Button onClick={download}>Download PNG</Button>
          <Button variant="ghost" onClick={() => copy(css, 'CSS')}>Copy CSS</Button>
        </div>
        <p className="text-[13px] leading-relaxed text-ink/55">The tile repeats seamlessly. Shown at half size, so it stays crisp on high-density screens.</p>
      </Panel>
    </div>
  );
}
