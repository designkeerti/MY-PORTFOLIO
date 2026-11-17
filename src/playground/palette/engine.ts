import { contrastRatio, hexToOklch, oklchToHex } from '../color';

/**
 * Palettes that go together, decided rather than rolled. Each press builds a few hundred
 * candidates around the locked colours, from different structures (neighbours, opposites,
 * split, triad, square, one hue, quiet greys with one accent, light-warm/shadow-cool, free),
 * then scores every one on what makes colours work together:
 *
 *   hue harmony    how well the hues fit a harmonic template (Matsuda's, as in Cohen-Or et al.)
 *   usefulness     is there a dark and a light that read as text on a background
 *   lightness      do they span light to dark, rather than all sit in the middle
 *   lead           one or two strong colours with the rest supporting, not five shouting
 *   natural order  yellows lighter than blues and violets, the way the eye expects
 *   temperature    a clear warm or cool lean
 *   distinctness   no two colours nearly the same
 * and takes away for clashes: strong opposite hues at the same lightness (they vibrate),
 * murky olive-greys, and a result too like the last one. The best few win, with a little luck.
 */

export type Lch = { L: number; C: number; H: number };
export type Slot = { hex: string; locked: boolean };
export type Mood = 'any' | 'soft' | 'vivid' | 'earthy' | 'deep';

const lch = (hex: string): Lch => { const [L, C, H] = hexToOklch(hex); return { L, C, H: C < 0.01 ? 0 : H }; };
const hexOf = (c: Lch) => oklchToHex(Math.min(0.99, Math.max(0.05, c.L)), Math.max(0, c.C), ((c.H % 360) + 360) % 360);
const angle = (a: number, b: number) => { const d = Math.abs(((a - b) % 360 + 360) % 360); return d > 180 ? 360 - d : d; };
const dE = (a: Lch, b: Lch) => {
  const ax = a.C * Math.cos(a.H * Math.PI / 180), ay = a.C * Math.sin(a.H * Math.PI / 180);
  const bx = b.C * Math.cos(b.H * Math.PI / 180), by = b.C * Math.sin(b.H * Math.PI / 180);
  return Math.hypot(a.L - b.L, ax - bx, ay - by);
};
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const isWarm = (h: number) => h < 105 || h > 330;

/* ---------- harmony templates (sector centre, width, in degrees) ---------- */

const TEMPLATES = [
  { id: 'i', sectors: [[0, 18]], tight: 1, says: 'one close family of hues' },
  { id: 'V', sectors: [[0, 94]], tight: 0.85, says: 'neighbouring hues (analogous)' },
  { id: 'L', sectors: [[0, 18], [90, 79]], tight: 0.7, says: 'a main hue with a quarter-turn accent' },
  { id: 'I', sectors: [[0, 18], [180, 18]], tight: 0.9, says: 'two opposite hues (complementary)' },
  { id: 'Y', sectors: [[0, 94], [180, 18]], tight: 0.75, says: 'a family of hues with one opposite accent (split complementary)' },
  { id: 'X', sectors: [[0, 94], [180, 94]], tight: 0.6, says: 'two opposite families' },
  { id: 'tri', sectors: [[0, 18], [120, 18], [240, 18]], tight: 0.7, says: 'three hues evenly around the wheel (triad)' },
  { id: 'T', sectors: [[0, 180]], tight: 0.35, says: 'one half of the wheel' },
] as const;

function harmony(cs: Lch[]) {
  const chroma = cs.filter(c => c.C > 0.045);
  if (chroma.length < 2) return { score: chroma.length ? 0.95 : 0.85, says: chroma.length ? 'one hue against quiet neutrals' : 'neutrals only', rot: 0 };
  let best = { score: 0, says: '', rot: 0 };
  const wsum = chroma.reduce((a, c) => a + c.C, 0);
  for (const t of TEMPLATES) {
    for (let rot = 0; rot < 360; rot += 3) {
      let cost = 0;
      for (const c of chroma) {
        let d = 180;
        for (const [centre, width] of t.sectors) d = Math.min(d, Math.max(0, angle(c.H, centre + rot) - width / 2));
        cost += c.C * d;
      }
      const s = Math.exp(-cost / (wsum * 14)) * (0.8 + 0.2 * t.tight);
      if (s > best.score) best = { score: s, says: t.says, rot };
    }
  }
  return best;
}

