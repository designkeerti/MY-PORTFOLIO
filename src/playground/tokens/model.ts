import { clamp, contrastRatio, hexToOklch, oklchToHex, hexToRgb } from '../color';
import { FONTS, PAIRINGS, fontByName, fallbackFor } from '../data';

/**
 * A design system as data. `State` is what the designer sets (a handful of seeds and choices);
 * `resolve()` turns it into every token: primitive palettes, semantic colours for light and
 * dark, a type ramp for desktop and mobile, spacing, radius, elevation and grids. Everything the
 * canvas, the outline and the exports show comes from the resolved tokens, so they never disagree.
 */

/* ---------- names ---------- */

export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Step = (typeof STEPS)[number];
export const PALETTES = ['brand', 'accent', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
export type Palette = (typeof PALETTES)[number];
export const STATUS = ['success', 'warning', 'danger', 'info'] as const;
export type Status = (typeof STATUS)[number];
export type Mode = 'light' | 'dark';
export const MODES: Mode[] = ['light', 'dark'];
export type Bp = 'mobile' | 'tablet' | 'desktop';
export const BPS: Bp[] = ['mobile', 'tablet', 'desktop'];
/** a primitive colour: a step of a palette, or plain white or black */
export type Ref = `${Palette}.${Step}` | 'white' | 'black';

/** semantic colours, with what each one is for */
export const SEMANTIC: { id: string; group: 'bg' | 'fg' | 'border'; use: string }[] = [
  { id: 'bg/canvas', group: 'bg', use: 'The page behind everything' },
  { id: 'bg/surface', group: 'bg', use: 'Cards, panels and inputs' },
  { id: 'bg/raised', group: 'bg', use: 'Menus, popovers and dialogs' },
  { id: 'bg/subtle', group: 'bg', use: 'Quiet bands and table stripes' },
  { id: 'bg/muted', group: 'bg', use: 'Hover fills, tracks and chips' },
  { id: 'bg/inverse', group: 'bg', use: 'Tooltips and dark bands' },
  { id: 'bg/brand', group: 'bg', use: 'Primary buttons and highlights' },
  { id: 'bg/brand-hover', group: 'bg', use: 'Primary buttons, hovered' },
  { id: 'bg/brand-subtle', group: 'bg', use: 'Selected rows and brand badges' },
  { id: 'bg/accent', group: 'bg', use: 'Secondary emphasis' },
  { id: 'bg/accent-subtle', group: 'bg', use: 'Accent badges and tints' },
  ...STATUS.flatMap(s => [
    { id: `bg/${s}`, group: 'bg' as const, use: `Solid ${s} marks` },
    { id: `bg/${s}-subtle`, group: 'bg' as const, use: `${cap(s)} messages` },
  ]),
  { id: 'fg/default', group: 'fg', use: 'Body text and headings' },
  { id: 'fg/muted', group: 'fg', use: 'Secondary text' },
  { id: 'fg/subtle', group: 'fg', use: 'Placeholders and hints' },
  { id: 'fg/inverse', group: 'fg', use: 'Text on inverse' },
  { id: 'fg/on-brand', group: 'fg', use: 'Text on brand' },
  { id: 'fg/on-accent', group: 'fg', use: 'Text on accent' },
  { id: 'fg/brand', group: 'fg', use: 'Links and brand text' },
  { id: 'fg/accent', group: 'fg', use: 'Accent text' },
  ...STATUS.map(s => ({ id: `fg/${s}`, group: 'fg' as const, use: `${cap(s)} text and icons` })),
  { id: 'border/default', group: 'border', use: 'Dividers and card edges' },
  { id: 'border/subtle', group: 'border', use: 'Faint separators' },
  { id: 'border/strong', group: 'border', use: 'Inputs and controls' },
  { id: 'border/brand', group: 'border', use: 'Selected and active' },
  { id: 'border/focus', group: 'border', use: 'Focus rings' },
  ...STATUS.map(s => ({ id: `border/${s}`, group: 'border' as const, use: `${cap(s)} edges` })),
];
function cap(s: string) { return s[0].toUpperCase() + s.slice(1); }

/** the text styles, from the biggest down; step is the power of the ratio */
export const STYLES = [
  { id: 'display', label: 'Display', figma: 'Display', role: 'heading', step: 6, weight: 'heading' },
  { id: 'h1', label: 'Heading 1', figma: 'Heading/H1', role: 'heading', step: 5, weight: 'heading' },
  { id: 'h2', label: 'Heading 2', figma: 'Heading/H2', role: 'heading', step: 4, weight: 'heading' },
  { id: 'h3', label: 'Heading 3', figma: 'Heading/H3', role: 'heading', step: 3, weight: 'heading' },
  { id: 'h4', label: 'Heading 4', figma: 'Heading/H4', role: 'heading', step: 2, weight: 'heading' },
  { id: 'body-lg', label: 'Body large', figma: 'Body/Large', role: 'body', step: 1, weight: 'body' },
  { id: 'body', label: 'Body', figma: 'Body/Default', role: 'body', step: 0, weight: 'body' },
  { id: 'body-sm', label: 'Body small', figma: 'Body/Small', role: 'body', step: -1, weight: 'body' },
  { id: 'label', label: 'Label', figma: 'Label', role: 'body', step: -1, weight: 'medium' },
  { id: 'caption', label: 'Caption', figma: 'Caption', role: 'body', step: -2, weight: 'body' },
  { id: 'overline', label: 'Overline', figma: 'Overline', role: 'body', step: -2, weight: 'strong', upper: true, track: 0.08 },
  { id: 'code', label: 'Code', figma: 'Code', role: 'mono', step: -1, weight: 'body' },
] as const;
export type StyleId = (typeof STYLES)[number]['id'];

export const RATIOS = [
  { v: 1.067, label: 'Minor second' }, { v: 1.125, label: 'Major second' }, { v: 1.2, label: 'Minor third' },
  { v: 1.25, label: 'Major third' }, { v: 1.333, label: 'Perfect fourth' }, { v: 1.414, label: 'Augmented fourth' },
  { v: 1.5, label: 'Perfect fifth' },
];

/** spacing: the scales, as multiples of the base unit */
export const SPACE_SCALES = {
  linear: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32],
  geometric: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48],
  fibonacci: [0, 1, 2, 3, 5, 8, 13, 21, 34],
};
export type SpaceScale = keyof typeof SPACE_SCALES;
/** semantic spacing: what each is for, and its size in base units at comfortable density */
export const SPACE_SEM = [
  { id: 'inset/xs', u: 1, use: 'Inside chips and tags' },
  { id: 'inset/sm', u: 2, use: 'Inside small controls' },
  { id: 'inset/md', u: 4, use: 'Inside buttons and inputs' },
  { id: 'inset/lg', u: 6, use: 'Inside cards' },
  { id: 'inset/xl', u: 8, use: 'Inside dialogs and big panels' },
  { id: 'stack/xs', u: 1, use: 'Label to its field' },
  { id: 'stack/sm', u: 2, use: 'Between lines of a group' },
  { id: 'stack/md', u: 4, use: 'Between items' },
  { id: 'stack/lg', u: 6, use: 'Between groups' },
  { id: 'stack/xl', u: 10, use: 'Between blocks' },
  { id: 'inline/xs', u: 1, use: 'Icon to its label' },
  { id: 'inline/sm', u: 2, use: 'Between tags' },
  { id: 'inline/md', u: 3, use: 'Between buttons' },
  { id: 'inline/lg', u: 6, use: 'Between nav items' },
  { id: 'section/sm', u: 12, use: 'Between small sections' },
  { id: 'section/md', u: 20, use: 'Between sections' },
  { id: 'section/lg', u: 30, use: 'Around the hero' },
] as const;
export type SpaceSem = (typeof SPACE_SEM)[number]['id'];
export const DENSITY = { compact: 0.75, comfortable: 1, spacious: 1.3 };
export type Density = keyof typeof DENSITY;

