import { cssFor, motionFor } from './motion';
import { hexToOklch, oklchToHex } from '../color';

/**
 * Seven styles from Phosphor's drawings (256 grid). Each icon brings three layers:
 *   line   the regular weight, an outline drawn as a filled shape
 *   solid  the fill weight, with its details already cut out
 *   body   the duotone weight's tint layer (the area inside the outline)
 * Every style returns a complete <svg>: the page shows exactly what a copy or a download
 * gives you, motion included.
 */

export type IconStyle = 'regular' | 'duotone' | 'filled' | 'graphical' | 'glass' | '3d' | 'isometric';
export const STYLES: { value: IconStyle; label: string; note: string }[] = [
  { value: 'regular', label: 'Regular', note: 'Outline' },
  { value: 'duotone', label: 'Duotone', note: 'Outline over a second tone' },
  { value: 'filled', label: 'Filled', note: 'Solid' },
  { value: 'graphical', label: 'Graphical', note: 'Gradient and depth' },
  { value: 'glass', label: 'Glass', note: 'Frosted layer over colour' },
  { value: '3d', label: '3D', note: 'Extruded and lit' },
  { value: 'isometric', label: 'Isometric', note: 'Raised on a tile' },
];
/** the styles that take a palette rather than an ink */
export const COLOURFUL = new Set<IconStyle>(['graphical', 'glass', '3d', 'isometric']);

export type Geo = { line: string; solid: string; body?: string };
export type IconRef = { name: string; cats: string[] };
export type Palette = { light: string; base: string; dark: string };
export type IconOpts = {
  /** ink for the one-colour styles */
  color: string;
  /** the second tone (duotone) */
  accent: string;
  /** colours for graphical, glass, 3D and isometric */
  palette: Palette;
  uid: string;
  play?: boolean;
  /** rendered width in px */
  size?: number;
  /** embed the motion CSS (exports) */
  css?: boolean;
};

/** restrained, one hue per category, for colouring by category */
export const CATEGORY_HUES: Record<string, string> = {
  arrows: '#475569', brands: '#4f46e5', commerce: '#c2410c', communications: '#2563eb', design: '#7c3aed',
  editor: '#334155', finances: '#047857', games: '#be185d', 'health-wellness': '#e11d48', 'maps-travel': '#0f766e',
  media: '#a21caf', nature: '#15803d', objects: '#b45309', office: '#0369a1', people: '#4f46e5', system: '#475569',
  'technology-development': '#0e7490', weather: '#0284c7',
};

/** light, base and dark of one colour */
export function paletteFrom(hex: string): Palette {
  const [L, C, H] = hexToOklch(hex);
  return {
    light: oklchToHex(Math.min(0.9, L + 0.17), C * 0.75, H),
    base: hex,
    dark: oklchToHex(Math.max(0.22, L - 0.17), C * 0.95, H),
  };
}
const shade = (hex: string, dl: number) => { const [L, C, H] = hexToOklch(hex); return oklchToHex(Math.min(0.97, Math.max(0.08, L + dl)), C, H); };

/** a drawing whole again (the data keeps its parts apart with "|") */
export const whole = (d: string) => d.replace(/\|/g, '');

