import { PALETTES, type IconDef, type Part, type Shape } from './set';
import { cssFor } from './motion';
import { hexToOklch, oklchToHex } from '../color';

/**
 * One drawing, six styles. Each style paints the same parts (so every moving part moves the
 * same way in all of them) and returns a complete <svg>: the page shows exactly what a copy
 * or a download gives you.
 */

export type IconStyle = 'regular' | 'duotone' | 'filled' | 'graphical' | 'glass' | 'isometric';
export const STYLES: { value: IconStyle; label: string; note: string }[] = [
  { value: 'regular', label: 'Regular', note: 'Outlines that draw themselves in' },
  { value: 'duotone', label: 'Duotone', note: 'A soft tint under the line' },
  { value: 'filled', label: 'Filled', note: 'Solid, with the details cut out' },
  { value: 'graphical', label: 'Graphical', note: 'Gradients, depth and a passing sheen' },
  { value: 'glass', label: 'Glass', note: 'Colour seen through frosted glass' },
  { value: 'isometric', label: 'Isometric', note: 'Raised on a floating tile' },
];

export type Palette = { light: string; base: string; dark: string; accent: string };
export type IconOpts = {
  /** stroke width on the 24 grid */
  stroke: number;
  /** line colour (regular, duotone, filled) */
  color: string;
  /** highlight colour (badges, flames) in the one-colour styles */
  accent: string;
  /** colours for graphical, glass and isometric: the icon's own unless given */
  palette?: Palette | null;
  /** unique per rendered icon (ids for gradients, masks and clips) */
  uid: string;
  play?: boolean;
  /** rendered width in px */
  size?: number;
  /** embed the motion CSS (exports) */
  css?: boolean;
};

/** a palette in the hue of one colour */
export function paletteFrom(hex: string): Palette {
  const [L, C, H] = hexToOklch(hex);
  return {
    light: oklchToHex(Math.min(0.93, L + 0.2), C * 0.7, H),
    base: hex,
    dark: oklchToHex(Math.max(0.25, L - 0.18), C, H),
    accent: oklchToHex(Math.min(0.85, Math.max(0.72, L + 0.1)), Math.max(0.12, C), (H + 150) % 360),
  };
}

type Paint = (s: Shape, dash: boolean) => string;

/** the parts, as nested groups; moving parts carry their motion */
function tree(parts: Part[], paint: Paint, dashed = false): string {
  return parts.map(p => {
    const dash = dashed || !!p.dash;
    const own = (p.s ?? []).map(s => paint(s, dash)).join('');
    const kids = p.kids ? tree(p.kids, paint, dash) : '';
    const inner = p.under ? kids + own : own + kids;
    if (!inner) return '';
    let attrs = '';
    if (p.a) {
      const vars = `--a:${p.a};${p.dur ? `--dur:${p.dur}s;` : ''}${p.dl ? `--dl:${p.dl}s;` : ''}${p.ease ? `--ease:${p.ease};` : ''}`;
      attrs = ` data-a="" style="${vars}transform-origin:${p.o?.[0] ?? 12}px ${p.o?.[1] ?? 12}px"`;
    } else if (p.dash) attrs = ` data-dash="" style="--dur:${p.dur ?? 2}s"`;
    return `<g${attrs}>${inner}</g>`;
  }).join('');
}

const path = (d: string, attrs: string) => `<path d="${d}"${attrs}/>`;
const motionsOf = (parts: Part[]): string[] => parts.flatMap(p => [...(p.a ? [p.a] : []), ...(p.kids ? motionsOf(p.kids) : [])]);
const strokeAttrs = (col: string, w: number) => ` stroke="${col}" stroke-width="${+w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"`;