export const RADII = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
export type RadiusKey = (typeof RADII)[number];
export const RADIUS_SEM = [
  { id: 'button', use: 'Buttons' }, { id: 'input', use: 'Inputs and selects' }, { id: 'card', use: 'Cards and panels' },
  { id: 'dialog', use: 'Dialogs and sheets' }, { id: 'badge', use: 'Badges and tags' }, { id: 'avatar', use: 'Avatars' },
] as const;
export type RadiusSem = (typeof RADIUS_SEM)[number]['id'];

export const LEVELS = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Level = (typeof LEVELS)[number];
export const LEVEL_USE: Record<Level, string> = { xs: 'Buttons, inputs', sm: 'Cards at rest', md: 'Cards, hovered', lg: 'Menus, popovers', xl: 'Dialogs' };

/* ---------- what the designer sets ---------- */

export type GridBp = { columns: number; gutter: number; margin: number };
export type State = {
  v: 1;
  name: string;
  color: {
    brand: string; accent: string; success: string; warning: string; danger: string; info: string;
    /** where the greys lean, and how much */
    lean: 'brand' | 'warm' | 'cool'; tint: number;
    /** pulls the status colours' hues toward the brand (0..1) */
    harmonize: number;
    /** how far the palettes reach toward white and black (0..1) */
    range: number;
    depth: 'dim' | 'dark' | 'black';
    /** semantic colours the designer has re-pointed, keyed `${mode}:${id}` */
    map: Record<string, Ref>;
  };
  type: {
    heading: string; body: string; mono: string;
    headingWeight: number; bodyWeight: number; strongWeight: number;
    base: number; ratio: number; mBase: number; mRatio: number;
    bodyLh: number; headingLh: number; tracking: number; snap: boolean;
    over: Partial<Record<StyleId, { weight?: number; step?: number }>>;
  };
  space: { base: number; scale: SpaceScale; density: Density; map: Partial<Record<SpaceSem, number>> };
  radius: { base: number; step: number; map: Record<RadiusSem, RadiusKey> };
  shadow: { strength: number; softness: number; tint: number };
  grid: Record<Bp, GridBp> & { max: number; tabletAt: number; desktopAt: number };
};

export const DEFAULT: State = {
  v: 1,
  name: 'Tidal',
  color: {
    brand: '#2f6bed', accent: '#ed7b1a', success: '#16a34a', warning: '#f59e0b', danger: '#dc2626', info: '#0891b2',
    lean: 'brand', tint: 0.3, harmonize: 0.2, range: 0.5, depth: 'dark', map: {},
  },
  type: {
    heading: 'Plus Jakarta Sans', body: 'Inter', mono: 'JetBrains Mono',
    headingWeight: 700, bodyWeight: 400, strongWeight: 600,
    base: 16, ratio: 1.25, mBase: 16, mRatio: 1.2,
    bodyLh: 1.5, headingLh: 1.1, tracking: -0.02, snap: true, over: {},
  },
  space: { base: 4, scale: 'linear', density: 'comfortable', map: {} },
  radius: { base: 8, step: 1.5, map: { button: 'md', input: 'md', card: 'lg', dialog: 'xl', badge: 'full', avatar: 'full' } },
  shadow: { strength: 0.6, softness: 1, tint: 0.4 },
  grid: {
    mobile: { columns: 4, gutter: 16, margin: 20 },
    tablet: { columns: 8, gutter: 20, margin: 32 },
    desktop: { columns: 12, gutter: 24, margin: 48 },
    max: 1200, tabletAt: 768, desktopAt: 1024,
  },
};

