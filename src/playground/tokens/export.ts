import { hexToRgb } from '../color';
import { fontByName, fontHref } from '../data';
import {
  BPS, LEVELS, LEVEL_USE, PALETTES, RADII, RADIUS_SEM, SEMANTIC, SPACE_SEM, STEPS, familyCss, type Layer, type Ref, type Resolved,
} from './model';
import { PLUGIN_CODE } from './plugin';

/**
 * The system, written out: one list of tokens (collections, modes, values and aliases), and
 * from it CSS, Tailwind, DTCG JSON and a Figma plugin that builds the variables and styles.
 */

type TType = 'color' | 'dimension' | 'number' | 'fontFamily' | 'fontWeight' | 'shadow' | 'typography';
export type Coll = 'primitives' | 'color' | 'size' | 'typography' | 'effects' | 'layout';
type V = { value?: unknown; alias?: string };
export type Tok = { path: string; type: TType; coll: Coll; modes: V[]; desc?: string };

export const COLLS: Record<Coll, { name: string; modes: string[] }> = {
  primitives: { name: 'Primitives', modes: ['Value'] },
  color: { name: 'Color', modes: ['Light', 'Dark'] },
  size: { name: 'Size', modes: ['Value'] },
  typography: { name: 'Typography', modes: ['Desktop', 'Mobile'] },
  effects: { name: 'Effects', modes: ['Light', 'Dark'] },
  layout: { name: 'Layout', modes: ['Value'] },
};

const WEIGHT_NAMES: Record<number, string> = { 100: 'thin', 200: 'extralight', 300: 'light', 400: 'regular', 500: 'medium', 600: 'semibold', 700: 'bold', 800: 'extrabold', 900: 'black' };
const refPath = (r: Ref) => (r === 'white' || r === 'black' ? `color/${r}` : `color/${r.replace('.', '/')}`);
const weightPath = (w: number) => `font/weight/${WEIGHT_NAMES[w] ?? w}`;
const r4 = (n: number) => +n.toFixed(4);

