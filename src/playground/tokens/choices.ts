import { hexToOklch, oklchToHex } from '../color';
import { extract } from '../ImagePalette';
import { fontByName, fontHref } from '../data';
import type { RadiusKey, State } from './model';

/**
 * The quick choices: each one is a whole decision a designer would make ("rounder",
 * "more space", "this pairing"), set in one tap. They write several tokens at once; which
 * one is current is read back from the state, so fine-tuning and quick choices agree.
 */

export type Edit = (fn: (s: State) => State, key?: string) => void;

export const SWATCHES = ['#2f6bed', '#7c3aed', '#d9467a', '#e5484d', '#f97316', '#ca8a04', '#16a34a', '#0f766e', '#0891b2', '#334155'];

/** accents that sit well with a brand colour: across the wheel, split, triad, neighbour */
export function accentsFor(brand: string): string[] {
  const [, C, H] = hexToOklch(brand);
  const c = Math.max(0.12, Math.min(0.17, C || 0.14));
  return [180, 150, 120, 40].map(d => oklchToHex(0.7, c, (H + d + 360) % 360));
}
/** a new brand colour, with the accent keeping the same relationship to it if it had one */
export function withBrand(s: State, brand: string): State {
  const was = accentsFor(s.color.brand).indexOf(s.color.accent);
  return { ...s, color: { ...s.color, brand, accent: was >= 0 ? accentsFor(brand)[was] : s.color.accent } };
}

export const GREYS = [
  { id: 'neutral', label: 'Neutral', lean: 'brand', tint: 0.06 },
  { id: 'tinted', label: 'Tinted', lean: 'brand', tint: 0.45 },
  { id: 'warm', label: 'Warm', lean: 'warm', tint: 0.4 },
  { id: 'cool', label: 'Cool', lean: 'cool', tint: 0.4 },
] as const;
export const greysPreview = (lean: string, tint: number, brand: string) => {
  const h = lean === 'brand' ? hexToOklch(brand)[2] : lean === 'warm' ? 70 : 255;
  return [0.96, 0.82, 0.58, 0.3].map(l => oklchToHex(l, tint * 0.04, h));
};

export const TYPE_PAIRS = [
  { heading: 'Plus Jakarta Sans', body: 'Inter', weight: 700, mood: 'Clean' },
  { heading: 'Inter', body: 'Inter', weight: 600, mood: 'Plain' },
  { heading: 'Space Grotesk', body: 'IBM Plex Sans', weight: 600, mood: 'Technical' },
  { heading: 'Bricolage Grotesque', body: 'DM Sans', weight: 700, mood: 'Playful' },
  { heading: 'Fraunces', body: 'Inter', weight: 600, mood: 'Editorial' },
  { heading: 'Instrument Serif', body: 'Inter', weight: 400, mood: 'Elegant' },
  { heading: 'Outfit', body: 'Manrope', weight: 600, mood: 'Friendly' },
  { heading: 'Syne', body: 'Manrope', weight: 700, mood: 'Bold' },
  { heading: 'Playfair Display', body: 'Source Serif 4', weight: 600, mood: 'Classic' },
  { heading: 'Chillax', body: 'Sofia Sans', weight: 600, mood: 'Soft' },
  { heading: 'Unbounded', body: 'Work Sans', weight: 600, mood: 'Loud' },
  { heading: 'Sora', body: 'Karla', weight: 600, mood: 'Modern' },
].filter(p => fontByName(p.heading) && fontByName(p.body));

/** add a font's stylesheet so it can be shown, without forcing every weight to download */
const added = new Set<string>();
export function fontCss(name: string) {
  const f = fontByName(name);
  const href = f && fontHref(f);
  if (!href || added.has(href) || ['Chillax', 'Sofia Sans'].includes(name)) return;
  added.add(href);
  if (document.querySelector(`link[href="${CSS.escape(href)}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet'; link.href = href;
  document.head.appendChild(link);
}

export const TEXT_SIZES = [
  { id: 's', label: 'Small', base: 15, mBase: 15 },
  { id: 'm', label: 'Medium', base: 16, mBase: 16 },
  { id: 'l', label: 'Large', base: 18, mBase: 17 },
];
export const SCALES = [
  { id: 'subtle', label: 'Subtle', ratio: 1.2, mRatio: 1.125 },
  { id: 'balanced', label: 'Balanced', ratio: 1.25, mRatio: 1.2 },
  { id: 'bold', label: 'Bold', ratio: 1.333, mRatio: 1.2 },
  { id: 'dramatic', label: 'Dramatic', ratio: 1.414, mRatio: 1.25 },
];

type Map6 = State['radius']['map'];
const m = (button: RadiusKey, input: RadiusKey, card: RadiusKey, dialog: RadiusKey, badge: RadiusKey): Map6 => ({ button, input, card, dialog, badge, avatar: 'full' });
export const SHAPES = [
  { id: 'sharp', label: 'Sharp', base: 0, step: 1.5, map: m('none', 'none', 'none', 'none', 'none') },
  { id: 'subtle', label: 'Subtle', base: 4, step: 1.5, map: m('md', 'md', 'lg', 'xl', 'sm') },
  { id: 'soft', label: 'Soft', base: 8, step: 1.5, map: m('md', 'md', 'lg', 'xl', 'full') },
  { id: 'round', label: 'Round', base: 12, step: 1.5, map: m('lg', 'md', 'xl', '2xl', 'full') },
  { id: 'pill', label: 'Pill', base: 12, step: 1.5, map: m('full', 'full', 'xl', '2xl', 'full') },
];
export const shapeOf = (s: State) => SHAPES.find(x => x.base === s.radius.base && x.map.button === s.radius.map.button && x.map.card === s.radius.map.card)?.id;

export const DENSITIES = [
  { id: 'compact', label: 'Compact', gap: 3 },
  { id: 'comfortable', label: 'Comfy', gap: 6 },
  { id: 'spacious', label: 'Airy', gap: 9 },
] as const;

export const DEPTHS = [
  { id: 'flat', label: 'Flat', strength: 0.15, softness: 0.8 },
  { id: 'soft', label: 'Soft', strength: 0.5, softness: 1.4 },
  { id: 'lifted', label: 'Lifted', strength: 0.85, softness: 1 },
];
export const depthOf = (s: State) => DEPTHS.find(d => Math.abs(d.strength - s.shadow.strength) < 0.06 && Math.abs(d.softness - s.shadow.softness) < 0.11)?.id;

/** brand candidates from a logo or photo: its most present colours that aren't white, black or grey */
export function coloursFromImage(file: File): Promise<string[]> {
  return new Promise((ok, fail) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const sw = extract(img, 8);
      URL.revokeObjectURL(url);
      const scored = sw.map(s => { const [L, C] = hexToOklch(s.hex); return { hex: s.hex, L, C, score: s.share * (0.25 + C * 7) }; });
      const vivid = scored.filter(s => s.C > 0.035 && s.L > 0.25 && s.L < 0.92).sort((a, b) => b.score - a.score);
      const pick = (vivid.length ? vivid : scored.filter(s => s.L > 0.12 && s.L < 0.9).sort((a, b) => b.score - a.score)).slice(0, 5).map(s => s.hex);
      ok(pick.length ? pick : sw.slice(0, 3).map(s => s.hex));
    };
    img.onerror = () => { URL.revokeObjectURL(url); fail(new Error('That file didn’t open as an image')); };
    img.src = url;
  });
}

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };
export const eyeDropper = (): EyeDropperCtor | null => (typeof window !== 'undefined' && 'EyeDropper' in window ? (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper : null);