type Deep<T> = { [K in keyof T]?: T[K] extends object ? Deep<T[K]> : T[K] };
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
/** lay `over` onto `base`, keeping only keys the base knows (maps are taken whole) */
function merge<T>(base: T, over: unknown, open = false): T {
  if (!isObj(base) || !isObj(over)) return (over === undefined || typeof over !== typeof base ? base : over) as T;
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(over)) {
    if (!(k in base) && !open) continue;
    const opens = k === 'map' || k === 'over';
    const b = (base as Record<string, unknown>)[k];
    out[k] = opens ? { ...(isObj(b) ? b : {}), ...(isObj(over[k]) ? over[k] : {}) } : merge(b, over[k]);
  }
  return out as T;
}
/** a saved or shared state, made safe: anything missing or out of range comes from the defaults */
export function hydrate(raw: unknown): State {
  const s = merge(DEFAULT, raw);
  const one = <T,>(v: T, ok: readonly T[], d: T) => (ok.includes(v) ? v : d);
  const num = (v: number, lo: number, hi: number, d: number) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
  const hex = (v: string, d: string) => (/^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : d);
  const c = s.color, D = DEFAULT;
  for (const k of ['brand', 'accent', 'success', 'warning', 'danger', 'info'] as const) c[k] = hex(c[k], D.color[k]);
  c.lean = one(c.lean, ['brand', 'warm', 'cool'] as const, D.color.lean);
  c.depth = one(c.depth, ['dim', 'dark', 'black'] as const, D.color.depth);
  c.tint = num(c.tint, 0, 1, D.color.tint); c.harmonize = num(c.harmonize, 0, 1, D.color.harmonize); c.range = num(c.range, 0, 1, D.color.range);
  const real = (v: unknown) => v === 'white' || v === 'black' || (typeof v === 'string' && PALETTES.includes(v.split('.')[0] as Palette) && STEPS.includes(+v.split('.')[1] as Step));
  c.map = Object.fromEntries(Object.entries(c.map).filter(([k, v]) => /^(light|dark):/.test(k) && real(v)));
  const t = s.type;
  t.base = num(t.base, 10, 28, D.type.base); t.mBase = num(t.mBase, 10, 28, D.type.mBase);
  t.ratio = num(t.ratio, 1, 1.8, D.type.ratio); t.mRatio = num(t.mRatio, 1, 1.8, D.type.mRatio);
  t.bodyLh = num(t.bodyLh, 1, 2.2, D.type.bodyLh); t.headingLh = num(t.headingLh, 0.8, 2, D.type.headingLh);
  t.tracking = num(t.tracking, -0.1, 0.1, D.type.tracking);
  t.headingWeight = num(t.headingWeight, 100, 900, 600); t.bodyWeight = num(t.bodyWeight, 100, 900, 400); t.strongWeight = num(t.strongWeight, 100, 900, 600);
  s.space.scale = one(s.space.scale, Object.keys(SPACE_SCALES) as SpaceScale[], D.space.scale);
  s.space.density = one(s.space.density, Object.keys(DENSITY) as Density[], D.space.density);
  s.space.base = num(s.space.base, 1, 16, D.space.base);
  s.radius.base = num(s.radius.base, 0, 64, D.radius.base); s.radius.step = num(s.radius.step, 1, 3, D.radius.step);
  for (const bp of BPS) {
    const g = s.grid[bp], d = D.grid[bp];
    g.columns = Math.round(num(g.columns, 1, 24, d.columns)); g.gutter = num(g.gutter, 0, 200, d.gutter); g.margin = num(g.margin, 0, 400, d.margin);
  }
  s.grid.max = num(s.grid.max, 320, 2560, D.grid.max);
  s.grid.tabletAt = num(s.grid.tabletAt, 320, 2000, D.grid.tabletAt); s.grid.desktopAt = num(s.grid.desktopAt, s.grid.tabletAt + 8, 2560, D.grid.desktopAt);
  s.shadow.strength = num(s.shadow.strength, 0, 1, D.shadow.strength); s.shadow.softness = num(s.shadow.softness, 0.2, 3, D.shadow.softness); s.shadow.tint = num(s.shadow.tint, 0, 1, D.shadow.tint);
  s.name = String(s.name).slice(0, 24);
  return s;
}
export const withPreset = (p: Deep<State>): State => merge(DEFAULT, p);

