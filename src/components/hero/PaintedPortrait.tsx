import { useEffect, useRef } from 'react';

/**
 * Paints a photo onto a canvas with bristle brush strokes, the way a painter
 * would: a coloured underpainting first (one stroke per tool), then the photo
 * itself, broad strokes to fine ones, then a glaze that fills the gaps while
 * leaving the bristle texture on the edges.
 *
 * Everything is procedural and seeded, so it paints the same way every time.
 */

type Pt = [number, number];
type Kind = 'color' | 'photo';
type Stroke = {
  kind: Kind;
  color?: string;
  tool?: number;
  /** centreline, normalised 0..1 canvas coords */
  path: Pt[];
  /** width as a fraction of canvas width */
  w: number;
  start: number; // ms
  dur: number; // ms
  seed: number;
};

type Props = {
  src: string;
  /** colours of the underpainting, one stroke per tool, in order */
  toolColors: string[];
  /** fired when the underpainting stroke for tool i starts */
  onToolStroke?: (i: number) => void;
  /** fired once the painting has finished */
  onDone?: () => void;
  /** skip the animation and show the finished painting */
  instant?: boolean;
  /** which part of the photo to keep in frame, like object-position */
  focus?: [number, number];
  className?: string;
  label: string;
};

// ---------- seeded randomness ----------
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A gently curved stroke from a start point, heading and length.
function curve(r: () => number, x: number, y: number, ang: number, len: number, bend: number): Pt[] {
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const nx = -dy, ny = dx;
  const pts: Pt[] = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const b = Math.sin(t * Math.PI) * bend * len;
    const j = (r() - 0.5) * 0.01;
    pts.push([x + dx * len * (t - 0.5) + nx * b + j, y + dy * len * (t - 0.5) + ny * b + j]);
  }
  return pts;
}

function buildStrokes(toolColors: string[]): Stroke[] {
  const r = rng(20261104);
  const out: Stroke[] = [];
  const deg = Math.PI / 180;

  // 1. Underpainting: one broad sweep per tool, top to bottom.
  const bands = [0.2, 0.43, 0.66, 0.86];
  toolColors.forEach((color, i) => {
    const y = bands[i % bands.length];
    const ang = (i % 2 ? -1 : 1) * (4 + r() * 6) * deg;
    out.push({ kind: 'color', color, tool: i, path: curve(r, 0.5 + (r() - 0.5) * 0.08, y, ang, 1.18, (r() - 0.5) * 0.12), w: 0.24, start: i * 260, dur: 620, seed: 100 + i });
  });

  let t = toolColors.length * 260 + 380;

  // 2. Photo, broad: blocks in the whole figure.
  for (let i = 0; i < 18; i++) {
    const y = 0.08 + (i / 17) * 0.86 + (r() - 0.5) * 0.05;
    const x = 0.5 + (r() - 0.5) * 0.16;
    const ang = (r() - 0.5) * 34 * deg;
    out.push({ kind: 'photo', path: curve(r, x, y, ang, 0.72 + r() * 0.3, (r() - 0.5) * 0.18), w: 0.15, start: t, dur: 380, seed: 200 + i });
    t += 70;
  }
  t += 120;

  // 3. Photo, mid: head and shoulders.
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    const x = 0.5 + Math.cos(a) * d * 0.36;
    const y = 0.46 + Math.sin(a) * d * 0.4;
    const ang = (r() - 0.5) * 120 * deg;
    out.push({ kind: 'photo', path: curve(r, x, y, ang, 0.26 + r() * 0.2, (r() - 0.5) * 0.3), w: 0.08, start: t, dur: 300, seed: 300 + i });
    t += 45;
  }
  t += 80;

  // 4. Photo, detail: the face.
  for (let i = 0; i < 30; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    const x = 0.55 + Math.cos(a) * d * 0.2;
    const y = 0.36 + Math.sin(a) * d * 0.2;
    const ang = r() * Math.PI;
    out.push({ kind: 'photo', path: curve(r, x, y, ang, 0.1 + r() * 0.1, (r() - 0.5) * 0.4), w: 0.04, start: t, dur: 220, seed: 400 + i });
    t += 32;
  }

  // Strokes are laid out in a slightly oversized space (-0.1..1.1) and then
  // fitted inside the canvas with a margin, so no stroke is ever cut off by
  // the canvas edge: the outline of the painting is all brush.
  const fit = (v: number) => 0.035 + ((v + 0.1) / 1.2) * 0.93;
  out.forEach(st => { st.path = st.path.map(([x, y]) => [fit(x), fit(y)] as Pt); st.w *= 0.93 / 1.2 * 1.18; });
  return out;
}