export function iconSvg(def: IconDef, style: IconStyle, o: IconOpts): string {
  const pal = o.palette ?? PALETTES[def.palette];
  const C = o.color, A = o.accent, sw = o.stroke, id = (k: string) => `${o.uid}-${k}`;
  // ghost parts (sparkles) only show while the icon plays
  const visible = (ps: Part[]): Part[] => ps.filter(p => o.play || !p.ghost).map(p => (p.kids ? { ...p, kids: visible(p.kids) } : p));
  const parts = visible(def.parts);
  let defs = '', body = '', vb = '0 0 24 24', w = o.size ?? 24, hgt = w;

  // the solid shapes alone (clip paths for the sheen and the glass)
  const solids: Paint = s => (s.r === 'body' || s.r === 'accent' ? path(s.d, '') : '');

  if (style === 'regular') {
    body = `<g class="ic-root" fill="none"${strokeAttrs(C, sw)}>${tree(parts, (s, dash) =>
      s.r === 'hole' || s.r === 'dot' ? path(s.d, ` fill="${C}" stroke="none"`) : path(s.d, dash ? ' pathLength="1"' : ' pathLength="1" class="dr"'))}</g>`;
  }

  else if (style === 'duotone') {
    body = `<g class="ic-root" fill="none"${strokeAttrs(C, sw)}>${tree(parts, (s, dash) => {
      const pl = dash ? ' pathLength="1"' : '';
      if (s.r === 'body') return path(s.d, ` class="tint" fill="${C}" fill-opacity=".16"`);
      if (s.r === 'accent') return path(s.d, ` fill="${A}"`);
      if (s.r === 'hole' || s.r === 'dot') return path(s.d, ` fill="${C}" stroke="none"`);
      return path(s.d, pl);
    })}</g>`;
  }

  else if (style === 'filled') {
    // cuts and holes are knocked out with a mask that moves with the parts
    defs += `<mask id="${id('m')}" maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32"><rect x="-4" y="-4" width="32" height="32" fill="#fff"/>${tree(parts, (s, dash) =>
      s.r === 'cut' ? path(s.d, ` fill="none"${strokeAttrs('#000', sw * 1.05)}${dash ? ' pathLength="1"' : ''}`) : s.r === 'hole' ? path(s.d, ' fill="#000"') : '')}</mask>`;
    body = `<g class="ic-root"><g mask="url(#${id('m')})" fill="none"${strokeAttrs(C, sw)}>${tree(parts, s => {
      if (s.r === 'body') return path(s.d, ` fill="${C}"`);
      if (s.r === 'accent') return path(s.d, ` fill="${A}" stroke="${A}"`);
      if (s.r === 'dot') return path(s.d, ` fill="${C}" stroke="none"`);
      if (s.r === 'line') return path(s.d, '');
      return '';
    })}</g></g>`;
  }

  else if (style === 'graphical') {
    defs += `<linearGradient id="${id('g')}" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pal.light}"/><stop offset=".55" stop-color="${pal.base}"/><stop offset="1" stop-color="${pal.dark}"/></linearGradient>`
      + `<linearGradient id="${id('a')}" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pal.accent}"/><stop offset="1" stop-color="${shade(pal.accent, -0.12)}"/></linearGradient>`
      + `<linearGradient id="${id('s')}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
      + `<filter id="${id('f')}" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1.2" stdDeviation="1.2" flood-color="${pal.dark}" flood-opacity=".35"/></filter>`
      + `<clipPath id="${id('c')}">${tree(parts, solids)}</clipPath>`;
    body = `<g class="ic-root"><g filter="url(#${id('f')})" fill="none"${strokeAttrs(pal.base, sw)}>${tree(parts, (s, dash) => {
      const pl = dash ? ' pathLength="1"' : '';
      if (s.r === 'body') return path(s.d, ` fill="url(#${id('g')})" stroke="none"`);
      if (s.r === 'accent') return path(s.d, ` fill="url(#${id('a')})" stroke="none"`);
      if (s.r === 'cut') return path(s.d, ` stroke="#fff" stroke-opacity=".95" stroke-width="${+(sw * 0.9).toFixed(2)}"${pl}`);
      if (s.r === 'hole') return path(s.d, ' fill="#fff" fill-opacity=".95" stroke="none"');
      if (s.r === 'dot') return path(s.d, ` fill="${pal.base}" stroke="none"`);
      return path(s.d, pl);
    })}</g><g clip-path="url(#${id('c')})"><rect class="sheen" x="9" y="-4" width="5" height="32" fill="url(#${id('s')})"/></g></g>`;
  }

  else if (style === 'glass') {
    // a soft colour orb behind; the icon is a frosted pane over it, showing the orb blurred
    // where they overlap, with a bright edge
    const orb = `<circle cx="15.6" cy="8.6" r="5.8" fill="url(#${id('g')})"/>`;
    defs += `<linearGradient id="${id('g')}" x1="9" y1="2" x2="21" y2="15" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pal.light}"/><stop offset=".5" stop-color="${pal.base}"/><stop offset="1" stop-color="${pal.dark}"/></linearGradient>`
      + `<linearGradient id="${id('p')}" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".55" stop-color="${pal.light}" stop-opacity=".5"/><stop offset="1" stop-color="${pal.light}" stop-opacity=".78"/></linearGradient>`
      + `<filter id="${id('b')}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.7"/></filter>`
      + `<filter id="${id('d')}" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="1"/></filter>`
      + `<clipPath id="${id('c')}">${tree(parts, solids)}</clipPath>`;
    // a soft shadow under the pane lifts it off a light background
    const lift = `<g transform="translate(0 1)" filter="url(#${id('d')})" fill="${pal.dark}" fill-opacity=".2">${tree(parts, solids)}</g>`;
    body = `<g class="ic-root"><g class="gl-back">${orb}</g>${lift}`
      + `<g clip-path="url(#${id('c')})"><rect x="-2" y="-2" width="28" height="28" fill="#fff" fill-opacity=".35"/><g class="gl-back" filter="url(#${id('b')})">${orb}</g><rect x="-2" y="-2" width="28" height="28" fill="url(#${id('p')})"/></g>`
      + `<g fill="none"${strokeAttrs('#fff', sw * 0.6)}>${tree(parts, (s, dash) => {
        const pl = dash ? ' pathLength="1"' : '';
        if (s.r === 'body') return path(s.d, ` stroke="${pal.dark}" stroke-opacity=".22" stroke-width="${+(sw * 0.45).toFixed(2)}"`) + path(s.d, ' stroke-opacity=".95"');
        if (s.r === 'accent') return path(s.d, ` fill="${pal.accent}" stroke="#fff" stroke-opacity=".85"`);
        if (s.r === 'cut') return path(s.d, ` stroke="${pal.dark}" stroke-opacity=".75" stroke-width="${+(sw * 0.85).toFixed(2)}"${pl}`);
        if (s.r === 'hole') return path(s.d, ` fill="${pal.dark}" fill-opacity=".75" stroke="none"`);
        if (s.r === 'dot') return path(s.d, ` fill="${pal.base}" stroke="none"`);
        return path(s.d, ` stroke="${pal.base}" stroke-width="${sw}"${pl}`);
      })}</g></g>`;
  }

  else {
    // isometric: a rounded tile lying flat, extruded down, with the glyph raised on it in layers
    vb = '0 -6 48 44'; hgt = Math.round(w * 44 / 48);
    const F = 'translate(24 14) matrix(.866 .5 -.866 .5 0 0) translate(-12 -12)';
    const G = 'translate(2.4 2.4) scale(.8)';
    const tile = 'M5 0h14a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5z';
    defs += `<linearGradient id="${id('t')}" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e9eef5"/></linearGradient>`
      + `<linearGradient id="${id('g')}" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${pal.light}"/><stop offset="1" stop-color="${pal.base}"/></linearGradient>`
      + `<filter id="${id('b')}" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="1.6"/></filter>`;
    const sides = [3.6, 3, 2.4, 1.8, 1.2, 0.6].map(k => `<path d="${tile}" transform="translate(0 ${k}) ${F}" fill="#cdd6e2"/>`).join('');
    const E = 2.4, steps = [0, 0.4, 0.8, 1.2, 1.6, 2];
    const swG = sw * 1.15; // a touch heavier, it reads smaller on the tile
    const side = steps.map(k => `<g transform="translate(0 ${-k})"><g transform="${F} ${G}" fill="none"${strokeAttrs(pal.dark, swG)}>${tree(parts, s =>
      s.r === 'body' ? path(s.d, ` fill="${pal.dark}"`) : s.r === 'accent' ? path(s.d, ` fill="${shade(pal.accent, -0.2)}" stroke="${shade(pal.accent, -0.2)}"`)
        : s.r === 'dot' ? path(s.d, ` fill="${pal.dark}" stroke="none"`) : s.r === 'line' ? path(s.d, '') : '')}</g></g>`).join('');
    const top = `<g transform="translate(0 ${-E})"><g transform="${F} ${G}" fill="none"${strokeAttrs(pal.base, swG)}>${tree(parts, (s, dash) => {
      const pl = dash ? ' pathLength="1"' : '';
      if (s.r === 'body') return path(s.d, ` fill="url(#${id('g')})" stroke="none"`);
      if (s.r === 'accent') return path(s.d, ` fill="${pal.accent}" stroke="none"`);
      if (s.r === 'cut') return path(s.d, ` stroke="#fff" stroke-opacity=".95"${pl}`);
      if (s.r === 'hole') return path(s.d, ' fill="#fff" stroke="none"');
      if (s.r === 'dot') return path(s.d, ` fill="${pal.light}" stroke="none"`);
      return path(s.d, ` stroke="${pal.light}"${pl}`);
    })}</g></g>`;
    body = `<ellipse class="iso-shadow" cx="24" cy="34" rx="16" ry="4" fill="${pal.dark}" opacity=".5" filter="url(#${id('b')})"/>`
      + `<g class="iso-float">${sides}<path d="${tile}" transform="${F}" fill="url(#${id('t')})" stroke="#fff" stroke-width=".5"/>${side}${top}</g>`;
  }

  const css = o.css ? `<style>${cssFor(motionsOf(parts))}</style>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${hgt}" class="icx s-${style}${o.play ? ' ic-play' : ''}" role="img" aria-label="${def.name}">${css}${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
}

/** lighter (+) or darker (-) in OKLCH lightness */
function shade(hex: string, dl: number) {
  const [L, C, H] = hexToOklch(hex);
  return oklchToHex(Math.min(0.98, Math.max(0.1, L + dl)), C, H);
}