/* ---------- names, so the reasons can talk about colours ---------- */

const HUES: [number, string][] = [[12, 'rose'], [40, 'red'], [68, 'orange'], [92, 'amber'], [114, 'yellow'], [134, 'lime'], [165, 'green'], [192, 'teal'], [225, 'cyan'], [250, 'sky blue'], [274, 'blue'], [292, 'indigo'], [315, 'violet'], [340, 'magenta'], [361, 'pink']];
export function nameOf(hex: string) {
  const { L, C, H } = lch(hex);
  if (C < 0.03) {
    const tint = C > 0.012 ? (isWarm(H) ? 'warm ' : 'cool ') : '';
    return L > 0.96 && C < 0.012 ? 'white' : L > 0.88 ? (C > 0.012 ? (isWarm(H) ? 'cream' : 'ice white') : 'off-white') : L > 0.7 ? `${tint}light grey` : L > 0.45 ? `${tint}grey` : L > 0.25 ? `${tint}charcoal` : 'near-black';
  }
  if (H >= 30 && H < 82 && L < 0.58 && C < 0.15) return L < 0.35 ? 'dark brown' : 'brown';
  if (H >= 82 && H < 135 && L < 0.6 && C < 0.13) return 'olive';
  if (H >= 45 && H < 105 && L > 0.82 && C < 0.08) return 'sand';
  if (H >= 245 && H < 290 && L < 0.36) return 'navy';
  if ((H < 40 || H > 340) && L < 0.4 && C > 0.07) return 'maroon';
  const hue = HUES.find(([max]) => H < max)![1];
  const light = L > 0.9 ? 'pale ' : L > 0.78 ? 'light ' : L < 0.3 ? 'deep ' : L < 0.42 ? 'dark ' : '';
  const sat = C > 0.17 ? 'vivid ' : C < 0.07 ? 'dusty ' : '';
  return (light + sat + hue).trim();
}

/* ---------- scoring ---------- */

export type Analysis = {
  score: number;
  parts: { harmony: number; contrast: number; lightness: number; lead: number; natural: number; temperature: number; distinct: number };
  reasons: string[];
  textPairs: { fg: string; bg: string; ratio: number }[];
};