export const PRESETS: { id: string; name: string; note: string; state: Deep<State> }[] = [
  { id: 'tidal', name: 'Calm product', note: 'Blue, Inter, rounded', state: {} },
  {
    id: 'editorial', name: 'Editorial', note: 'Serif, warm, square', state: {
      name: 'Ledger',
      color: { brand: '#b4532a', accent: '#2f5d50', lean: 'warm', tint: 0.55, harmonize: 0.35, range: 0.4, depth: 'dim' },
      type: { heading: 'Fraunces', body: 'Source Serif 4', headingWeight: 600, ratio: 1.333, mRatio: 1.2, base: 18, mBase: 17, bodyLh: 1.6, headingLh: 1.08, tracking: -0.015 },
      space: { density: 'spacious' },
      radius: { base: 2, step: 2, map: { button: 'sm', input: 'sm', card: 'sm', dialog: 'md', badge: 'sm', avatar: 'full' } },
      shadow: { strength: 0.3, softness: 1.4, tint: 0.7 },
    },
  },
  {
    id: 'playful', name: 'Playful', note: 'Violet, pills, bouncy', state: {
      name: 'Pip',
      color: { brand: '#7c3aed', accent: '#f43f5e', lean: 'brand', tint: 0.5, harmonize: 0.3, range: 0.6, depth: 'dark' },
      type: { heading: 'Bricolage Grotesque', body: 'DM Sans', headingWeight: 700, ratio: 1.25, bodyLh: 1.55, headingLh: 1.05, tracking: -0.03 },
      radius: { base: 14, step: 1.5, map: { button: 'full', input: 'lg', card: 'xl', dialog: '2xl', badge: 'full', avatar: 'full' } },
      shadow: { strength: 0.6, softness: 1.3, tint: 0.8 },
    },
  },
  {
    id: 'sharp', name: 'Sharp', note: 'Teal, square, compact', state: {
      name: 'Gridline',
      color: { brand: '#0f766e', accent: '#eab308', lean: 'cool', tint: 0.15, harmonize: 0, range: 0.75, depth: 'black' },
      type: { heading: 'Space Grotesk', body: 'IBM Plex Sans', mono: 'JetBrains Mono', headingWeight: 600, ratio: 1.2, mRatio: 1.125, base: 15, mBase: 15, bodyLh: 1.45, headingLh: 1.1, tracking: -0.025 },
      space: { density: 'compact', scale: 'geometric' },
      radius: { base: 0, step: 1.5, map: { button: 'none', input: 'none', card: 'none', dialog: 'none', badge: 'none', avatar: 'none' } },
      shadow: { strength: 0.25, softness: 0.6, tint: 0 },
    },
  },
  {
    id: 'soft', name: 'Soft', note: 'Rose, airy, gentle', state: {
      name: 'Bloom',
      color: { brand: '#d9467a', accent: '#5b7cfa', lean: 'warm', tint: 0.4, harmonize: 0.5, range: 0.35, depth: 'dim' },
      type: { heading: 'Outfit', body: 'Manrope', headingWeight: 600, ratio: 1.2, bodyLh: 1.65, headingLh: 1.15, tracking: -0.01 },
      space: { density: 'spacious', base: 4 },
      radius: { base: 12, step: 1.5, map: { button: 'lg', input: 'md', card: 'xl', dialog: '2xl', badge: 'full', avatar: 'full' } },
      shadow: { strength: 0.45, softness: 1.8, tint: 0.9 },
    },
  },
];

/** a fresh random system: a brand hue, an accent across the wheel, one of the pairings */
export function shuffle(prev: State): State {
  const r = (a: number, b: number) => a + Math.random() * (b - a);
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
  const h = r(0, 360);
  const pair = pick(PAIRINGS.filter(p => fontByName(p.heading) && fontByName(p.body)));
  const radius = pick([0, 4, 6, 8, 12, 16]);
  const button = pick(['md', 'lg', 'full'] as RadiusKey[]);
  return {
    ...prev,
    color: {
      ...prev.color, map: {},
      brand: oklchToHex(r(0.5, 0.62), r(0.12, 0.2), h),
      accent: oklchToHex(r(0.62, 0.75), r(0.12, 0.18), (h + r(120, 220)) % 360),
      lean: pick(['brand', 'warm', 'cool'] as const), tint: r(0.1, 0.6), range: r(0.3, 0.8), depth: pick(['dim', 'dark', 'black'] as const),
    },
    type: { ...prev.type, heading: pair.heading, body: pair.body, headingWeight: pair.weight ?? 600, ratio: pick([1.2, 1.25, 1.333]), over: {} },
    radius: { ...prev.radius, base: radius, map: { ...prev.radius.map, button: radius === 0 ? 'none' : button } },
  };
}

/* ---------- colour ---------- */

const BASE_L = [0.975, 0.94, 0.885, 0.81, 0.72, 0.635, 0.55, 0.465, 0.38, 0.295, 0.215];
function lightness(range: number) {
  const top = 0.962 + 0.026 * range, bottom = 0.27 - 0.09 * range;
  return BASE_L.map(l => top - ((0.975 - l) / (0.975 - 0.215)) * (top - bottom));
}
/** a palette around a seed: the seed sits exactly on the step nearest its lightness */
function ramp(seed: string, Ls: number[]) {
  const [L, C, H] = hexToOklch(seed);
  const near = Ls.reduce((b, l, i) => (Math.abs(l - L) < Math.abs(Ls[b] - L) ? i : b), 0);
  const hex = Ls.map((l, i) => {
    if (i === near) return seed;
    const away = Math.abs(l - L) / (l > L ? 1 - L + 0.001 : L + 0.001);
    const c = C * (1 - 0.82 * Math.pow(Math.min(1, away), l > L ? 1.1 : 1.6));
    return oklchToHex(l, Math.max(0, c), H);
  });
  return { hex, seed: STEPS[near] };
}
const greys = (hue: number, chroma: number, Ls: number[]) =>
  Ls.map(l => oklchToHex(l, chroma * (l > 0.9 ? 0.55 : l < 0.3 ? 0.8 : 1), hue));

/** turn a status colour's hue part of the way toward the brand, as Material's harmonising does */
function harmonize(hex: string, brandH: number, amount: number) {
  if (!amount) return hex;
  const [L, C, H] = hexToOklch(hex);
  let d = brandH - H; if (d > 180) d -= 360; if (d < -180) d += 360;
  return oklchToHex(L, C, H + Math.sign(d) * Math.min(Math.abs(d) * 0.5, 18) * amount);
}

