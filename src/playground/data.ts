/**
 * Everything the playground shows. Picks (font pairings and colour combinations) are plain
 * data: edit them here and the Picks page and the home tiles follow.
 */

export type ToolSlug = 'contrast' | 'scales' | 'image-palette' | 'type' | 'type-scale' | 'shader' | 'easing' | 'shadows' | 'grain' | 'picks';
/** tile: a shorter name for the small home tiles, where the full title would be cut off */
export type Tool = { slug: ToolSlug; group: 'Colour' | 'Type' | 'Motion & surface' | 'Picks'; title: string; tile?: string; short: string; blurb: string };

export const TOOLS: Tool[] = [
  { slug: 'contrast', group: 'Colour', title: 'Contrast Checker', short: 'WCAG contrast, with the nearest colours that pass.', blurb: 'Check a text colour on a background against WCAG, for body text, large text and UI. If it fails, get the nearest colour that passes, same hue, only lighter or darker.' },
  { slug: 'scales', group: 'Colour', title: 'Colour Scales', short: 'One colour into an 11-step scale, plus harmonies.', blurb: 'Turn one colour into a full 50 to 950 scale, evenly spaced to the eye, with its harmonies. Copy it as CSS variables, a Tailwind palette or JSON.' },
  { slug: 'image-palette', group: 'Colour', title: 'Image Palette', short: 'Pull the colours out of any picture.', blurb: 'Drop in a photo and get its palette, weighted by how much of the picture each colour covers. It all happens in your browser; nothing is uploaded.' },
  { slug: 'type', group: 'Type', title: 'Type Pairing Checker', tile: 'Type Pairing', short: 'Test two fonts together, with a verdict.', blurb: 'Pick a heading font and a body font and see them working together, as a hero, an article and an interface. It checks the pairing and gives you the CSS.' },
  { slug: 'type-scale', group: 'Type', title: 'Fluid Type Scale', short: 'A type scale that grows with the screen.', blurb: 'Set a base size and ratio for a small screen and a large one, and get a modular scale that grows smoothly between them, as CSS clamp() values.' },
  { slug: 'shader', group: 'Motion & surface', title: 'Shader Studio', short: 'Animated gradients you can copy into any site.', blurb: 'A live, animated gradient shader. Pick a preset or your own colours, shape it with the sliders, then copy the code or download a still.' },
  { slug: 'easing', group: 'Motion & surface', title: 'Easing Editor', short: 'Draw a cubic-bezier, watch it move, copy it.', blurb: 'Drag the handles to shape an easing curve, watch it run against linear, and copy it for CSS or JavaScript. Overshoot allowed.' },
  { slug: 'shadows', group: 'Motion & surface', title: 'Smooth Shadows', short: 'Layered, natural shadows as one line of CSS.', blurb: 'Several shadows that grow and fade the way light does, instead of one flat blur. Tune the depth and the light, then copy the box-shadow.' },
  { slug: 'grain', group: 'Motion & surface', title: 'Grain', short: 'A seamless noise texture for a printed feel.', blurb: 'Make a seamless grain tile to lay over gradients and photos. Preview it, download the PNG, and copy the CSS to use it.' },
  { slug: 'picks', group: 'Picks', title: 'Picks', short: 'Font pairings and colours I keep coming back to.', blurb: 'Font pairings and colour combinations from my work and my notebook. Tap a colour to copy it; open any pairing in the checker.' },
];
export const GROUPS: Tool['group'][] = ['Colour', 'Type', 'Motion & surface', 'Picks'];

/* ---------- fonts ---------- */

export type FontCat = 'sans' | 'serif' | 'display' | 'mono' | 'slab';
/** w: weights to request from Google Fonts (null: the family has a single weight) */
export type Font = { name: string; cat: FontCat; w: string | null; src?: 'local' | 'fontshare' };

