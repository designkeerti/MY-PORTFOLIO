/**
 * Colour maths for the playground: hex <-> sRGB, OKLCH (Björn Ottosson's OKLab, so steps look
 * even to the eye), gamut mapping by chroma, and WCAG 2 contrast.
 */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const isHex = (s: string) => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim());
export const normHex = (s: string) => {
  let h = s.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return '#' + h.toLowerCase();
};
export const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(normHex(hex).slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');

const toLin = (c: number) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const fromLin = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

/** linear sRGB (0..1) to OKLab */
export function linToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
export function oklabToLin(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
export const rgbToOklab = (r: number, g: number, b: number) => linToOklab(toLin(r), toLin(g), toLin(b));
export const oklabToHex = (L: number, a: number, b: number) => { const [r, g, bl] = oklabToLin(L, a, b); return rgbToHex(fromLin(clamp(r)), fromLin(clamp(g)), fromLin(clamp(bl))); };

/** hex to OKLCH: lightness 0..1, chroma, hue in degrees */
export function hexToOklch(hex: string): [number, number, number] {
  const [L, a, b] = rgbToOklab(...hexToRgb(hex));
  let H = Math.atan2(b, a) * 180 / Math.PI; if (H < 0) H += 360;
  return [L, Math.hypot(a, b), H];
}
const inGamut = (rgb: number[]) => rgb.every(v => v >= -0.0005 && v <= 1.0005);
/** OKLCH to hex, giving up chroma (never lightness or hue) until it fits in sRGB */
export function oklchToHex(L: number, C: number, H: number): string {
  const rad = H * Math.PI / 180;
  const at = (c: number) => oklabToLin(L, c * Math.cos(rad), c * Math.sin(rad));
  let rgb = at(C);
  if (!inGamut(rgb)) {
    let lo = 0, hi = C;
    for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (inGamut(at(mid))) lo = mid; else hi = mid; }
    rgb = at(lo);
  }
  return rgbToHex(fromLin(clamp(rgb[0])), fromLin(clamp(rgb[1])), fromLin(clamp(rgb[2])));
}

/* WCAG 2 */
export const luminance = (hex: string) => { const [r, g, b] = hexToRgb(hex).map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrastRatio = (a: string, b: string) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export const readableOn = (bg: string) => (contrastRatio(bg, '#ffffff') >= contrastRatio(bg, '#17191e') ? '#ffffff' : '#17191e');

/**
 * The text colour closest to `fg` (same hue and chroma, only lighter or darker) that reaches
 * `target` contrast on `bg`; null if no lightness gets there.
 */
export function nearestPassing(fg: string, bg: string, target: number): string | null {
  if (contrastRatio(fg, bg) >= target) return fg;
  const [L, C, H] = hexToOklch(fg);
  const tryDir = (darker: boolean) => {
    const end = oklchToHex(darker ? 0 : 1, C, H);
    if (contrastRatio(end, bg) < target) return null;
    let lo = darker ? 0 : L, hi = darker ? L : 1;
    for (let i = 0; i < 28; i++) {
      const mid = (lo + hi) / 2, ok = contrastRatio(oklchToHex(mid, C, H), bg) >= target;
      if (darker) { if (ok) lo = mid; else hi = mid; } else { if (ok) hi = mid; else lo = mid; }
    }
    return oklchToHex(darker ? lo : hi, C, H);
  };
  const preferDark = luminance(bg) > 0.18;
  return tryDir(preferDark) ?? tryDir(!preferDark);
}