const stepIdx = (s: number) => Math.max(0, STEPS.indexOf(s as Step));
const at = (i: number) => STEPS[Math.max(0, Math.min(STEPS.length - 1, i))];
const clampStep = (s: number, lo: number, hi: number) => at(Math.max(stepIdx(lo), Math.min(stepIdx(hi), stepIdx(s))));
const shift = (s: Step, by: number) => at(stepIdx(s) + by);

export type Palettes = Record<Palette, Record<Step, string>>;
export function hexOf(ref: Ref, pal: Palettes) {
  if (ref === 'white') return '#ffffff';
  if (ref === 'black') return '#000000';
  const [p, s] = ref.split('.') as [Palette, string];
  return pal[p]?.[+s as Step] ?? '#ff00ff';
}
export const parseRef = (ref: Ref): { palette: Palette | 'base'; step: Step | null } =>
  ref === 'white' || ref === 'black' ? { palette: 'base', step: null } : { palette: ref.split('.')[0] as Palette, step: +ref.split('.')[1] as Step };

/** the first step that reaches `min` contrast on every background, else the best of them */
function passing(pal: Palettes, p: Palette, steps: number[], bgs: string[], min: number): Ref {
  let best: Ref = `${p}.${steps[0] as Step}`, bestC = 0;
  for (const s of steps) {
    const ref = `${p}.${s as Step}` as Ref, hex = hexOf(ref, pal);
    const c = Math.min(...bgs.map(b => contrastRatio(hex, b)));
    if (c >= min) return ref;
    if (c > bestC) { best = ref; bestC = c; }
  }
  return best;
}
const onColor = (pal: Palettes, bg: string): Ref =>
  contrastRatio('#ffffff', bg) >= 4.5 || contrastRatio('#ffffff', bg) >= contrastRatio(pal.neutral[950], bg) ? 'white' : 'neutral.950';


/** a fill step that white or near-black text can sit on, moving `dir` (darker or lighter) until one can */
function readable(pal: Palettes, p: Palette, from: Step, dir: 1 | -1): Step {
  for (let s = from, k = 0; k < 3; k++, s = shift(s, dir)) {
    const hex = pal[p][s];
    if (contrastRatio('#ffffff', hex) >= 4.5 || contrastRatio(pal.neutral[950], hex) >= 4.5) return s;
  }
  return from;
}

/** the semantic colours for one mode, before the designer's own choices */
function autoMap(pal: Palettes, seeds: Record<Palette, Step>, mode: Mode, depth: State['color']['depth']): Record<string, Ref> {
  const m: Record<string, Ref> = {};
  const hx = (r: Ref) => hexOf(r, pal);
  const n = (s: number) => `neutral.${s as Step}` as Ref;
  if (mode === 'light') {
    Object.assign(m, { 'bg/canvas': 'white', 'bg/surface': 'white', 'bg/raised': 'white', 'bg/subtle': n(50), 'bg/muted': n(100), 'bg/inverse': n(900) });
    const b = readable(pal, 'brand', clampStep(seeds.brand, 500, 700), 1), a = readable(pal, 'accent', clampStep(seeds.accent, 400, 600), 1);
    m['bg/brand'] = `brand.${b}`; m['bg/brand-hover'] = `brand.${shift(b, 1)}`; m['bg/brand-subtle'] = 'brand.50';
    m['bg/accent'] = `accent.${a}`; m['bg/accent-subtle'] = 'accent.50';
    for (const s of STATUS) { m[`bg/${s}`] = `${s}.${clampStep(seeds[s], 500, 600)}`; m[`bg/${s}-subtle`] = `${s}.50`; }
    m['fg/default'] = n(900);
    m['fg/muted'] = passing(pal, 'neutral', [600, 700, 800], [hx(n(50)), '#ffffff'], 4.5);
    m['fg/subtle'] = passing(pal, 'neutral', [500, 600], ['#ffffff'], 3);
    m['fg/inverse'] = 'white';
    m['fg/brand'] = passing(pal, 'brand', [600, 700, 800, 900, 950], ['#ffffff', hx('brand.50')], 4.5);
    m['fg/accent'] = passing(pal, 'accent', [700, 800, 900, 950], ['#ffffff', hx('accent.50')], 4.5);
    for (const s of STATUS) m[`fg/${s}`] = passing(pal, s, [700, 800, 900, 950], [hx(`${s}.50`)], 4.5);
    Object.assign(m, { 'border/default': n(200), 'border/subtle': n(100) });
    m['border/strong'] = passing(pal, 'neutral', [400, 500, 600], ['#ffffff'], 3);
    m['border/brand'] = m['bg/brand'];
    m['border/focus'] = passing(pal, 'brand', [500, 600, 700], ['#ffffff'], 3);
    for (const s of STATUS) m[`border/${s}`] = `${s}.200`;
  } else {
    const deep = { dim: [900, 800, 700], dark: [950, 900, 800], black: [0, 950, 900] }[depth];
    m['bg/canvas'] = deep[0] ? n(deep[0]) : 'black';
    m['bg/surface'] = n(deep[1]); m['bg/raised'] = n(deep[2]); m['bg/subtle'] = n(deep[1]);
    m['bg/muted'] = n(deep[2]);
    m['bg/inverse'] = n(50);
    const lb = clampStep(seeds.brand, 500, 700), la = clampStep(seeds.accent, 400, 600);
    const b = readable(pal, 'brand', clampStep(shift(lb, -1), 400, 600), -1), a = readable(pal, 'accent', clampStep(shift(la, -1), 300, 500), -1);
    m['bg/brand'] = `brand.${b}`; m['bg/brand-hover'] = `brand.${shift(b, -1)}`; m['bg/brand-subtle'] = 'brand.950';
    m['bg/accent'] = `accent.${a}`; m['bg/accent-subtle'] = 'accent.950';
    for (const s of STATUS) { m[`bg/${s}`] = `${s}.500`; m[`bg/${s}-subtle`] = `${s}.950`; }
    const canvas = hx(m['bg/canvas']), surface = hx(m['bg/surface']);
    m['fg/default'] = n(50);
    m['fg/muted'] = passing(pal, 'neutral', [400, 300, 200], [canvas, surface], 4.5);
    m['fg/subtle'] = passing(pal, 'neutral', [500, 400, 300], [surface], 3);
    m['fg/inverse'] = n(900);
    m['fg/brand'] = passing(pal, 'brand', [400, 300, 200, 100, 50], [canvas, hx('brand.950')], 4.5);
    m['fg/accent'] = passing(pal, 'accent', [400, 300, 200, 100, 50], [canvas, hx('accent.950')], 4.5);
    for (const s of STATUS) m[`fg/${s}`] = passing(pal, s, [400, 300, 200, 100], [hx(`${s}.950`)], 4.5);
    m['border/subtle'] = n(shift(deep[1] as Step, -1)); m['border/default'] = n(shift(deep[1] as Step, -2));
    m['border/strong'] = passing(pal, 'neutral', [500, 400, 300], [surface], 3);
    m['border/brand'] = m['bg/brand'];
    m['border/focus'] = passing(pal, 'brand', [400, 300, 500], [canvas], 3);
    for (const s of STATUS) m[`border/${s}`] = `${s}.${depth === 'dim' ? 700 : 800}`;
  }
  m['fg/on-brand'] = onColor(pal, hx(m['bg/brand']));
  m['fg/on-accent'] = onColor(pal, hx(m['bg/accent']));
  return m;
}