export const FONTS: Font[] = [
  { name: 'Chillax', cat: 'display', w: '400;500;600;700', src: 'fontshare' },
  { name: 'Sofia Sans', cat: 'sans', w: '400;500;600;700' },
  { name: 'Inter', cat: 'sans', w: '400;500;600;700' },
  { name: 'Manrope', cat: 'sans', w: '400;500;600;700' },
  { name: 'DM Sans', cat: 'sans', w: '400;500;700' },
  { name: 'Plus Jakarta Sans', cat: 'sans', w: '400;500;600;700' },
  { name: 'Work Sans', cat: 'sans', w: '400;500;600;700' },
  { name: 'IBM Plex Sans', cat: 'sans', w: '400;500;600;700' },
  { name: 'Outfit', cat: 'sans', w: '400;500;600;700' },
  { name: 'Sora', cat: 'sans', w: '400;500;600;700' },
  { name: 'Space Grotesk', cat: 'sans', w: '400;500;600;700' },
  { name: 'Archivo', cat: 'sans', w: '400;500;600;700' },
  { name: 'Karla', cat: 'sans', w: '400;500;600;700' },
  { name: 'Rubik', cat: 'sans', w: '400;500;600;700' },
  { name: 'Syne', cat: 'display', w: '400;500;600;700' },
  { name: 'Bricolage Grotesque', cat: 'display', w: '400;500;600;700' },
  { name: 'Unbounded', cat: 'display', w: '400;500;600;700' },
  { name: 'Anton', cat: 'display', w: null },
  { name: 'Bebas Neue', cat: 'display', w: null },
  { name: 'Fraunces', cat: 'serif', w: '400;500;600;700' },
  { name: 'Playfair Display', cat: 'serif', w: '400;500;600;700' },
  { name: 'Instrument Serif', cat: 'serif', w: null },
  { name: 'DM Serif Display', cat: 'serif', w: null },
  { name: 'Lora', cat: 'serif', w: '400;500;600;700' },
  { name: 'Source Serif 4', cat: 'serif', w: '400;500;600;700' },
  { name: 'Libre Baskerville', cat: 'serif', w: '400;700' },
  { name: 'Cormorant Garamond', cat: 'serif', w: '400;500;600;700' },
  { name: 'IBM Plex Serif', cat: 'serif', w: '400;500;600;700' },
  { name: 'Roboto Slab', cat: 'slab', w: '400;500;600;700' },
  { name: 'Zilla Slab', cat: 'slab', w: '400;500;600;700' },
  { name: 'JetBrains Mono', cat: 'mono', w: '400;500;600;700' },
  { name: 'Space Mono', cat: 'mono', w: '400;700' },
];

export const fontByName = (name: string | null | undefined) => FONTS.find(f => f.name.toLowerCase() === (name ?? '').toLowerCase());

export const fallbackFor = (cat: FontCat) => (cat === 'serif' || cat === 'slab' ? 'serif' : cat === 'mono' ? 'monospace' : 'sans-serif');

/** the stylesheet URL a font comes from (none for fonts this site already ships) */
export const fontHref = (f: Font) => {
  if (f.src === 'local') return null;
  if (f.src === 'fontshare') return 'https://api.fontshare.com/v2/css?f[]=' + f.name.toLowerCase() + '@400,500,600,700&display=swap';
  return 'https://fonts.googleapis.com/css2?family=' + f.name.replace(/ /g, '+') + (f.w ? ':wght@' + f.w : '') + '&display=swap';
};

const loaded = new Map<string, Promise<void>>();
/** load a font (once) and resolve when it can be drawn */
export function loadFont(f: Font): Promise<void> {
  if (!loaded.has(f.name)) {
    const href = fontHref(f);
    // Chillax and Sofia Sans are already on this site
    if (href && !['Chillax', 'Sofia Sans'].includes(f.name)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = href;
      document.head.appendChild(link);
    }
    const weights = f.w ? f.w.split(';') : ['400'];
    loaded.set(f.name, Promise.all(weights.map(w => document.fonts.load(`${w} 40px "${f.name}"`).catch(() => []))).then(() => undefined));
  }
  return loaded.get(f.name)!;
}

/* ---------- picks ---------- */

