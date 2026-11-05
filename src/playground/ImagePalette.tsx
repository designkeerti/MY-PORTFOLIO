import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Panel, Button, Segmented, useCopy } from './ui';
import { oklabToHex, readableOn, rgbToOklab } from './color';

/**
 * The colours of a picture: k-means in OKLab over a small copy of the image, so similar
 * colours merge the way the eye merges them. Everything happens in the browser.
 */

type Swatch = { hex: string; share: number };

function extract(img: HTMLImageElement, k: number): Swatch[] {
  const max = 140, scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale)), h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const px: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 200) px.push(rgbToOklab(data[i], data[i + 1], data[i + 2]));
  if (!px.length) return [];
  // k-means++ start: spread the first centres out
  const dist = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  const centres: number[][] = [px[Math.floor(px.length / 2)].slice()];
  while (centres.length < k) {
    let far = 0, farD = -1;
    for (let i = 0; i < px.length; i += 7) { const d = Math.min(...centres.map(c => dist(px[i], c))); if (d > farD) { farD = d; far = i; } }
    centres.push(px[far].slice());
  }
  const owner = new Int32Array(px.length);
  for (let iter = 0; iter < 12; iter++) {
    const sum = centres.map(() => [0, 0, 0, 0]);
    px.forEach((p, i) => {
      let best = 0, bd = Infinity;
      centres.forEach((c, j) => { const d = dist(p, c); if (d < bd) { bd = d; best = j; } });
      owner[i] = best; const s = sum[best]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++;
    });
    sum.forEach((s, j) => { if (s[3]) centres[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
  }
  const counts = centres.map(() => 0); owner.forEach(o => counts[o]++);
  return centres.map((c, j) => ({ hex: oklabToHex(c[0], c[1], c[2]), share: counts[j] / px.length }))
    .filter(s => s.share > 0.004).sort((a, b) => b.share - a.share);
}

export function ImagePalette() {
  const [src, setSrc] = useState('/world/bougainvillea-sky.jpg');
  const [k, setK] = useState<'5' | '6' | '8'>('6');
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const copy = useCopy();

  useEffect(() => {
    const img = new Image();
    img.onload = () => setSwatches(extract(img, Number(k)));
    img.src = src;
  }, [src, k]);

  const take = (f?: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    if (src.startsWith('blob:')) URL.revokeObjectURL(src);
    setSrc(URL.createObjectURL(f));
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files?.[0]); };
  const css = () => `:root {\n${swatches.map((s, i) => `  --image-${i + 1}: ${s.hex}; /* ${Math.round(s.share * 100)}% */`).join('\n')}\n}`;

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-5 md:px-6">
      <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className={`relative self-start overflow-hidden rounded-[24px] border bg-white/60 p-2 shadow-[0_30px_60px_-36px_rgba(15,30,55,0.55)] transition-colors ${drag ? 'border-ink' : 'border-white/80'}`}>
        <img src={src} alt="The picture the colours come from" className="block max-h-[70svh] w-full rounded-[18px] object-cover" />
        <div className="mt-2 flex h-12 overflow-hidden rounded-[14px]">
          {swatches.map(s => <span key={s.hex} style={{ background: s.hex, flexGrow: s.share }} />)}
        </div>
        {drag && <div className="absolute inset-2 flex items-center justify-center rounded-[18px] bg-ink/60 text-[16px] font-medium text-white">Drop to use this picture</div>}
      </div>
      <div className="flex flex-col gap-4 self-start">
        <Panel className="flex flex-col gap-4 p-5">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => take(e.target.files?.[0])} />
          <Button onClick={() => fileRef.current?.click()}>Choose a picture</Button>
          <p className="-mt-1 text-[13px] text-ink/55">Or drop one on the frame. Your picture never leaves your device.</p>
          <Segmented label="Colours" value={k} onChange={setK} options={[{ value: '5', label: '5' }, { value: '6', label: '6' }, { value: '8', label: '8' }]} />
        </Panel>
        <Panel className="p-2">
          <ul className="flex flex-col gap-1">
            {swatches.map(s => (
              <li key={s.hex}>
                <button type="button" onClick={() => copy(s.hex, s.hex)} className="flex w-full items-center gap-3 rounded-[14px] p-2 text-left transition-colors hover:bg-white">
                  <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-[10px] text-[11px] font-semibold" style={{ background: s.hex, color: readableOn(s.hex) }}>{Math.round(s.share * 100)}%</span>
                  <span className="font-mono text-[14px] uppercase text-ink">{s.hex}</span>
                  <span className="ml-auto text-[12px] text-ink/45">Copy</span>
                </button>
              </li>
            ))}
          </ul>
          <Button variant="ghost" className="m-2 mt-1" onClick={() => copy(css(), 'CSS')}>Copy as CSS variables</Button>
        </Panel>
      </div>
    </div>
  );
}