export function analyse(hexes: string[], prev?: string[], locked?: boolean[]): Analysis {
  const cs = hexes.map(lch);
  const n = cs.length;
  const h = harmony(cs);

  const pairs: { i: number; j: number; ratio: number }[] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push({ i, j, ratio: contrastRatio(hexes[i], hexes[j]) });
  const maxRatio = Math.max(...pairs.map(p => p.ratio));
  const contrast = clamp((maxRatio - 3) / 9);

  const Ls = cs.map(c => c.L).sort((a, b) => a - b);
  const range = Ls[n - 1] - Ls[0];
  const gaps = Ls.slice(1).map((l, i) => l - Ls[i]);
  const evenness = 1 - clamp((Math.max(...gaps) - range / Math.max(1, n - 1)) / Math.max(0.01, range));
  const lightness = clamp((range - 0.3) / 0.5) * (0.75 + 0.25 * evenness);

  const vivid = cs.filter(c => c.C >= 0.12).length;
  const lead = [0.65, 1, 0.95, 0.72, 0.5, 0.4, 0.35, 0.3, 0.3][vivid] ?? 0.3;

  const chroma = cs.map((c, i) => ({ c, i })).filter(x => x.c.C > 0.05);
  const nat = (H: number) => Math.cos((H - 100) * Math.PI / 180);
  let agree = 0, judged = 0;
  for (let a = 0; a < chroma.length; a++) for (let b = a + 1; b < chroma.length; b++) {
    const x = chroma[a].c, y = chroma[b].c;
    if (angle(x.H, y.H) < 40 || Math.abs(nat(x.H) - nat(y.H)) < 0.25) continue;
    judged++;
    if (Math.abs(x.L - y.L) < 0.05 || Math.sign(x.L - y.L) === Math.sign(nat(x.H) - nat(y.H))) agree++;
  }
  const natural = judged ? agree / judged : 0.9;

  const warm = chroma.filter(x => isWarm(x.c.H)).length;
  const lean = chroma.length ? Math.max(warm, chroma.length - warm) / chroma.length : 1;
  const temperature = lean >= 0.7 ? 1 : 0.55 + (lean - 0.5) * 2;

  let minD = Infinity;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) minD = Math.min(minD, dE(cs[i], cs[j]));
  const distinct = clamp((minD - 0.03) / 0.09);

  // clashes
  let vibrate = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = cs[i], b = cs[j];
    if (a.C > 0.12 && b.C > 0.12 && angle(a.H, b.H) > 100 && Math.abs(a.L - b.L) < 0.08) vibrate++;
  }
  const mud = cs.filter(c => c.H > 85 && c.H < 130 && c.L > 0.3 && c.L < 0.6 && c.C > 0.04 && c.C < 0.12).length;
  let stale = 0;
  if (prev && prev.length === n) {
    const free = cs.map((c, i) => (locked?.[i] ? null : dE(c, lch(prev[i])))).filter((d): d is number => d !== null);
    if (free.length && free.reduce((a, d) => a + d, 0) / free.length < 0.06) stale = 1;
  }

  const parts = { harmony: h.score, contrast, lightness, lead, natural, temperature, distinct };
  const score = 0.28 * parts.harmony + 0.17 * contrast + 0.12 * lightness + 0.12 * lead + 0.1 * natural + 0.07 * temperature + 0.14 * distinct
    - 0.14 * vibrate - 0.06 * mud - 0.3 * stale;

  // the reasons, in plain words
  const nm = hexes.map(nameOf);
  const reasons: string[] = [];
  const lockedIdx = locked ? locked.map((l, i) => (l ? i : -1)).filter(i => i >= 0) : [];
  reasons.push(`The hues form ${h.says}${lockedIdx.length ? `, built around your ${lockedIdx.map(i => nm[i]).slice(0, 2).join(' and ')}` : ''}.`);
  const best = pairs.reduce((a, b) => (b.ratio > a.ratio ? b : a));
  const [darkI, lightI] = cs[best.i].L < cs[best.j].L ? [best.i, best.j] : [best.j, best.i];
  if (maxRatio >= 7) reasons.push(`${cap(nm[darkI])} on ${nm[lightI]} reads at ${maxRatio.toFixed(1)}:1, so there’s a text colour and a background built in.`);
  else if (maxRatio >= 4.5) reasons.push(`${cap(nm[darkI])} on ${nm[lightI]} passes for text at ${maxRatio.toFixed(1)}:1, though not by much.`);
  else reasons.push(`No pair reaches text contrast (best is ${maxRatio.toFixed(1)}:1): use it for illustration, or lock a darker colour.`);
  const strong = cs.map((c, i) => ({ c, i })).filter(x => x.c.C >= 0.12);
  if (strong.length === 1) reasons.push(`Only the ${nm[strong[0].i]} is strong, so it leads and everything else supports it.`);
  else if (strong.length === 2) reasons.push(`The ${nm[strong[0].i]} and the ${nm[strong[1].i]} carry the colour; the rest stay quiet so they don’t compete.`);
  else if (strong.length === 0) reasons.push('Every colour is quiet: calm on its own, with room for one strong colour for actions.');
  else reasons.push(`${strong.length} strong colours: lively, but give one of them most of the space so they don’t fight.`);
  if (judged && natural >= 0.8) reasons.push('Lightness follows the natural order of hues (yellows lighter, blues and violets deeper), so it feels balanced.');
  if (vibrate) reasons.push('Watch out: two strong opposite colours share a lightness and will shimmer where they touch.');
  else if (strong.length >= 2) reasons.push('The strong colours differ in lightness, so they won’t shimmer side by side.');

  const textPairs = pairs.filter(p => p.ratio >= 4.5).sort((a, b) => b.ratio - a.ratio).slice(0, 4)
    .map(p => (cs[p.i].L < cs[p.j].L ? { fg: hexes[p.i], bg: hexes[p.j], ratio: p.ratio } : { fg: hexes[p.j], bg: hexes[p.i], ratio: p.ratio }));
  return { score, parts, reasons, textPairs };
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/* ---------- making candidates ---------- */