export function tokenList(res: Resolved): Tok[] {
  const T: Tok[] = [];
  const add = (path: string, type: TType, coll: Coll, modes: V[], desc?: string) => T.push({ path, type, coll, modes, desc });
  for (const p of PALETTES) for (const s of STEPS) add(`color/${p}/${s}`, 'color', 'primitives', [{ value: res.palettes[p][s] }]);
  add('color/white', 'color', 'primitives', [{ value: '#ffffff' }]);
  add('color/black', 'color', 'primitives', [{ value: '#000000' }]);
  for (const p of res.space.prims) add(`space/${p.name}`, 'dimension', 'primitives', [{ value: p.px }]);
  for (const k of RADII) add(`radius/${k}`, 'dimension', 'primitives', [{ value: res.radius.prims[k] }]);
  const weights = [...new Set([400, 500, 600, 700, ...res.type.styles.map(s => s.weight), ...Object.values(res.type.weights)])].sort((a, b) => a - b);
  for (const w of weights) add(weightPath(w), 'fontWeight', 'primitives', [{ value: w }]);

  for (const s of SEMANTIC) add(`color/${s.id}`, 'color', 'color', (['light', 'dark'] as const).map(m => ({ alias: refPath(res.semantic[m][s.id].ref) })), s.use);
  for (const s of SPACE_SEM) add(`space/${s.id}`, 'dimension', 'size', [{ alias: `space/${res.space.sem[s.id].ref}` }], s.use);
  for (const s of RADIUS_SEM) add(`radius/${s.id}`, 'dimension', 'size', [{ alias: `radius/${res.radius.sem[s.id].ref}` }], s.use);

  const fam = res.type.families;
  for (const k of ['heading', 'body', 'mono'] as const) add(`font/family/${k}`, 'fontFamily', 'typography', [{ value: fam[k] }, { value: fam[k] }]);
  for (const k of ['heading', 'body', 'strong'] as const) add(`font/weight/${k}`, 'fontWeight', 'typography', [{ alias: weightPath(res.type.weights[k]) }, { alias: weightPath(res.type.weights[k]) }]);
  for (const s of res.type.styles) {
    const both = (f: (m: typeof s.desktop) => unknown) => [{ value: f(s.desktop) }, { value: f(s.mobile) }];
    add(`text/${s.id}/size`, 'dimension', 'typography', both(m => m.size));
    add(`text/${s.id}/line-height`, 'dimension', 'typography', both(m => m.lh));
    add(`text/${s.id}/letter-spacing`, 'dimension', 'typography', both(m => +(s.tracking * m.size).toFixed(2)));
    add(`text/${s.id}/weight`, 'fontWeight', 'typography', [{ alias: weightPath(s.weight) }, { alias: weightPath(s.weight) }]);
    add(`typography/${s.id}`, 'typography', 'typography', [s.desktop, s.mobile].map(m => ({
      value: { fontFamily: `{font.family.${s.role}}`, fontSize: `{text.${s.id}.size}`, fontWeight: `{text.${s.id}.weight}`, letterSpacing: `{text.${s.id}.letter-spacing}`, lineHeight: r4(m.lh / m.size) },
    })), s.label);
  }
  for (const l of LEVELS) add(`shadow/${l}`, 'shadow', 'effects', [{ value: res.shadow.light[l] }, { value: res.shadow.dark[l] }], LEVEL_USE[l]);
  for (const b of BPS) {
    add(`grid/${b}/columns`, 'number', 'layout', [{ value: res.grid[b].columns }]);
    add(`grid/${b}/gutter`, 'dimension', 'layout', [{ value: res.grid[b].gutter }]);
    add(`grid/${b}/margin`, 'dimension', 'layout', [{ value: res.grid[b].margin }]);
  }
  add('breakpoint/tablet', 'dimension', 'layout', [{ value: res.grid.tabletAt }]);
  add('breakpoint/desktop', 'dimension', 'layout', [{ value: res.grid.desktopAt }]);
  add('container/max', 'dimension', 'layout', [{ value: res.grid.max }]);
  return T;
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tokens';
const cssVar = (path: string, prefix: string) => `--${prefix ? slug(prefix) + '-' : ''}${path.replace(/\//g, '-')}`;
const rgba = (l: Layer) => `rgba(${l.rgb.join(', ')}, ${l.a})`;
const shadowValue = (ls: Layer[]) => ls.map(l => `0 ${l.y}px ${l.blur}px ${l.spread}px ${rgba(l)}`).join(', ') || 'none';

/** the @import lines for the chosen fonts (none for fonts not on Google Fonts or Fontshare) */
function fontImports(res: Resolved) {
  const names = [...new Set(Object.values(res.type.families))];
  return names.map(n => { const f = fontByName(n); const h = f && fontHref(f); return h ? `@import url('${h}');` : null; }).filter(Boolean).join('\n');
}

/* ---------- CSS ---------- */

export function toCss(res: Resolved, prefix = ''): string {
  const v = (p: string) => cssVar(p, prefix);
  const toks = tokenList(res);
  const val = (t: Tok, i: number): string => {
    const m = t.modes[i] ?? t.modes[0];
    if (m.alias) return `var(${v(m.alias)})`;
    if (t.type === 'dimension') return `${m.value}px`;
    return String(m.value);
  };
  const line = (name: string, value: string) => `  ${name}: ${value};`;
  const of = (c: Coll) => toks.filter(t => t.coll === c);
  const fams = (['heading', 'body', 'mono'] as const).map(k => line(v(`font/family/${k}`), familyCss(res.type.families[k])));
  const typeVars = (i: 0 | 1) => res.type.styles.flatMap(s => {
    const m = i === 0 ? s.desktop : s.mobile;
    return [line(v(`text/${s.id}/size`), `${m.size}px`), line(v(`text/${s.id}/line-height`), String(r4(m.lh / m.size)))];
  });
  const colours = (i: 0 | 1) => [...of('color').map(t => line(v(t.path), val(t, i))), ...LEVELS.map(l => line(v(`shadow/${l}`), shadowValue(res.shadow[i ? 'dark' : 'light'][l])))];
  const grid = (b: (typeof BPS)[number]) => [line(v('grid/columns'), `var(${v(`grid/${b}/columns`)})`), line(v('grid/gutter'), `var(${v(`grid/${b}/gutter`)})`), line(v('grid/margin'), `var(${v(`grid/${b}/margin`)})`)];
  const indent = (ls: string[]) => ls.map(l => '  ' + l);

  return [
    `/* ${res.name} design tokens. Mobile first; desktop type from ${res.grid.tabletAt}px. Dark mode: data-theme="dark", or the system setting. */`,
    fontImports(res),
    '',
    ':root {',
    '  /* primitives */',
    ...of('primitives').map(t => line(v(t.path), val(t, 0))),
    '',
    '  /* spacing and radius */',
    ...of('size').map(t => line(v(t.path), val(t, 0))),
    '',
    '  /* type */',
    ...fams,
    ...(['heading', 'body', 'strong'] as const).map(k => line(v(`font/weight/${k}`), `var(${v(weightPath(res.type.weights[k]))})`)),
    ...res.type.styles.flatMap(s => [line(v(`text/${s.id}/weight`), `var(${v(weightPath(s.weight))})`), line(v(`text/${s.id}/letter-spacing`), `${s.tracking}em`)]),
    ...typeVars(1),
    '',
    '  /* layout */',
    ...of('layout').map(t => line(v(t.path), val(t, 0))),
    ...grid('mobile'),
    '',
    '  /* colour and depth, light */',
    '  color-scheme: light;',
    ...colours(0),
    '}',
    '',
    `@media (min-width: ${res.grid.tabletAt}px) {`, '  :root {', ...indent(typeVars(0)), ...indent(grid('tablet')), '  }', '}',
    `@media (min-width: ${res.grid.desktopAt}px) {`, '  :root {', ...indent(grid('desktop')), '  }', '}',
    '',
    '[data-theme="dark"] {', '  color-scheme: dark;', ...colours(1), '}',
    '@media (prefers-color-scheme: dark) {', '  :root:not([data-theme="light"]) {', '    color-scheme: dark;', ...indent(colours(1)), '  }', '}',
    '',
    '/* text styles */',
    ...res.type.styles.map(s => `.text-${s.id} { font-family: var(${v(`font/family/${s.role}`)}); font-size: var(${v(`text/${s.id}/size`)}); line-height: var(${v(`text/${s.id}/line-height`)}); font-weight: var(${v(`text/${s.id}/weight`)}); letter-spacing: var(${v(`text/${s.id}/letter-spacing`)});${s.upper ? ' text-transform: uppercase;' : ''} }`),
    '',
  ].join('\n');
}

/* ---------- Tailwind v4 ---------- */

const twColor = (id: string) => {
  const [g, n] = id.split('/');
  if (g === 'bg') return n;
  if (g === 'fg') return n === 'default' ? 'fg' : `fg-${n}`;
  return n === 'default' ? 'border' : `border-${n}`;
};
export function toTailwind(res: Resolved): string {
  const sem = (m: 'light' | 'dark') => SEMANTIC.map(s => `  --tk-${s.id.replace('/', '-')}: var(--color-${refPath(res.semantic[m][s.id].ref).slice(6).replace('/', '-')});`);
  const shadows = (m: 'light' | 'dark') => LEVELS.map(l => `  --tk-shadow-${l}: ${shadowValue(res.shadow[m][l])};`);
  const sizes = (k: 'desktop' | 'mobile') => res.type.styles.flatMap(s => [`--tk-text-${s.id}: ${s[k].size}px;`, `--tk-text-${s.id}-lh: ${r4(s[k].lh / s[k].size)};`]);
  const linear = res.space.prims.every(p => p.px === p.mult * res.space.base);
  return [
    `/* ${res.name} tokens for Tailwind CSS v4. Classes: bg-surface, text-fg-muted, border-border, p-inset-md, rounded-card, text-h1, shadow-md. */`,
    fontImports(res),
    '@import "tailwindcss";',
    '',
    '@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));',
    '',
    '@theme {',
    '  /* palettes: bg-brand-500, text-neutral-700 */',
    ...PALETTES.flatMap(p => STEPS.map(s => `  --color-${p}-${s}: ${res.palettes[p][s]};`)),
    '  --color-white: #ffffff;',
    '  --color-black: #000000;',
    '',
    linear ? `  --spacing: ${res.space.base}px; /* p-4 = ${4 * res.space.base}px */` : `  /* your scale isn't linear, so spacing uses the named steps below */`,
    ...res.space.prims.map(p => `  --spacing-${p.name}: ${p.px}px;`),
    ...SPACE_SEM.map(s => `  --spacing-${s.id.replace('/', '-')}: ${res.space.sem[s.id].px}px;`),
    '',
    ...RADII.map(k => `  --radius-${k}: ${res.radius.prims[k]}px;`),
    ...RADIUS_SEM.map(s => `  --radius-${s.id}: var(--radius-${res.radius.sem[s.id].ref});`),
    '',
    `  --font-heading: ${familyCss(res.type.families.heading)};`,
    `  --font-body: ${familyCss(res.type.families.body)};`,
    `  --font-mono: ${familyCss(res.type.families.mono)};`,
    '',
    `  --breakpoint-md: ${res.grid.tabletAt}px;`,
    `  --breakpoint-lg: ${res.grid.desktopAt}px;`,
    `  --container-content: ${res.grid.max}px;`,
    '}',
    '',
    '@theme inline {',
    ...SEMANTIC.map(s => `  --color-${twColor(s.id)}: var(--tk-${s.id.replace('/', '-')});`),
    ...LEVELS.map(l => `  --shadow-${l}: var(--tk-shadow-${l});`),
    ...res.type.styles.flatMap(s => [
      `  --text-${s.id}: var(--tk-text-${s.id});`,
      `  --text-${s.id}--line-height: var(--tk-text-${s.id}-lh);`,
      ...(s.tracking ? [`  --text-${s.id}--letter-spacing: ${s.tracking}em;`] : []),
      `  --text-${s.id}--font-weight: ${s.weight};`,
    ]),
    '}',
    '',
    ':root {',
    ...sem('light'), ...shadows('light'), ...sizes('mobile').map(x => '  ' + x),
    '}',
    `@media (width >= ${res.grid.tabletAt}px) {`, '  :root {', ...sizes('desktop').map(x => '    ' + x), '  }', '}',
    '[data-theme=dark] {', ...sem('dark'), ...shadows('dark'), '}',
    '',
  ].join('\n');
}

/* ---------- DTCG (Design Tokens Community Group) JSON ---------- */

export type ValueStyle = 'objects' | 'strings';
const colorValue = (hex: string, style: ValueStyle, alpha = 1) => {
  if (style === 'strings') return alpha === 1 ? hex : hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
  return { colorSpace: 'srgb', components: hexToRgb(hex).map(c => r4(c / 255)), alpha, hex };
};
const dim = (px: number, style: ValueStyle) => (style === 'strings' ? `${px}px` : { value: px, unit: 'px' });
const toHex = (rgb: [number, number, number]) => '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');