// Catmull-Rom resample of a stroke's centreline, with unit normals.
function sample(path: Pt[], n: number) {
  const pts: { x: number; y: number; nx: number; ny: number }[] = [];
  const P = (i: number) => path[Math.max(0, Math.min(path.length - 1, i))];
  for (let k = 0; k <= n; k++) {
    const u = (k / n) * (path.length - 1);
    const i = Math.floor(Math.min(u, path.length - 1.0001));
    const f = u - i;
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    const cr = (a: number, b: number, c: number, d: number) =>
      0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
    pts.push({ x: cr(p0[0], p1[0], p2[0], p3[0]), y: cr(p0[1], p1[1], p2[1], p3[1]), nx: 0, ny: 0 });
  }
  for (let k = 0; k < pts.length; k++) {
    const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    pts[k].nx = -dy / l; pts[k].ny = dx / l;
  }
  return pts;
}

type Bristle = { off: number; width: number; shade: number; s: number; e: number };

function bristles(seed: number, n: number): Bristle[] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, j) => ({
    off: (j / (n - 1) - 0.5) + (r() - 0.5) * 0.04,
    width: 0.6 + r() * 0.9,
    shade: (r() - 0.5) * 0.28, // each bristle carries slightly lighter or darker paint
    s: r() * 0.08, // bristles touch down at slightly different moments
    e: 0.72 + r() * 0.28, // and run dry at different lengths
  }));
}