type Strategy = 'analogous' | 'complementary' | 'split' | 'triad' | 'square' | 'mono' | 'quiet' | 'natural' | 'free';
const STRATEGIES: Record<Mood, [Strategy, number][]> = {
  any: [['analogous', 3], ['complementary', 2], ['split', 2.5], ['triad', 1.5], ['square', 1], ['mono', 1], ['quiet', 2], ['natural', 2.5], ['free', 1.5]],
  soft: [['analogous', 3], ['split', 2], ['mono', 2], ['quiet', 3], ['natural', 2], ['complementary', 1]],
  vivid: [['complementary', 3], ['split', 3], ['triad', 3], ['square', 2], ['free', 2]],
  earthy: [['analogous', 3], ['natural', 3], ['quiet', 2], ['split', 1.5], ['mono', 1]],
  deep: [['analogous', 2], ['complementary', 2], ['split', 2], ['natural', 2], ['quiet', 2], ['mono', 1]],
};

function pick<T>(xs: [T, number][], r: () => number): T {
  let t = r() * xs.reduce((a, [, w]) => a + w, 0);
  for (const [x, w] of xs) { t -= w; if (t <= 0) return x; }
  return xs[0][0];
}
const between = (r: () => number, a: number, b: number) => a + r() * (b - a);

function candidate(slots: (Lch | null)[], mood: Mood, r: () => number): Lch[] {
  const fixed = slots.filter((s): s is Lch => !!s);
  const chromatic = fixed.filter(c => c.C > 0.045);
  const anchor = chromatic.length ? chromatic[Math.floor(r() * chromatic.length)].H
    : mood === 'earthy' ? between(r, 20, 110) : r() * 360;
  const strategy = pick(STRATEGIES[mood], r);
  const hues: number[] = {
    analogous: [anchor - 32, anchor - 16, anchor + 16, anchor + 32, anchor],
    complementary: [anchor + 180, anchor, anchor + 180 + (r() < 0.5 ? -14 : 14)],
    split: [anchor + 150, anchor + 210, anchor, anchor + 20],
    triad: [anchor + 120, anchor + 240, anchor],
    square: [anchor + 90, anchor + 180, anchor + 270],
    mono: [anchor],
    quiet: [anchor, anchor + (r() < 0.5 ? 180 : 150)],
    natural: [anchor, anchor + 30, anchor - 30],
    free: [r() * 360, r() * 360, r() * 360, r() * 360],
  }[strategy];

  // which roles the free slots play
  const free = slots.map((s, i) => (s ? -1 : i)).filter(i => i >= 0);
  const roles: string[] = [];
  if (!fixed.some(c => c.L < 0.36) && r() < 0.68) roles.push('dark');
  if (!fixed.some(c => c.L > 0.88) && r() < 0.6) roles.push('light');
  const vividHave = fixed.filter(c => c.C >= 0.12).length;
  const vividWant = mood === 'vivid' ? 2 + (r() < 0.4 ? 1 : 0) : mood === 'soft' ? 0 : strategy === 'quiet' ? 1 : r() < 0.55 ? 1 : 2;
  for (let k = vividHave; k < vividWant; k++) roles.push('vivid');
  while (roles.length < free.length) roles.push(strategy === 'quiet' || mood === 'soft' ? (r() < 0.6 ? 'neutral' : 'muted') : r() < 0.7 ? 'muted' : 'neutral');
  const used = roles.slice(0, free.length).sort(() => r() - 0.5);

  const made: Lch[] = used.map((role, k) => {
    let H = hues[k % hues.length] + between(r, -7, 7);
    let L: number, C: number;
    switch (role) {
      case 'dark': L = between(r, 0.16, 0.36); C = between(r, 0.02, 0.09); break;
      case 'light': L = between(r, 0.86, 0.97); C = between(r, 0.01, 0.06); break;
      case 'vivid': L = between(r, 0.55, 0.74); C = between(r, 0.13, 0.2); break;
      case 'neutral': L = between(r, 0.3, 0.92); C = between(r, 0.006, 0.03); break;
      default: L = between(r, 0.45, 0.82); C = between(r, 0.05, 0.1);
    }
    if (strategy === 'natural') {
      // light things lean warm, shadows lean cool, as in daylight
      if (L > 0.8) H = H + (90 - H) * 0.35;
      if (L < 0.35) H = H + (255 - H) * 0.35;
    }
    if (role === 'vivid' || role === 'muted') L += 0.07 * Math.cos((H - 100) * Math.PI / 180); // yellows sit lighter
    if (mood === 'soft') { L = Math.max(L, role === 'dark' ? L : 0.62); C *= 0.65; }
    if (mood === 'earthy') { C *= 0.7; if (role !== 'dark' && role !== 'light') H = H + (65 - H) * 0.3; }
    if (mood === 'deep' && role !== 'light') L *= 0.82;
    return { L: clamp(L, 0.08, 0.985), C, H: ((H % 360) + 360) % 360 };
  });
  // free slots run light to dark, so the palette reads in order
  made.sort((a, b) => b.L - a.L);
  const out: Lch[] = [];
  let k = 0;
  for (const s of slots) out.push(s ?? made[k++]);
  return out;
}