function dtcgValue(t: Tok, v: V, style: ValueStyle): unknown {
  if (v.alias) return `{${v.alias.replace(/\//g, '.')}}`;
  switch (t.type) {
    case 'color': return colorValue(v.value as string, style);
    case 'dimension': return dim(v.value as number, style);
    case 'fontFamily': { const f = fontByName(v.value as string); return [v.value, f ? (f.cat === 'mono' ? 'monospace' : f.cat === 'serif' || f.cat === 'slab' ? 'serif' : 'sans-serif') : 'sans-serif']; }
    case 'shadow': return (v.value as Layer[]).map(l => ({ color: colorValue(toHex(l.rgb), style, l.a), offsetX: dim(0, style), offsetY: dim(l.y, style), blur: dim(l.blur, style), spread: dim(l.spread, style) }));
    default: return v.value;
  }
}

/** one file per collection and mode, the way Figma imports and exports variables */
export function dtcgFiles(res: Resolved, style: ValueStyle, prefix = ''): { name: string; data: string }[] {
  const toks = tokenList(res);
  const files: { name: string; data: string }[] = [];
  for (const [c, meta] of Object.entries(COLLS) as [Coll, (typeof COLLS)[Coll]][]) {
    meta.modes.forEach((mode, i) => {
      const root: Record<string, unknown> = {};
      for (const t of toks.filter(x => x.coll === c)) {
        const parts = t.path.split('/');
        let node = root as Record<string, unknown>;
        for (const p of parts.slice(0, -1)) node = (node[p] ??= {}) as Record<string, unknown>;
        const leaf: Record<string, unknown> = { $type: t.type, $value: dtcgValue(t, t.modes[i] ?? t.modes[0], style) };
        if (t.desc) leaf.$description = t.desc;
        if (t.type !== 'typography' && t.type !== 'shadow') leaf.$extensions = { 'com.figma': { codeSyntax: { WEB: `var(${cssVar(t.path, prefix)})` }, ...(c === 'primitives' ? { scopes: [] } : {}) } };
        node[parts[parts.length - 1]] = leaf;
      }
      const name = meta.modes.length > 1 ? `${c}.${mode.toLowerCase()}.json` : `${c}.json`;
      files.push({ name, data: JSON.stringify(root, null, 2) + '\n' });
    });
  }
  return files;
}