/** pairs that are read together, and the contrast WCAG asks of them */
export const PAIRS: { fg: string; bg: string; min: number; label: string }[] = [
  { fg: 'fg/default', bg: 'bg/canvas', min: 4.5, label: 'Body text on the page' },
  { fg: 'fg/default', bg: 'bg/surface', min: 4.5, label: 'Body text on cards' },
  { fg: 'fg/default', bg: 'bg/muted', min: 4.5, label: 'Text on muted fills' },
  { fg: 'fg/muted', bg: 'bg/canvas', min: 4.5, label: 'Secondary text' },
  { fg: 'fg/muted', bg: 'bg/subtle', min: 4.5, label: 'Secondary text on subtle bands' },
  { fg: 'fg/subtle', bg: 'bg/surface', min: 3, label: 'Hints and placeholders' },
  { fg: 'fg/inverse', bg: 'bg/inverse', min: 4.5, label: 'Text on inverse' },
  { fg: 'fg/on-brand', bg: 'bg/brand', min: 4.5, label: 'Primary button' },
  { fg: 'fg/on-brand', bg: 'bg/brand-hover', min: 4.5, label: 'Primary button, hovered' },
  { fg: 'fg/on-accent', bg: 'bg/accent', min: 4.5, label: 'Accent button' },
  { fg: 'fg/brand', bg: 'bg/canvas', min: 4.5, label: 'Links' },
  { fg: 'fg/brand', bg: 'bg/brand-subtle', min: 4.5, label: 'Brand badges' },
  { fg: 'fg/accent', bg: 'bg/accent-subtle', min: 4.5, label: 'Accent badges' },
  ...STATUS.map(s => ({ fg: `fg/${s}`, bg: `bg/${s}-subtle`, min: 4.5, label: `${cap(s)} messages` })),
  { fg: 'border/strong', bg: 'bg/surface', min: 3, label: 'Input borders' },
  { fg: 'border/focus', bg: 'bg/canvas', min: 3, label: 'Focus rings' },
];
export type Check = { mode: Mode; fg: string; bg: string; min: number; label: string; ratio: number; pass: boolean };

/* ---------- type ---------- */

export const weightsOf = (name: string) => { const f = fontByName(name); return f?.w ? f.w.split(';').map(Number) : [400]; };
const nearestWeight = (name: string, w: number) => weightsOf(name).reduce((b, x) => (Math.abs(x - w) < Math.abs(b - w) ? x : b));
export const familyCss = (name: string) => { const f = fontByName(name); return `'${name}', ${f ? fallbackFor(f.cat) : 'sans-serif'}`; };

export type Metric = { size: number; lh: number };
export type TypeStyle = {
  id: StyleId; label: string; figma: string; role: 'heading' | 'body' | 'mono'; family: string; weight: number;
  desktop: Metric; mobile: Metric; tracking: number; upper: boolean; step: number;
};