let seed = Date.now() % 2147483647;
const rand = () => (seed = (seed * 48271) % 2147483647) / 2147483647;

/** a new palette: the locked slots stay; the others are the winner of a few hundred tries */
export function generate(slots: Slot[], mood: Mood, tries = 320): { hexes: string[]; analysis: Analysis } {
  const base = slots.map(s => (s.locked ? lch(s.hex) : null));
  const prev = slots.map(s => s.hex), locked = slots.map(s => s.locked);
  const scored: { hexes: string[]; a: Analysis }[] = [];
  for (let t = 0; t < tries; t++) {
    const cs = candidate(base, mood, rand);
    const hexes = cs.map((c, i) => (slots[i].locked ? slots[i].hex : hexOf(c)));
    scored.push({ hexes, a: analyse(hexes, prev, locked) });
  }
  scored.sort((a, b) => b.a.score - a.a.score);
  const top = scored.slice(0, 6);
  const w = top.map(s => Math.exp((s.a.score - top[0].a.score) / 0.025));
  let x = rand() * w.reduce((a, b) => a + b, 0), pickI = 0;
  for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) { pickI = i; break; } }
  const win = top[pickI];
  return { hexes: win.hexes, analysis: analyse(win.hexes, undefined, locked) };
}

/** a palette's roles for a design system: brand, accent, and how the greys lean */
export function rolesOf(hexes: string[]) {
  const cs = hexes.map((h, i) => ({ h, i, ...lch(h) }));
  const byChroma = [...cs].sort((a, b) => b.C * (a.L > 0.35 && a.L < 0.8 ? 1.2 : 1) - a.C * (b.L > 0.35 && b.L < 0.8 ? 1.2 : 1));
  const brand = byChroma[0];
  const accent = byChroma.find(c => c !== brand && c.C > 0.06 && angle(c.H, brand.H) > 30) ?? null;
  const quiet = [...cs].filter(c => c !== brand && c !== accent).sort((a, b) => a.C - b.C)[0] ?? brand;
  const lean: 'brand' | 'warm' | 'cool' = quiet.C < 0.012 ? 'brand' : quiet.H >= 20 && quiet.H < 115 ? 'warm' : quiet.H >= 170 && quiet.H < 300 ? 'cool' : 'brand';
  const darkest = Math.min(...cs.map(c => c.L));
  return {
    brand: brand.h, accent: accent?.h ?? null, lean, tint: clamp(quiet.C / 0.035, 0.05, 0.8),
    depth: (darkest < 0.18 ? 'black' : darkest < 0.27 ? 'dark' : 'dim') as 'black' | 'dark' | 'dim',
  };
}