export function iconSvg(icon: IconRef, geo: Geo, style: IconStyle, o: IconOpts): string {
  const m = motionFor(icon.name, icon.cats);
  const pal = o.palette, C = o.color, id = (k: string) => `${o.uid}-${k}`;
  const lines = geo.line.split('|'), solids = geo.solid.split('|');
  const solid = whole(geo.solid), body = geo.body || solid;
  const [ox, oy] = m.o ?? [128, 128];
  // the moving glyph; the later pieces follow the first a beat behind
  const moving = (inner: string, k = 0) =>
    `<g data-a="" style="--a:${m.a};--dur:${m.dur}s;--dl:${k * 50}ms;transform-origin:${ox}px ${oy}px">${inner}</g>`;
  const piece = (inner: string, k: number) => `<g class="pt" style="--k:${k}">${moving(inner, k)}</g>`;
  // draws the outline on: a wide stroke runs along every edge of each piece, under a mask
  const drawMask = () => `<mask id="${id('m')}" maskUnits="userSpaceOnUse" x="-40" y="-40" width="336" height="336">`
    + lines.map((d, k) => d.split(/(?=M)/).map(sub => `<path class="draw" style="--k:${k}" d="${sub}" pathLength="1" fill="none" stroke="#fff" stroke-width="36" stroke-linejoin="round"/>`).join('')).join('')
    + `<rect class="draw-all" x="-40" y="-40" width="336" height="336" fill="#fff"/></mask>`;
  let defs = '', out = '', vb = '0 0 256 256';
  const w = o.size ?? 24;
  let h = w;

  if (style === 'regular' || style === 'duotone') {
    defs = drawMask();
    const tint = style === 'duotone' ? `<g class="tint-in">${moving(`<path class="tint" d="${body}" fill="${o.accent}" fill-opacity=".2"/>`)}</g>` : '';
    out = `<g class="ic-root">${tint}<g mask="url(#${id('m')})">${lines.map((d, k) => piece(`<path d="${d}" fill="${C}"/>`, k)).join('')}</g></g>`;
  }

  else if (style === 'filled') {
    out = `<g class="ic-root">${solids.map((d, k) => piece(`<path d="${d}" fill="${C}"/>`, k)).join('')}</g>`;
  }

  else if (style === 'graphical') {
    defs = `<linearGradient id="${id('g')}" x1="40" y1="16" x2="216" y2="240" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pal.light}"/><stop offset=".55" stop-color="${pal.base}"/><stop offset="1" stop-color="${pal.dark}"/></linearGradient>`
      + `<linearGradient id="${id('h')}" x1="0" y1="24" x2="0" y2="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
      + `<linearGradient id="${id('l')}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
      + `<filter id="${id('f')}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="${pal.dark}" flood-opacity=".28"/></filter>`
      + `<clipPath id="${id('c')}"><path d="${solid}"/></clipPath>`;
    out = `<g class="ic-root"><g filter="url(#${id('f')})">${solids.map((d, k) => piece(`<path d="${d}" fill="url(#${id('g')})"/><path d="${d}" fill="url(#${id('h')})"/>`, k)).join('')}</g>`
      + `<g clip-path="url(#${id('c')})"><rect class="sheen" x="100" y="-40" width="48" height="340" fill="url(#${id('l')})"/></g></g>`;
  }

  else if (style === 'glass') {
    vb = '-8 -16 280 280';
    // two layers: the icon in colour, set back and to the side, under a frosted pane of itself
    defs = `<path id="${id('s')}" d="${solid}"/>`
      + `<linearGradient id="${id('g')}" x1="96" y1="24" x2="232" y2="180" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pal.light}"/><stop offset=".5" stop-color="${pal.base}"/><stop offset="1" stop-color="${pal.dark}"/></linearGradient>`
      + `<linearGradient id="${id('p')}" x1="30" y1="20" x2="226" y2="236" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".82"/><stop offset=".6" stop-color="${pal.light}" stop-opacity=".36"/><stop offset="1" stop-color="${pal.light}" stop-opacity=".64"/></linearGradient>`
      + `<linearGradient id="${id('e')}" x1="40" y1="30" x2="216" y2="226" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".85"/></linearGradient>`
      + `<filter id="${id('b')}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>`
      + `<filter id="${id('d')}" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="9"/></filter>`
      + `<clipPath id="${id('c')}"><use href="#${id('s')}"/></clipPath>`;
    const orb = `<use href="#${id('s')}" transform="translate(20 -18)" fill="url(#${id('g')})"/>`;
    out = `<g class="ic-root"><g class="gl-in back"><g class="gl-back">${orb}</g></g><g class="gl-in front">${moving(
      `<use href="#${id('s')}" transform="translate(0 9)" filter="url(#${id('d')})" fill="${pal.dark}" fill-opacity=".16"/>`
      + `<g clip-path="url(#${id('c')})"><rect width="256" height="256" fill="#fff" fill-opacity=".5"/><g class="gl-back" filter="url(#${id('b')})">${orb}</g><rect width="256" height="256" fill="url(#${id('p')})"/></g>`
      + `<use href="#${id('s')}" fill="none" stroke="${pal.dark}" stroke-opacity=".14" stroke-width="5"/><use href="#${id('s')}" fill="none" stroke="url(#${id('e')})" stroke-width="3"/>`)}</g></g>`;
  }

  else if (style === '3d') {
    // extruded: copies stacked along a direction that swings as it plays (--t), the face on top
    vb = '-14 -10 284 290'; h = Math.round(w * 290 / 284);
    defs = `<path id="${id('s')}" d="${solid}"/>`
      + `<linearGradient id="${id('g')}" x1="40" y1="10" x2="200" y2="240" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pal.light}"/><stop offset="1" stop-color="${pal.base}"/></linearGradient>`
      + `<linearGradient id="${id('h')}" x1="0" y1="20" x2="0" y2="140" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
      + `<filter id="${id('f')}" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="8"/></filter>`;
    const N = 7;
    const layers = Array.from({ length: N }, (_, k) => N - k).map(i =>
      `<use href="#${id('s')}" class="layer" style="--i:${i}" fill="${shade(pal.dark, -0.06 * (i / N))}"/>`).join('');
    out = `<ellipse cx="128" cy="266" rx="88" ry="10" fill="${pal.dark}" opacity=".2" filter="url(#${id('f')})"/>`
      + `<g class="ic-root">${moving(`${layers}<use href="#${id('s')}" fill="url(#${id('g')})"/><use href="#${id('s')}" fill="url(#${id('h')})"/>`)}</g>`;
  }

  else {
    // isometric: a rounded tile lying flat, extruded down, the icon raised on it in layers
    vb = '0 -6 48 44'; h = Math.round(w * 44 / 48);
    const F = 'translate(24 14) matrix(.866 .5 -.866 .5 0 0) translate(-12 -12)';
    const G = 'translate(1.1 1.1) scale(.085)';
    const tile = 'M5 0h14a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5z';
    defs = `<path id="${id('s')}" d="${solid}"/><path id="${id('k')}" d="${tile}"/>`
      + `<linearGradient id="${id('t')}" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e8edf3"/></linearGradient>`
      + `<linearGradient id="${id('g')}" x1="40" y1="20" x2="216" y2="236" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pal.light}"/><stop offset="1" stop-color="${pal.base}"/></linearGradient>`
      + `<filter id="${id('b')}" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="1.6"/></filter>`;
    const sides = [3, 2.5, 2, 1.5, 1, 0.5].map(k => `<use href="#${id('k')}" transform="translate(0 ${k}) ${F}" fill="#c9d2de"/>`).join('');
    const raise = (j: number, fill: string) => `<g class="raise" style="--j:${j}"><g transform="${F} ${G}">${moving(`<use href="#${id('s')}" fill="${fill}"/>`)}</g></g>`;
    out = `<ellipse class="iso-shadow" cx="24" cy="34" rx="16" ry="4" fill="#334155" opacity=".3" filter="url(#${id('b')})"/>`
      + `<g class="iso-in"><g class="iso-float">${sides}<use href="#${id('k')}" transform="${F}" fill="url(#${id('t')})" stroke="#fff" stroke-width=".4"/>`
      + [0, 1, 2, 3, 4].map(j => raise(j, pal.dark)).join('') + raise(5, `url(#${id('g')})`) + `</g></g>`;
  }

  const css = o.css ? `<style>${cssFor(m.a)}</style>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" class="icx s-${style}${o.play ? ' ic-play' : ''}" role="img" aria-label="${icon.name.replace(/-/g, ' ')}">${css}${defs ? `<defs>${defs}</defs>` : ''}${out}</svg>`;
}