function resolveType(t: State['type']): { styles: TypeStyle[]; weights: Record<'heading' | 'body' | 'medium' | 'strong', number> } {
  const top = t.base * Math.pow(t.ratio, 6), mTop = t.mBase * Math.pow(t.mRatio, 6);
  const weights = {
    heading: nearestWeight(t.heading, t.headingWeight), body: nearestWeight(t.body, t.bodyWeight),
    medium: nearestWeight(t.body, 500), strong: nearestWeight(t.body, t.strongWeight),
  };
  const lhFor = (size: number, base: number, high: number, role: string, id: string) => {
    if (role === 'heading') {
      const k = clamp((size - base) / Math.max(1, high - base));
      return t.headingLh + (t.bodyLh - t.headingLh) * Math.pow(1 - k, 1.5) * 0.7;
    }
    return ['label', 'caption', 'overline'].includes(id) ? Math.max(1.2, t.bodyLh - 0.1) : t.bodyLh;
  };
  const px = (size: number, ratio: number) => {
    const v = size * ratio;
    return t.snap ? Math.max(Math.ceil(size / 4) * 4, Math.round(v / 4) * 4) : Math.max(Math.ceil(size), Math.round(v));
  };
  const styles = STYLES.map(s => {
    const o = t.over[s.id] ?? {};
    const step = o.step ?? s.step;
    const family = s.role === 'heading' ? t.heading : s.role === 'mono' ? t.mono : t.body;
    const dSize = Math.max(12, Math.round(t.base * Math.pow(t.ratio, step)));
    const mSize = Math.max(12, Math.round(t.mBase * Math.pow(t.mRatio, step)));
    const role = s.weight as keyof typeof weights;
    const weight = nearestWeight(family, o.weight ?? (s.role === 'mono' ? 400 : weights[role]));
    const k = clamp((dSize - t.base) / Math.max(1, top - t.base));
    const tracking = 'track' in s ? s.track : s.role === 'heading' ? +(t.tracking * Math.pow(k, 0.8)).toFixed(3) : 0;
    return {
      id: s.id, label: s.label, figma: s.figma, role: s.role, family, weight, step, tracking, upper: 'upper' in s,
      desktop: { size: dSize, lh: px(dSize, lhFor(dSize, t.base, top, s.role, s.id)) },
      mobile: { size: mSize, lh: px(mSize, lhFor(mSize, t.mBase, mTop, s.role, s.id)) },
    };
  });
  return { styles, weights };
}

/* ---------- elevation ---------- */

export type Layer = { y: number; blur: number; spread: number; rgb: [number, number, number]; a: number };
const LEVEL_D: Record<Level, number> = { xs: 1, sm: 2.5, md: 7, lg: 16, xl: 30 };
const LEVEL_N: Record<Level, number> = { xs: 2, sm: 3, md: 4, lg: 5, xl: 5 };
export function shadows(s: State['shadow'], hue: number, mode: Mode): Record<Level, Layer[]> {
  const rgb = hexToRgb(mode === 'dark' ? '#000000' : oklchToHex(0.22, 0.07 * s.tint, hue));
  const out = {} as Record<Level, Layer[]>;
  LEVELS.forEach((lv, li) => {
    const n = LEVEL_N[lv], d = LEVEL_D[lv];
    const op = s.strength * (mode === 'dark' ? 1.1 : 0.5) * (0.55 + li * 0.12);
    out[lv] = Array.from({ length: n }, (_, k) => {
      const t = Math.pow((k + 1) / n, 1.8);
      return {
        y: +(d * t).toFixed(1), blur: +(d * 2 * s.softness * t + (k === 0 ? 1 : 0)).toFixed(1), spread: 0, rgb,
        a: +Math.min(1, (op / n) * (1.6 - 1.2 * ((k + 1) / n))).toFixed(3),
      };
    });
  });
  return out;
}
export const shadowCss = (layers: Layer[]) => layers.map(l => `0 ${l.y}px ${l.blur}px ${l.spread}px rgba(${l.rgb.join(', ')}, ${l.a})`).join(', ');

/* ---------- everything ---------- */

export type Resolved = ReturnType<typeof resolve>;
export function resolve(st: State) {
  const c = st.color;
  const Ls = lightness(c.range);
  const brandH = hexToOklch(c.brand)[2];
  const seeds = {} as Record<Palette, Step>;
  const palettes = {} as Palettes;
  const put = (p: Palette, hex: string[]) => { palettes[p] = Object.fromEntries(STEPS.map((s, i) => [s, hex[i]])) as Record<Step, string>; };
  for (const p of ['brand', 'accent', ...STATUS] as Palette[]) {
    const seed = STATUS.includes(p as Status) ? harmonize(c[p as Status], brandH, c.harmonize) : c[p as 'brand' | 'accent'];
    const r = ramp(seed, Ls); put(p, r.hex); seeds[p] = r.seed;
  }
  const leanH = c.lean === 'brand' ? brandH : c.lean === 'warm' ? 70 : 255;
  put('neutral', greys(leanH, c.tint * 0.04, Ls)); seeds.neutral = 500;

  const semantic = {} as Record<Mode, Record<string, { ref: Ref; hex: string; auto: Ref; changed: boolean }>>;
  for (const mode of MODES) {
    const auto = autoMap(palettes, seeds, mode, c.depth);
    semantic[mode] = Object.fromEntries(SEMANTIC.map(({ id }) => {
      const mine = c.map[`${mode}:${id}`];
      const ref = mine ?? auto[id];
      return [id, { ref, hex: hexOf(ref, palettes), auto: auto[id], changed: !!mine && mine !== auto[id] }];
    }));
  }
  const checks: Check[] = MODES.flatMap(mode => PAIRS.map(p => {
    const ratio = contrastRatio(semantic[mode][p.fg].hex, semantic[mode][p.bg].hex);
    return { mode, ...p, ratio, pass: ratio >= p.min };
  }));

  const type = resolveType(st.type);
  const families = { heading: st.type.heading, body: st.type.body, mono: st.type.mono };

  const sp = st.space;
  const mults = SPACE_SCALES[sp.scale];
  const spacePrims = mults.map(m => ({ name: String(m), mult: m, px: Math.round(m * sp.base) }));
  const snapTo = (px: number) => spacePrims.slice(1).reduce((b, p) => (Math.abs(p.px - px) < Math.abs(b.px - px) ? p : b));
  const spaceSem = Object.fromEntries(SPACE_SEM.map(s => {
    const auto = snapTo(s.u * sp.base * DENSITY[sp.density]);
    const mine = sp.map[s.id];
    const prim = mine !== undefined ? spacePrims.find(p => p.mult === mine) ?? auto : auto;
    return [s.id, { ref: prim.name, px: prim.px, changed: mine !== undefined && prim !== auto }];
  })) as Record<SpaceSem, { ref: string; px: number; changed: boolean }>;

  const rb = st.radius.base, rk = st.radius.step;
  const even = (v: number) => (v < 6 ? Math.round(v) : Math.round(v / 2) * 2);
  const radiusPrims: Record<RadiusKey, number> = {
    none: 0, xs: even(rb / 4), sm: even(rb / 2), md: rb,
    lg: even(rb * rk), xl: even(rb * rk * rk), '2xl': even(rb * rk * rk * rk), full: 9999,
  };
  const radiusSem = Object.fromEntries(RADIUS_SEM.map(r => {
    const ref = RADII.includes(st.radius.map[r.id]) ? st.radius.map[r.id] : DEFAULT.radius.map[r.id];
    return [r.id, { ref, px: radiusPrims[ref] }];
  })) as Record<RadiusSem, { ref: RadiusKey; px: number }>;

  const shadow = { light: shadows(st.shadow, leanH, 'light'), dark: shadows(st.shadow, leanH, 'dark') };

  return {
    name: st.name.trim() || 'Tokens', palettes, seeds, semantic, checks,
    type: { ...type, families },
    space: { prims: spacePrims, sem: spaceSem, base: sp.base },
    radius: { prims: radiusPrims, sem: radiusSem },
    shadow, grid: st.grid,
  };
}