function shadeHex(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

const SAMPLES = 48;
const pressure = (t: number) => 0.62 + 0.38 * Math.sin(Math.min(1, t * 1.15) * Math.PI);
const ease = (t: number) => 1 - Math.pow(1 - t, 2.2);

export function PaintedPortrait({ src, toolColors, onToolStroke, onDone, instant, focus = [0.5, 0.4], className, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cb = useRef({ onToolStroke, onDone });
  cb.current = { onToolStroke, onDone };

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skip = instant || reduce;
    const strokes = buildStrokes(toolColors);
    const glazeAt = Math.max(...strokes.map(s => s.start + s.dur)) + 60;
    const GLAZE = 700;
    const fired = new Set<number>();
    let raf = 0, t0 = 0, done = false, cancelled = false;
    let io: IntersectionObserver | undefined;

    const img = new Image();
    img.decoding = 'async';
    img.src = src;

    // Off-screen layers, rebuilt on resize.
    let W = 0, H = 0;
    let photo: HTMLCanvasElement, paint: HTMLCanvasElement, glaze: HTMLCanvasElement;
    let pattern: CanvasPattern | null = null;
    // Centrelines are resampled in pixel space on every setup, so normals stay true at any aspect ratio.
    const geo = strokes.map(s => ({ pts: [] as ReturnType<typeof sample>, br: bristles(s.seed, s.kind === 'color' ? 26 : s.w > 0.1 ? 22 : 14), drawn: 0 }));

    const layer = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };

    function setup() {
      const rect = wrap!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(2, Math.round(rect.width * dpr));
      H = Math.max(2, Math.round(rect.height * dpr));
      canvas!.width = W; canvas!.height = H;

      // Photo, cover-fitted around the focus point.
      photo = layer();
      const pc = photo.getContext('2d')!;
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const iw = img.naturalWidth * s, ih = img.naturalHeight * s;
      pc.drawImage(img, (W - iw) * focus[0], (H - ih) * focus[1], iw, ih);

      paint = layer();
      glaze = layer();
      geo.forEach((g, i) => { g.pts = sample(strokes[i].path.map(([x, y]) => [x * W, y * H] as Pt), SAMPLES); g.drawn = 0; });
      pattern = paint.getContext('2d')!.createPattern(photo, 'no-repeat');

      // The glaze is the photo, masked by the cores of every photo stroke.
      const gc = glaze.getContext('2d')!;
      gc.lineCap = 'round'; gc.lineJoin = 'round'; gc.strokeStyle = '#000';
      strokes.forEach((st, i) => {
        if (st.kind !== 'photo') return;
        const pts = geo[i].pts;
        gc.lineWidth = st.w * W * 0.72;
        gc.beginPath();
        pts.forEach((p, k) => (k ? gc.lineTo(p.x, p.y) : gc.moveTo(p.x, p.y)));
        gc.stroke();
      });
      gc.globalCompositeOperation = 'source-in';
      gc.drawImage(photo, 0, 0);
    }

    // Draw the part of a stroke between its last drawn progress and `to`.
    function paintStroke(i: number, to: number) {
      const st = strokes[i], g = geo[i];
      if (to <= g.drawn) return;
      const pc = paint.getContext('2d')!;
      pc.lineCap = 'round'; pc.lineJoin = 'round';
      const width = st.w * W;
      const n = g.br.length;
      for (const b of g.br) {
        const from = Math.max(g.drawn, b.s), end = Math.min(to, b.e);
        if (end <= from) continue;
        const k0 = Math.floor(from * SAMPLES), k1 = Math.ceil(end * SAMPLES);
        pc.strokeStyle = st.kind === 'photo' && pattern ? pattern : shadeHex(st.color!, b.shade);
        pc.lineWidth = (width / n) * b.width * 1.9;
        pc.beginPath();
        for (let k = k0; k <= k1; k++) {
          const p = g.pts[k];
          const tk = k / SAMPLES;
          const o = b.off * width * pressure(tk);
          const x = p.x + p.nx * o, y = p.y + p.ny * o;
          if (k === k0) pc.moveTo(x, y); else pc.lineTo(x, y);
        }
        pc.stroke();
      }
      g.drawn = to;
    }

    function compose(glazeAlpha: number) {
      ctx!.clearRect(0, 0, W, H);
      ctx!.drawImage(paint, 0, 0);
      if (glazeAlpha > 0) { ctx!.globalAlpha = glazeAlpha; ctx!.drawImage(glaze, 0, 0); ctx!.globalAlpha = 1; }
    }

    function finishInstantly() {
      strokes.forEach((_, i) => paintStroke(i, 1));
      compose(1);
      toolColors.forEach((_, i) => { if (!fired.has(i)) { fired.add(i); cb.current.onToolStroke?.(i); } });
      if (!done) { done = true; cb.current.onDone?.(); }
    }

    function frame(now: number) {
      if (cancelled) return;
      if (!t0) t0 = now;
      const t = now - t0;
      strokes.forEach((st, i) => {
        if (t < st.start) return;
        if (st.kind === 'color' && st.tool !== undefined && !fired.has(st.tool)) { fired.add(st.tool); cb.current.onToolStroke?.(st.tool); }
        paintStroke(i, ease(Math.min(1, (t - st.start) / st.dur)));
      });
      const ga = Math.max(0, Math.min(1, (t - glazeAt) / GLAZE));
      compose(ga);
      if (ga < 1) raf = requestAnimationFrame(frame);
      else if (!done) { done = true; cb.current.onDone?.(); }
    }

    const ro = new ResizeObserver(() => {
      if (!img.complete || !img.naturalWidth) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (Math.round(rect.width * dpr) === W && Math.round(rect.height * dpr) === H) return;
      // A resize mid-painting just jumps to the finished painting.
      cancelAnimationFrame(raf);
      setup();
      finishInstantly();
    });

    img.onload = () => {
      if (cancelled) return;
      setup();
      ro.observe(wrap);
      if (skip) { finishInstantly(); return; }
      // Start painting only once the canvas is actually on screen (on phones it sits below the fold).
      io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { io?.disconnect(); raf = requestAnimationFrame(frame); }
      }, { threshold: 0.35 });
      io.observe(wrap);
    };

    return () => { cancelled = true; cancelAnimationFrame(raf); ro.disconnect(); io?.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, instant]);

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={canvasRef} role="img" aria-label={label} className="block w-full h-full" />
    </div>
  );
}
