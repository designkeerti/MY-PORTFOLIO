import { useEffect, useRef } from 'react';

/**
 * Paints a photo onto a canvas with bristle brush strokes, the way a painter
 * would: broad strokes to block in the figure, then shorter ones, then fine
 * strokes on the face, then a glaze that fills the gaps while leaving the
 * bristle texture on the edges. Only the photo is painted: no added colour.
 *
 * All strokes run at one angle, like a single deliberate hand, with tapered,
 * frayed ends. Everything is seeded, so it paints the same way every time.
 */

type Pt = [number, number];
type Stroke = {
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
  /** how many cues to fire while painting (e.g. one per card that should land) */
  cues?: number;
  /** fired at evenly spaced moments through the painting */
  onCue?: (i: number) => void;
  /** fired once the painting has finished */
  onDone?: () => void;
  /** skip the animation and show the finished painting */
  instant?: boolean;
  /** which part of the photo to keep in frame, like object-position */
  focus?: [number, number];
  /** where the fine detail strokes go, in canvas coords: [cx, cy, radius] */
  detail?: [number, number, number];
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

// A gently curved stroke centred on (x, y), with a heading and length.
function curve(r: () => number, x: number, y: number, ang: number, len: number, bend: number): Pt[] {
  const dx = Math.cos(ang), dy = Math.sin(ang);
  const nx = -dy, ny = dx;
  const pts: Pt[] = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const b = Math.sin(t * Math.PI) * bend * len;
    const j = (r() - 0.5) * 0.006;
    pts.push([x + dx * len * (t - 0.5) + nx * b + j, y + dy * len * (t - 0.5) + ny * b + j]);
  }
  return pts;
}

// The painter's hand: every stroke leans at about this angle.
const HAND = -13 * (Math.PI / 180);

function buildStrokes(detail: [number, number, number]): Stroke[] {
  const r = rng(20261104);
  const out: Stroke[] = [];
  const deg = Math.PI / 180;
  let t = 0;

  // 1. Broad: rows across the whole canvas, blocking in the figure.
  const rows = 15;
  for (let i = 0; i < rows; i++) {
    const y = 0.05 + (i / (rows - 1)) * 0.9 + (r() - 0.5) * 0.03;
    // Stagger where each row starts and ends, so the edges are uneven like
    // real brushwork rather than a clean slanted slab.
    const len = 0.7 + r() * 0.34;
    const x = 0.5 + (r() - 0.5) * (1.06 - len) * 1.4;
    out.push({ path: curve(r, x, y, HAND + (r() - 0.5) * 12 * deg, len, (r() - 0.5) * 0.08), w: 0.15, start: t, dur: 440, seed: 200 + i });
    t += 85;
  }
  t += 100;

  // 2. Mid: head and shoulders.
  for (let i = 0; i < 24; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    const x = 0.52 + Math.cos(a) * d * 0.34;
    const y = 0.42 + Math.sin(a) * d * 0.36;
    out.push({ path: curve(r, x, y, HAND + (r() - 0.5) * 18 * deg, 0.3 + r() * 0.16, (r() - 0.5) * 0.1), w: 0.08, start: t, dur: 320, seed: 300 + i });
    t += 48;
  }
  t += 80;

  // 3. Detail: the face (and whoever else is in it).
  for (let i = 0; i < 28; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    const x = detail[0] + Math.cos(a) * d * detail[2];
    const y = detail[1] + Math.sin(a) * d * detail[2];
    out.push({ path: curve(r, x, y, HAND + (r() - 0.5) * 30 * deg, 0.1 + r() * 0.08, (r() - 0.5) * 0.15), w: 0.04, start: t, dur: 230, seed: 400 + i });
    t += 30;
  }

  // Laid out in a slightly oversized space (-0.1..1.1), then fitted inside the
  // canvas with a margin: no stroke is cut off by the canvas edge, so the
  // outline of the painting is all brush.
  const fit = (v: number) => 0.03 + ((v + 0.1) / 1.2) * 0.94;
  out.forEach(st => { st.path = st.path.map(([x, y]) => [fit(x), fit(y)] as Pt); st.w *= 0.94 / 1.2 * 1.18; });
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

type Bristle = { off: number; width: number; s: number; e: number };

function bristles(seed: number, n: number): Bristle[] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, j) => ({
    off: (j / (n - 1) - 0.5) + (r() - 0.5) * 0.04,
    width: 0.7 + r() * 0.8,
    s: r() * 0.06, // bristles touch down at slightly different moments
    // and run dry at different lengths; the outer ones first, so the tail frays
    e: 1 - Math.abs(j / (n - 1) - 0.5) * (0.25 + r() * 0.35),
  }));
}

const SAMPLES = 48;
// Brush pressure along a stroke: lands narrow, swells, lifts off narrow.
const pressure = (t: number) => 0.35 + 0.65 * Math.pow(Math.sin(Math.min(1, Math.max(0, t)) * Math.PI), 0.5);
const ease = (t: number) => 1 - Math.pow(1 - t, 2.2);

export function PaintedPortrait({ src, cues = 0, onCue, onDone, instant, focus = [0.5, 0.4], detail = [0.56, 0.34, 0.18], className, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cb = useRef({ onCue, onDone });
  cb.current = { onCue, onDone };

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skip = instant || reduce;
    const strokes = buildStrokes(detail);
    const glazeAt = Math.max(...strokes.map(s => s.start + s.dur)) + 60;
    // cues land evenly through the painting, the last just before the glaze
    const cueAt = Array.from({ length: cues }, (_, i) => (glazeAt * (i + 0.6)) / (cues + 0.2));
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
    const geo = strokes.map(s => ({ pts: [] as ReturnType<typeof sample>, br: bristles(s.seed, s.w > 0.1 ? 24 : s.w > 0.06 ? 16 : 11), drawn: 0 }));

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

      // The glaze is the photo masked by the core of every stroke (not the
      // tapered ends), so it fills gaps inside without rounding off the edges.
      const gc = glaze.getContext('2d')!;
      gc.lineCap = 'butt'; gc.lineJoin = 'round'; gc.strokeStyle = '#000';
      strokes.forEach((st, i) => {
        const pts = geo[i].pts;
        const k0 = Math.round(SAMPLES * 0.14), k1 = Math.round(SAMPLES * 0.84);
        gc.lineWidth = st.w * W * 0.58;
        gc.beginPath();
        for (let k = k0; k <= k1; k++) (k === k0 ? gc.moveTo(pts[k].x, pts[k].y) : gc.lineTo(pts[k].x, pts[k].y));
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
      // butt caps: bristles end in hairs, not dots
      pc.lineCap = 'butt'; pc.lineJoin = 'round';
      if (pattern) pc.strokeStyle = pattern;
      const width = st.w * W;
      const n = g.br.length;
      for (const b of g.br) {
        const from = Math.max(g.drawn, b.s), end = Math.min(to, b.e);
        if (end <= from) continue;
        const k0 = Math.floor(from * SAMPLES), k1 = Math.ceil(end * SAMPLES);
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
      cueAt.forEach((_, i) => { if (!fired.has(i)) { fired.add(i); cb.current.onCue?.(i); } });
      if (!done) { done = true; cb.current.onDone?.(); }
    }

    function frame(now: number) {
      if (cancelled) return;
      if (!t0) t0 = now;
      const t = now - t0;
      cueAt.forEach((at, i) => { if (t >= at && !fired.has(i)) { fired.add(i); cb.current.onCue?.(i); } });
      strokes.forEach((st, i) => {
        if (t >= st.start) paintStroke(i, ease(Math.min(1, (t - st.start) / st.dur)));
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