/** the nearest step of the same palette that makes a failing pair pass, as an override */
export function fixFor(res: Resolved, chk: Check): { key: string; ref: Ref } | null {
  const sem = res.semantic[chk.mode];
  const bg = sem[chk.bg].hex;
  const cur = sem[chk.fg].ref;
  const { palette, step } = parseRef(cur);
  const pal: Palette = palette === 'base' ? 'neutral' : palette;
  const from = step ? stepIdx(step) : (cur === 'white' ? -1 : STEPS.length);
  const order = STEPS.map((s, i) => ({ s, d: Math.abs(i - from) })).sort((a, b) => a.d - b.d);
  for (const { s } of order) {
    const ref = `${pal}.${s}` as Ref;
    if (contrastRatio(hexOf(ref, res.palettes), bg) >= chk.min) return { key: `${chk.mode}:${chk.fg}`, ref };
  }
  for (const ref of ['white', 'black'] as Ref[]) if (contrastRatio(hexOf(ref, res.palettes), bg) >= chk.min) return { key: `${chk.mode}:${chk.fg}`, ref };
  return null;
}

/* ---------- for the canvas ---------- */

export const cssName = (path: string) => path.replace(/\//g, '-');
/** CSS custom properties for one mode at one width (unprefixed, as the canvas uses them) */
export function canvasVars(res: Resolved, mode: Mode, bp: Bp): Record<string, string> {
  const v: Record<string, string> = {};
  for (const [id, s] of Object.entries(res.semantic[mode])) v[`--color-${cssName(id)}`] = s.hex;
  for (const [id, s] of Object.entries(res.space.sem)) v[`--space-${cssName(id)}`] = s.px + 'px';
  for (const [id, r] of Object.entries(res.radius.sem)) v[`--radius-${id}`] = Math.min(r.px, 999) + 'px';
  for (const lv of LEVELS) v[`--shadow-${lv}`] = shadowCss(res.shadow[mode][lv]);
  v['--font-heading'] = familyCss(res.type.families.heading);
  v['--font-body'] = familyCss(res.type.families.body);
  v['--font-mono'] = familyCss(res.type.families.mono);
  for (const s of res.type.styles) {
    const m = bp === 'mobile' ? s.mobile : s.desktop;
    v[`--text-${s.id}-size`] = m.size + 'px';
    v[`--text-${s.id}-lh`] = m.lh + 'px';
    v[`--text-${s.id}-tracking`] = s.tracking + 'em';
    v[`--text-${s.id}-weight`] = String(s.weight);
    v[`--text-${s.id}-family`] = `var(--font-${s.role})`;
    v[`--text-${s.id}-case`] = s.upper ? 'uppercase' : 'none';
  }
  const g = res.grid[bp];
  v['--grid-columns'] = String(g.columns); v['--grid-gutter'] = g.gutter + 'px'; v['--grid-margin'] = g.margin + 'px';
  v['--container-max'] = res.grid.max + 'px';
  return v;
}

/** every token as one flat name → value list, to notice what just changed */
export function flat(res: Resolved): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of PALETTES) for (const s of STEPS) out[`color/${p}/${s}`] = res.palettes[p][s];
  for (const m of MODES) for (const [id, s] of Object.entries(res.semantic[m])) out[`${m}:color/${id}`] = s.ref;
  for (const s of res.type.styles) {
    out[`text/${s.id}/size`] = `${s.desktop.size}`; out[`text/${s.id}/m-size`] = `${s.mobile.size}`;
    out[`text/${s.id}/lh`] = `${s.desktop.lh}`; out[`text/${s.id}/weight`] = `${s.weight}`;
    out[`text/${s.id}/tracking`] = `${s.tracking}`;
  }
  for (const p of res.space.prims) out[`space/${p.name}`] = `${p.px}`;
  for (const [id, s] of Object.entries(res.space.sem)) out[`space/${id}`] = `${s.px}`;
  for (const [k, v] of Object.entries(res.radius.prims)) out[`radius/${k}`] = `${v}`;
  for (const [id, s] of Object.entries(res.radius.sem)) out[`radius/${id}`] = `${s.px}`;
  for (const b of BPS) for (const k of ['columns', 'gutter', 'margin'] as const) out[`grid/${b}/${k}`] = `${res.grid[b][k]}`;
  return out;
}

export const allFonts = FONTS;