export function dtcgReadme(res: Resolved) {
  return `# ${res.name} tokens (DTCG)

Design tokens in the Design Tokens Community Group format, one file per collection and mode:

- primitives.json: palettes, the spacing and radius scales, font weights
- color.light.json, color.dark.json: semantic colours, as aliases of primitives
- size.json: semantic spacing and radius
- typography.desktop.json, typography.mobile.json: families, sizes, line heights, and a typography token per style
- effects.light.json, effects.dark.json: shadows
- layout.json: grid columns, gutters and margins, breakpoints

Aliases point across files ({color.neutral.900}), so import primitives first.
Composite tokens (typography, shadow) are for tools that read them, such as Style Dictionary or Tokens Studio; Figma variables can't hold them. The Figma plugin turns them into text and effect styles instead.
`;
}

/* ---------- Figma plugin ---------- */

type FigVal = number | string | boolean | number[] | { alias: [string, string] };
type FigVar = { n: string; t: 'COLOR' | 'FLOAT' | 'STRING'; v: FigVal[]; s?: string[]; c?: string; d?: string };

const SCOPES = (t: Tok): string[] => {
  if (t.coll === 'primitives' || t.coll === 'layout') return [];
  const p = t.path;
  if (p.startsWith('color/bg/')) return ['FRAME_FILL', 'SHAPE_FILL'];
  if (p.startsWith('color/fg/')) return ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
  if (p.startsWith('color/border/')) return ['STROKE_COLOR'];
  if (p.startsWith('space/')) return ['GAP'];
  if (p.startsWith('radius/')) return ['CORNER_RADIUS'];
  if (p.startsWith('font/family/')) return ['FONT_FAMILY'];
  if (p.startsWith('font/weight/') || p.endsWith('/weight')) return ['FONT_WEIGHT'];
  if (p.endsWith('/size')) return ['FONT_SIZE'];
  if (p.endsWith('/line-height')) return ['LINE_HEIGHT'];
  return [];
};
const figName = (t: Tok) => (t.coll === 'color' ? t.path.replace(/^color\//, '') : t.path);

export function figmaData(res: Resolved, prefix = '') {
  const toks = tokenList(res);
  const byPath = new Map(toks.map(t => [t.path, t]));
  const rgb01 = (hex: string, a = 1) => [...hexToRgb(hex).map(c => r4(c / 255)), a];
  const collections = (['primitives', 'color', 'size', 'typography', 'layout'] as Coll[]).map(c => ({
    name: COLLS[c].name, modes: COLLS[c].modes,
    vars: toks.filter(t => t.coll === c && t.type !== 'typography' && !t.path.endsWith('/letter-spacing')).map((t): FigVar => ({
      n: figName(t),
      t: t.type === 'color' ? 'COLOR' : t.type === 'fontFamily' ? 'STRING' : 'FLOAT',
      v: t.modes.map(m => {
        if (m.alias) { const target = byPath.get(m.alias)!; return { alias: [COLLS[target.coll].name, figName(target)] }; }
        return t.type === 'color' ? rgb01(m.value as string) : (m.value as number | string);
      }),
      s: SCOPES(t), c: `var(${cssVar(t.path, prefix)})`, d: t.desc,
    })),
  }));
  const text = res.type.styles.map(s => ({
    name: s.figma, family: s.family, weight: s.weight, size: s.desktop.size, lh: s.desktop.lh,
    tracking: +(s.tracking * 100).toFixed(2), upper: s.upper,
    desc: `${s.label}. Desktop ${s.desktop.size}/${s.desktop.lh}, mobile ${s.mobile.size}/${s.mobile.lh}: switch the Typography mode to swap.`,
    bind: { size: ['Typography', `text/${s.id}/size`], lh: ['Typography', `text/${s.id}/line-height`] },
  }));
  const effects = (['light', 'dark'] as const).flatMap(m => LEVELS.map(l => ({
    name: m === 'light' ? `Elevation/${l}` : `Elevation/Dark/${l}`, desc: LEVEL_USE[l],
    layers: res.shadow[m][l].map(x => ({ y: x.y, blur: x.blur, spread: x.spread, c: [...x.rgb.map(c => r4(c / 255)), x.a] })),
  })));
  const grids = BPS.map(b => {
    const g = res.grid[b];
    const center = b === 'desktop';
    return { name: `Grid/${b[0].toUpperCase() + b.slice(1)}`, columns: g.columns, gutter: g.gutter, margin: g.margin, center, section: r4((res.grid.max - g.gutter * (g.columns - 1)) / g.columns) };
  });
  return { name: res.name, collections, text, effects, grids };
}

export function figmaPlugin(res: Resolved, prefix = '') {
  const data = figmaData(res, prefix);
  const id = `tokens-${slug(res.name)}`;
  const manifest = {
    name: `${res.name} tokens`, id, api: '1.0.0', main: 'code.js', editorType: ['figma'],
    documentAccess: 'dynamic-page', networkAccess: { allowedDomains: ['none'] },
  };
  const readme = `# ${res.name} tokens for Figma

This is a small Figma plugin that builds your design system in any Figma file.

1. Unzip this folder.
2. In the Figma desktop app, open a file, then Plugins > Development > Import plugin from manifest, and choose manifest.json.
3. Run it from Plugins > Development > ${res.name} tokens.

It creates, or updates if you run it again:

- Variables: Primitives (palettes, spacing, radius, weights, hidden from pickers), Color (Light and Dark modes), Size (semantic spacing and radius), Typography (Desktop and Mobile modes), Layout (grids and breakpoints)
- Text styles, with size and line height bound to the Typography variables, so switching a frame to Mobile resizes its text
- Effect styles for every elevation level, light and dark
- Grid styles for mobile, tablet and desktop
- A "Tokens" page that shows it all

Semantic variables carry CSS code syntax, so Dev Mode shows var(--color-bg-surface) and the like. Light and Dark as modes of one collection need a paid Figma plan; on the free plan the plugin makes a separate collection for the second mode.
Fonts come from what Figma has. If one is missing, Inter stands in and the plugin says so.
`;
  return [
    { name: 'manifest.json', data: JSON.stringify(manifest, null, 2) + '\n' },
    { name: 'code.js', data: PLUGIN_CODE.replace('__DATA__', JSON.stringify(data)) },
    { name: 'README.md', data: readme },
  ];
}