export type Pairing = { heading: string; body: string; from: string; note: string; weight?: number };
export const PAIRINGS: Pairing[] = [
  { heading: 'Chillax', body: 'Sofia Sans', from: 'This portfolio', note: 'A soft geometric display over a warm, slightly wide sans. Friendly at poster size, calm in paragraphs.', weight: 600 },
  { heading: 'Anton', body: 'Inter', from: 'Cross Border Supps', note: 'Condensed and loud for anything that shouts, neutral for anything you read. JetBrains Mono for the stamps.' },
  { heading: 'Fraunces', body: 'Inter', from: 'Notebook', note: 'An old-style serif with real character, made modern by a plain grotesque underneath.', weight: 600 },
  { heading: 'Syne', body: 'Manrope', from: 'Notebook', note: 'Wide, quirky headings with a rounded, very readable body. Good for creative studios.', weight: 700 },
  { heading: 'Instrument Serif', body: 'Inter', from: 'Notebook', note: 'Editorial and light. Let the serif run big and keep everything else quiet.' },
  { heading: 'Space Grotesk', body: 'IBM Plex Serif', from: 'Notebook', note: 'A techy grotesque on top, a sturdy serif for reading. The inversion of the usual pairing.', weight: 600 },
  { heading: 'Bricolage Grotesque', body: 'Source Serif 4', from: 'Notebook', note: 'Expressive, a little hand-made, with a classic text serif to steady it.', weight: 700 },
  { heading: 'Unbounded', body: 'Work Sans', from: 'Notebook', note: 'Round and bold for short headlines, a clean workhorse for the rest.', weight: 600 },
];

export type Swatch = { hex: string; name: string };
/** fg/bg: the text-on-background pair the sample checks for contrast */
export type Palette = { name: string; from: string; swatches: Swatch[]; bg: string; fg: string; accent: string; accentInk: string };
export const PALETTES: Palette[] = [
  { name: 'Sky', from: 'This portfolio', bg: '#f7f6f2', fg: '#17191e', accent: '#2c8bc6', accentInk: '#ffffff',
    swatches: [{ hex: '#2c8bc6', name: 'Sky' }, { hex: '#b5dbed', name: 'Horizon' }, { hex: '#f7f6f2', name: 'Paper' }, { hex: '#17191e', name: 'Ink' }] },
  { name: 'Burn', from: 'This portfolio', bg: '#0d0c0b', fg: '#f1ece4', accent: '#ff8a3d', accentInk: '#17191e',
    swatches: [{ hex: '#0d0c0b', name: 'Char' }, { hex: '#ff8a3d', name: 'Ember' }, { hex: '#ffd27a', name: 'Glow' }, { hex: '#f1ece4', name: 'Ash' }] },
  { name: 'Customs', from: 'Cross Border Supps', bg: '#06080b', fg: '#f2f2f2', accent: '#6cbde0', accentInk: '#06080b',
    swatches: [{ hex: '#000000', name: 'Ground' }, { hex: '#06080b', name: 'Panel' }, { hex: '#6cbde0', name: 'Cyan' }, { hex: '#f2f2f2', name: 'Paper' }] },
  { name: 'Energy and trust', from: 'ekai', bg: '#fbf3ea', fg: '#27403f', accent: '#ff6a2a', accentInk: '#ffffff',
    swatches: [{ hex: '#ff6a2a', name: 'Orange' }, { hex: '#27403f', name: 'Teal' }, { hex: '#fbf3ea', name: 'Cream' }, { hex: '#1b1b1b', name: 'Ink' }] },
  { name: 'Misfits', from: 'Misfits', bg: '#0e0a1c', fg: '#f4f2f8', accent: '#8b5cf6', accentInk: '#ffffff',
    swatches: [{ hex: '#0e0a1c', name: 'Night' }, { hex: '#8b5cf6', name: 'Violet' }, { hex: '#c4b5fd', name: 'Lilac' }, { hex: '#f4f2f8', name: 'Mist' }] },
  { name: 'Gold standard', from: 'Infinity Lifespaces', bg: '#0e1418', fg: '#f6f3ee', accent: '#c9a96e', accentInk: '#0e1418',
    swatches: [{ hex: '#0e1418', name: 'Slate' }, { hex: '#c9a96e', name: 'Gold' }, { hex: '#f6f3ee', name: 'Linen' }, { hex: '#5d6b73', name: 'Stone' }] },
  { name: 'Interchange', from: 'Delhi Metro', bg: '#0a1424', fg: '#ffffff', accent: '#fdd835', accentInk: '#0a1424',
    swatches: [{ hex: '#0a1424', name: 'Navy' }, { hex: '#e53935', name: 'Red line' }, { hex: '#fdd835', name: 'Yellow line' }, { hex: '#1e88e5', name: 'Blue line' }] },
];

/* ---------- colour maths ---------- */

const lin = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
/** WCAG contrast ratio between two hex colours */
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
export const grade = (r: number) => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large' : 'Fails');
