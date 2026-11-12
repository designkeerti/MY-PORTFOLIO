/**
 * The icon set. Each icon is drawn once, on a 24 x 24 grid, and every style is made from
 * that one drawing (see ./render). A shape says what it is, not how it looks:
 *   body    a solid shape: outlined, tinted, filled, shaded, frosted or extruded by the style
 *   cut     a stroke inside a body (a seam, a hole's outline): knocked out of a filled body
 *   hole    a dot inside a body: knocked out of a filled body
 *   line    a stroke on its own (a ray, a handle, steam): always a stroke
 *   dot     a dot on its own: always a dot
 *   accent  a highlight (a badge, a flame): the accent colour where the style has one
 * Shapes sit in parts; a part can move (a = one of the motions in ./motion, about the
 * pivot o) and can hold parts of its own, which move with it.
 */

export type Role = 'body' | 'cut' | 'hole' | 'line' | 'dot' | 'accent';
export type Shape = { d: string; r: Role };
export type Part = {
  s?: Shape[];
  /** motion name, its pivot, delay and length (s); ease overrides the motion's own */
  a?: string; o?: [number, number]; dl?: number; dur?: number; ease?: string;
  /** strokes trace themselves (stroke-dashoffset) instead of moving */
  dash?: boolean;
  kids?: Part[];
  /** draw the kids before this part's own shapes (a flame behind its rocket) */
  under?: boolean;
  /** only there while the icon plays (sparkles) */
  ghost?: boolean;
};
export type IconDef = { id: string; name: string; tags: string[]; palette: number; parts: Part[] };

// ---- drawing helpers ---------------------------------------------------------------------
const n = (v: number) => +v.toFixed(2);
export const circle = (cx: number, cy: number, r: number) =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0z`;
export const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  `M${n(x + r)} ${n(y)}h${n(w - 2 * r)}a${r} ${r} 0 0 1 ${r} ${r}v${n(h - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${r}h${n(-(w - 2 * r))}a${r} ${r} 0 0 1 ${-r} ${-r}v${n(-(h - 2 * r))}a${r} ${r} 0 0 1 ${r} ${-r}z`;
/** a four-point sparkle */
const sparkle = (x: number, y: number, r: number) =>
  `M${n(x)} ${n(y - r)}Q${n(x + r * 0.16)} ${n(y - r * 0.16)} ${n(x + r)} ${n(y)}Q${n(x + r * 0.16)} ${n(y + r * 0.16)} ${n(x)} ${n(y + r)}Q${n(x - r * 0.16)} ${n(y + r * 0.16)} ${n(x - r)} ${n(y)}Q${n(x - r * 0.16)} ${n(y - r * 0.16)} ${n(x)} ${n(y - r)}z`;
/** a gear: teeth flat on top, valleys between */
function gear(cx: number, cy: number, teeth: number, ro: number, ri: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  const at = (r: number, a: number) => `${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}`;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    pts.push(at(ri, a - step * 0.3), at(ro, a - step * 0.15), at(ro, a + step * 0.15), at(ri, a + step * 0.3));
  }
  return `M${pts.join('L')}z`;
}
/** a five-point star */
function star(cx: number, cy: number, ro: number, ri: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? ri : ro, a = (i * Math.PI) / 5 - Math.PI / 2;
    pts.push(`${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}`);
  }
  return `M${pts.join('L')}z`;
}
const rays = (cx: number, cy: number, count: number, r1: number, r2: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => {
    const a = offset + (i * Math.PI * 2) / count;
    return `M${n(cx + r1 * Math.cos(a))} ${n(cy + r1 * Math.sin(a))}L${n(cx + r2 * Math.cos(a))} ${n(cy + r2 * Math.sin(a))}`;
  }).join('');
const smallHeart = (x: number, y: number, k = 1) =>
  `M${x} ${n(y + 2.2 * k)}s${n(-2.4 * k)}-${n(1.5 * k)}-${n(2.4 * k)}-${n(3.3 * k)}a${n(1.3 * k)} ${n(1.3 * k)} 0 0 1 ${n(2.4 * k)}-${n(0.7 * k)}a${n(1.3 * k)} ${n(1.3 * k)} 0 0 1 ${n(2.4 * k)} ${n(0.7 * k)}c0 ${n(1.8 * k)}-${n(2.4 * k)} ${n(3.3 * k)}-${n(2.4 * k)} ${n(3.3 * k)}z`;

const b = (d: string): Shape => ({ d, r: 'body' });
const c = (d: string): Shape => ({ d, r: 'cut' });
const h = (d: string): Shape => ({ d, r: 'hole' });
const l = (d: string): Shape => ({ d, r: 'line' });
const o = (d: string): Shape => ({ d, r: 'dot' });
const a = (d: string): Shape => ({ d, r: 'accent' });

export const PALETTES = [
  { name: 'Sky', light: '#9ad7ff', base: '#3b8fe0', dark: '#1f5fae', accent: '#ffc24b' },
  { name: 'Coral', light: '#ffb39a', base: '#f2604f', dark: '#c03a38', accent: '#ffd36a' },
  { name: 'Mint', light: '#93ecc9', base: '#22b386', dark: '#127a5d', accent: '#ffd36a' },
  { name: 'Grape', light: '#c9b6ff', base: '#7b5cf0', dark: '#4f37b8', accent: '#ff9ad5' },
  { name: 'Sun', light: '#ffe08a', base: '#f5a524', dark: '#c46f0c', accent: '#f2604f' },
  { name: 'Rose', light: '#ffb0d0', base: '#e2558f', dark: '#ac2f66', accent: '#ffd36a' },
  { name: 'Teal', light: '#8fe3ea', base: '#1fa6b8', dark: '#127483', accent: '#ffc24b' },
  { name: 'Slate', light: '#cfd6e2', base: '#5d6b82', dark: '#3a4558', accent: '#8fd3ff' },
];

export const ICONS: IconDef[] = [
  {
    id: 'home', name: 'Home', tags: ['house', 'start', 'main'], palette: 0,
    parts: [
      { s: [l('M15.6 8.6V5.6h2.4v4.6')] },
      { a: 'm-smoke', o: [16.8, 3.6], dur: 2.2, s: [l('M16.3 3.3c-.7-.6-.1-1.4.6-1.5')] },
      { s: [b('M4 10.6 12 4.2l8 6.4v8.6a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19.2z')] },
      { a: 'm-door', o: [10.2, 17.5], dur: 2.4, s: [c('M10.2 20.8v-5a1.2 1.2 0 0 1 1.2-1.2h1.2a1.2 1.2 0 0 1 1.2 1.2v5')] },
    ],
  },
  {
    id: 'search', name: 'Search', tags: ['find', 'magnifier', 'look'], palette: 6,
    parts: [{ a: 'm-scan', o: [12, 12], dur: 2.2, s: [b(circle(10.5, 10.5, 6.3)), l('M15.2 15.2 20.5 20.5'), c('M7.4 9.6a3.3 3.3 0 0 1 2.4-2.3')] }],
  },
  {
    id: 'bell', name: 'Bell', tags: ['notification', 'alert', 'ring'], palette: 4,
    parts: [
      {
        a: 'm-swing', o: [12, 3.2], dur: 2, s: [l('M12 2.4v1.6'), b('M6.2 16.6v-5.1a5.8 5.8 0 0 1 11.6 0v5.1l1.6 1.9H4.6z')],
        kids: [{ a: 'm-swing', o: [12, 3.2], dl: 0.12, dur: 2, s: [b('M10 19.4a2 2 0 0 0 4 0z')] }], under: true,
      },
      { a: 'm-pop', o: [17.6, 6.2], dur: 2, s: [a(circle(17.6, 6.2, 2.4))] },
    ],
  },
  {
    id: 'heart', name: 'Heart', tags: ['like', 'love', 'favourite'], palette: 5,
    parts: [
      { a: 'm-beat', o: [12, 13.5], dur: 1.4, s: [b('M12 20.2s-7.6-4.7-7.6-10.4A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.6 2.7c0 5.7-7.6 10.4-7.6 10.4z'), c('M7.4 9.6a2.1 2.1 0 0 1 1.9-1.7')] },
      { a: 'm-blink', o: [20.4, 3.8], dl: 0.2, dur: 1.4, ghost: true, s: [a(sparkle(20.4, 3.8, 1.6))] },
      { a: 'm-blink', o: [3.8, 4.4], dl: 0.55, dur: 1.4, ghost: true, s: [a(sparkle(3.8, 4.4, 1.1))] },
    ],
  },
  {
    id: 'mail', name: 'Mail', tags: ['email', 'envelope', 'message', 'letter'], palette: 0,
    parts: [
      { s: [b(rect(3.2, 5.8, 17.6, 12.8, 2.2))] },
      { a: 'm-flap', o: [12, 6.6], dur: 2.4, s: [c('M4.4 7.2 12 12.8l7.6-5.6')] },
      { a: 'm-rise', o: [12, 10], dur: 2.4, s: [a(smallHeart(12, 8.6, 1))] },
    ],
  },
  {
    id: 'settings', name: 'Settings', tags: ['gear', 'cog', 'preferences'], palette: 7,
    parts: [{ a: 'm-spin', o: [12, 12], dur: 5, ease: 'linear', s: [b(gear(12, 12, 8, 9.6, 7.1)), c(circle(12, 12, 3))] }],
  },
  {
    id: 'user', name: 'User', tags: ['person', 'profile', 'account', 'avatar'], palette: 3,
    parts: [
      { a: 'm-nod', o: [12, 11.6], dur: 2.2, s: [b(circle(12, 7.9, 3.9))] },
      { s: [b('M4.6 20.4a7.4 6.6 0 0 1 14.8 0z')] },
    ],
  },
  {
    id: 'camera', name: 'Camera', tags: ['photo', 'picture', 'snap'], palette: 6,
    parts: [
      { s: [b('M3.4 8.6A1.6 1.6 0 0 1 5 7h2.6l1.5-2.1h5.8L16.4 7H19a1.6 1.6 0 0 1 1.6 1.6v9.2A1.6 1.6 0 0 1 19 19.4H5a1.6 1.6 0 0 1-1.6-1.6z')] },
      { a: 'm-shutter', o: [12, 12.9], dur: 2, s: [c(circle(12, 12.9, 3.6))] },
      { a: 'm-flash', o: [17.3, 9.7], dur: 2, s: [a(circle(17.3, 9.7, 1))] },
    ],
  },
  {
    id: 'lock', name: 'Lock', tags: ['secure', 'private', 'password', 'unlock'], palette: 4,
    parts: [
      { a: 'm-unlock', o: [8.2, 11], dur: 2.4, s: [l('M8.2 11V8.2a3.8 3.8 0 0 1 7.6 0V11')] },
      { s: [b(rect(5.4, 10.6, 13.2, 10, 2.2)), h(circle(12, 14.6, 1.3)), c('M12 15.6v2.1')] },
    ],
  },
  {
    id: 'rain', name: 'Rain', tags: ['weather', 'cloud', 'drops'], palette: 0,
    parts: [
      { a: 'm-drift', o: [12, 10], dur: 3, s: [b('M7.2 15A4.2 4.2 0 0 1 6.6 6.7 5.6 5.6 0 0 1 17.3 5.9 4.6 4.6 0 0 1 17.6 15z')] },
      { a: 'm-rain', o: [8, 19], dur: 1.1, ease: 'linear', s: [l('M8.7 17.4l-.9 2.3')] },
      { a: 'm-rain', o: [12, 19], dl: 0.36, dur: 1.1, ease: 'linear', s: [l('M12.7 17.4l-.9 2.3')] },
      { a: 'm-rain', o: [16, 19], dl: 0.72, dur: 1.1, ease: 'linear', s: [l('M16.7 17.4l-.9 2.3')] },
    ],
  },
  {
    id: 'calendar', name: 'Calendar', tags: ['date', 'schedule', 'event', 'day'], palette: 1,
    parts: [
      {
        s: [b(rect(3.8, 5, 16.4, 15.6, 2.6)), c('M3.8 9.6h16.4'),
          ...[[8, 13.2], [12, 13.2], [16, 13.2], [8, 17.2], [12, 17.2], [16, 17.2]].map(([x, y]) => h(circle(x, y, 0.95)))],
      },
      { s: [l('M8.2 3.4v3.2'), l('M15.8 3.4v3.2')] },
      { a: 'm-hop', o: [16, 17.2], dur: 3.2, s: [a(rect(14.3, 15.5, 3.4, 3.4, 0.9))] },
    ],
  },
  {
    id: 'chat', name: 'Chat', tags: ['message', 'comment', 'typing', 'talk'], palette: 3,
    parts: [{
      a: 'm-bob', o: [12, 12], dur: 2.4,
      s: [b('M5.2 5h13.6A2.2 2.2 0 0 1 21 7.2v8.2a2.2 2.2 0 0 1-2.2 2.2h-6.6L7.6 21v-3.4H5.2A2.2 2.2 0 0 1 3 15.4V7.2A2.2 2.2 0 0 1 5.2 5z')],
      kids: [
        { a: 'm-type', o: [8.4, 11.3], dur: 1.2, s: [h(circle(8.4, 11.3, 1.1))] },
        { a: 'm-type', o: [12, 11.3], dl: 0.16, dur: 1.2, s: [h(circle(12, 11.3, 1.1))] },
        { a: 'm-type', o: [15.6, 11.3], dl: 0.32, dur: 1.2, s: [h(circle(15.6, 11.3, 1.1))] },
      ],
    }],
  },
  {
    id: 'music', name: 'Music', tags: ['note', 'audio', 'song', 'sound'], palette: 5,
    parts: [
      { a: 'm-rock', o: [13, 14], dur: 1.6, s: [l('M9.4 17.6V6.4l10-2.2v11.4'), l('M9.4 9.8l10-2.2'), b(circle(6.9, 17.6, 2.5)), b(circle(16.9, 15.6, 2.5))] },
      { a: 'm-rise', o: [4.6, 8], dl: 0.6, dur: 2.4, ghost: true, s: [a(sparkle(4.4, 9, 1.3))] },
    ],
  },
  {
    id: 'rocket', name: 'Rocket', tags: ['launch', 'ship', 'start', 'boost'], palette: 1,
    parts: [{
      a: 'm-launch', o: [12, 12], dur: 2.2,
      s: [l('M7.7 11.6 5.2 14.6l.4 2.3 2.9-1.3'), l('M16.3 11.6l2.5 3-.4 2.3-2.9-1.3'),
        b('M12 2.8c3.3 2.3 4.9 5.8 4.6 10.4l-2 2.4H9.4l-2-2.4C7.1 8.6 8.7 5.1 12 2.8z'), c(circle(12, 9.4, 1.9))],
      kids: [{ a: 'm-flicker', o: [12, 16.2], dur: 0.45, s: [a('M10.3 16.2c0 2 1.7 4.2 1.7 4.2s1.7-2.2 1.7-4.2z')] }], under: true,
    }],
  },
  {
    id: 'idea', name: 'Idea', tags: ['bulb', 'light', 'tip', 'think'], palette: 4,
    parts: [
      { a: 'm-rays', o: [12, 10], dur: 1.8, s: [l('M12 1.6v1.3M4.2 4.3l.9.9M19.8 4.3l-.9.9M2 10.3h1.3M20.7 10.3H22')] },
      { s: [b('M9 15.6c-1.6-1.3-2.7-3.2-2.7-5.3a5.7 5.7 0 0 1 11.4 0c0 2.1-1.1 4-2.7 5.3v1.6H9z'), c('M10.2 12.2 12 13.9l1.8-1.7'), l('M9.6 19.4h4.8'), l('M10.6 21.4h2.8')] },
    ],
  },
  {
    id: 'star', name: 'Star', tags: ['favourite', 'rating', 'bookmark'], palette: 4,
    parts: [
      { a: 'm-twinkle', o: [12, 12.6], dur: 2.2, s: [b(star(12, 12.8, 9.2, 4.4))] },
      { a: 'm-blink', o: [20.2, 4.2], dl: 0.3, dur: 2.2, ghost: true, s: [a(sparkle(20.2, 4.2, 1.6))] },
      { a: 'm-blink', o: [4.2, 19.8], dl: 1.1, dur: 2.2, ghost: true, s: [a(sparkle(4.2, 19.8, 1.2))] },
    ],
  },
  {
    id: 'trash', name: 'Trash', tags: ['delete', 'bin', 'remove'], palette: 7,
    parts: [
      { s: [b('M5.8 6.8l1.1 12.6a1.7 1.7 0 0 0 1.7 1.6h6.8a1.7 1.7 0 0 0 1.7-1.6l1.1-12.6z'), c('M10 10.6v6.4'), c('M14 10.6v6.4')] },
      { a: 'm-lid', o: [3.6, 6.8], dur: 2.2, s: [l('M3.6 6.8h16.8'), l('M9.4 6.8V4.9a1 1 0 0 1 1-1h3.2a1 1 0 0 1 1 1v1.9')] },
    ],
  },
  {
    id: 'download', name: 'Download', tags: ['save', 'arrow', 'import'], palette: 0,
    parts: [
      { a: 'm-tray', o: [12, 20], dur: 1.8, s: [l('M4 15v3.4A1.6 1.6 0 0 0 5.6 20h12.8a1.6 1.6 0 0 0 1.6-1.6V15')] },
      { a: 'm-dl', o: [12, 10], dur: 1.8, s: [l('M12 3.4v11'), l('M7.6 10.2 12 14.6l4.4-4.4')] },
    ],
  },
  {
    id: 'play', name: 'Play', tags: ['video', 'start', 'media'], palette: 3,
    parts: [
      { a: 'm-ripple', o: [12, 12], dur: 1.8, ease: 'cubic-bezier(.2,.6,.4,1)', s: [l(circle(12, 12, 9.2))] },
      { s: [b(circle(12, 12, 9.2))] },
      { a: 'm-beat', o: [12, 12], dur: 1.8, s: [a('M10.1 8.4v7.2l6-3.6z')] },
    ],
  },
  {
    id: 'battery', name: 'Battery', tags: ['charge', 'power', 'energy'], palette: 2,
    parts: [
      { s: [b(rect(2.8, 7.2, 16.2, 9.6, 2.2)), l('M21.2 10.4v3.2')] },
      { a: 'm-charge', o: [6.5, 12], dur: 1.8, s: [a(rect(5, 9.4, 3, 5.2, 0.7))] },
      { a: 'm-charge', o: [10.5, 12], dl: 0.25, dur: 1.8, s: [a(rect(9, 9.4, 3, 5.2, 0.7))] },
      { a: 'm-charge', o: [14.5, 12], dl: 0.5, dur: 1.8, s: [a(rect(13, 9.4, 3, 5.2, 0.7))] },
    ],
  },
  {
    id: 'wifi', name: 'Wi-Fi', tags: ['wireless', 'signal', 'network'], palette: 0,
    parts: [
      { s: [o(circle(12, 18.6, 1.4))] },
      { a: 'm-wave', o: [12, 18], dur: 1.6, s: [l('M8.6 15.1a4.8 4.8 0 0 1 6.8 0')] },
      { a: 'm-wave', o: [12, 18], dl: 0.2, dur: 1.6, s: [l('M5.4 11.9a9.3 9.3 0 0 1 13.2 0')] },
      { a: 'm-wave', o: [12, 18], dl: 0.4, dur: 1.6, s: [l('M2.3 8.7a13.6 13.6 0 0 1 19.4 0')] },
    ],
  },
  {
    id: 'pin', name: 'Location', tags: ['pin', 'map', 'place', 'marker'], palette: 1,
    parts: [
      { a: 'm-shadow', o: [12, 21.4], dur: 1.8, s: [l('M9.2 21.4h5.6')] },
      { a: 'm-bounce', o: [12, 20], dur: 1.8, s: [b('M12 20.2s-6.6-6-6.6-10.8a6.6 6.6 0 0 1 13.2 0c0 4.8-6.6 10.8-6.6 10.8z'), c(circle(12, 9.6, 2.5))] },
    ],
  },
  {
    id: 'coffee', name: 'Coffee', tags: ['cup', 'drink', 'break', 'tea'], palette: 4,
    parts: [
      { a: 'm-steam', o: [8.6, 5], dur: 2, s: [l('M8.6 6.6c-.9-1 .9-1.9 0-3.1')] },
      { a: 'm-steam', o: [11.6, 5], dl: 0.5, dur: 2, s: [l('M11.6 6.6c-.9-1 .9-1.9 0-3.1')] },
      { a: 'm-steam', o: [14.6, 5], dl: 1, dur: 2, s: [l('M14.6 6.6c-.9-1 .9-1.9 0-3.1')] },
      { s: [l('M16.2 11h1.4a2.3 2.3 0 0 1 0 4.6h-1.4'), b('M4.8 9.4h11.4v6.2a4.6 4.6 0 0 1-4.6 4.6H9.4a4.6 4.6 0 0 1-4.6-4.6z'), l('M3.6 21.6h14')] },
    ],
  },
  {
    id: 'gift', name: 'Gift', tags: ['present', 'reward', 'surprise'], palette: 5,
    parts: [
      { s: [b(rect(4.6, 11, 14.8, 9.8, 1.6)), c('M12 11v9.8')] },
      { a: 'm-gift', o: [3.8, 11], dur: 2.2, s: [l('M12 7.6c-1.4-2.6-4.7-2.9-4.3-.9.3 1.2 4.3.9 4.3.9z'), l('M12 7.6c1.4-2.6 4.7-2.9 4.3-.9-.3 1.2-4.3.9-4.3.9z'), b(rect(3.4, 7.6, 17.2, 3.6, 1.1)), c('M12 7.6v3.6')] },
    ],
  },
  {
    id: 'send', name: 'Send', tags: ['paper plane', 'share', 'submit'], palette: 6,
    parts: [{ a: 'm-fly', o: [12, 12], dur: 2.4, s: [b('M3.4 11.3 20.6 3.8l-5.3 16.4-3.9-7.3z'), c('M11.4 12.9l9.2-9.1')] }],
  },
  {
    id: 'chart', name: 'Chart', tags: ['analytics', 'graph', 'stats', 'growth'], palette: 2,
    parts: [
      { s: [l('M3 20.6h18')] },
      { a: 'm-grow', o: [6.4, 19.6], dur: 2.4, s: [b(rect(4.6, 12, 3.6, 7.6, 1))] },
      { a: 'm-grow', o: [12, 19.6], dl: 0.15, dur: 2.4, s: [b(rect(10.2, 8, 3.6, 11.6, 1))] },
      { a: 'm-grow', o: [17.6, 19.6], dl: 0.3, dur: 2.4, s: [b(rect(15.8, 4.6, 3.6, 15, 1))] },
    ],
  },
  {
    id: 'sun', name: 'Sun', tags: ['day', 'light', 'weather', 'bright'], palette: 4,
    parts: [
      { a: 'm-spin', o: [12, 12], dur: 9, ease: 'linear', s: [l(rays(12, 12, 8, 7, 9.2))] },
      { a: 'm-beat', o: [12, 12], dur: 2.4, s: [b(circle(12, 12, 4.4))] },
    ],
  },
  {
    id: 'moon', name: 'Moon', tags: ['night', 'dark mode', 'sleep'], palette: 3,
    parts: [
      { a: 'm-rock', o: [12, 12], dur: 3.2, s: [b('M19.6 14.6A8.2 8.2 0 0 1 9.4 4.4a8.2 8.2 0 1 0 10.2 10.2z')] },
      { a: 'm-blink', o: [17.4, 4.4], dl: 0.2, dur: 2.4, s: [a(sparkle(17.4, 4.4, 1.6))] },
      { a: 'm-blink', o: [21, 9.4], dl: 1, dur: 2.4, s: [a(sparkle(21, 9.4, 1.1))] },
    ],
  },
  {
    id: 'check', name: 'Done', tags: ['check', 'success', 'tick', 'complete'], palette: 2,
    parts: [
      { a: 'm-pop', o: [12, 12], dur: 2.2, s: [b(circle(12, 12, 9.2))] },
      { dash: true, dur: 2.2, s: [c('M7.8 12.4l2.8 2.8 5.6-5.8')] },
    ],
  },
  {
    id: 'mic', name: 'Microphone', tags: ['voice', 'record', 'audio', 'podcast'], palette: 3,
    parts: [
      { a: 'm-wave', o: [3, 10.6], dur: 1.4, s: [l('M3 8.8v3.6')] },
      { a: 'm-wave', o: [21, 10.6], dl: 0.2, dur: 1.4, s: [l('M21 8.8v3.6')] },
      { s: [b(rect(9, 2.8, 6, 11.4, 3)), c('M9.4 7h2'), c('M9.4 9.8h2'), l('M5.6 11.2a6.4 6.4 0 0 0 12.8 0'), l('M12 17.6v3.4'), l('M8.8 21h6.4')] },
    ],
  },
  {
    id: 'bookmark', name: 'Bookmark', tags: ['save', 'later', 'flag'], palette: 1,
    parts: [{ a: 'm-bounce', o: [12, 21], dur: 1.8, s: [b('M6.4 4.6A1.6 1.6 0 0 1 8 3h8a1.6 1.6 0 0 1 1.6 1.6V21L12 17.2 6.4 21z'), c('M10 7.4h4')] }],
  },
  {
    id: 'clock', name: 'Clock', tags: ['time', 'hour', 'schedule', 'wait'], palette: 6,
    parts: [
      { s: [b(circle(12, 12, 9.2))] },
      { a: 'm-spin', o: [12, 12], dur: 3, ease: 'linear', s: [c('M12 12V6.4')] },
      { a: 'm-spin', o: [12, 12], dur: 36, ease: 'linear', s: [c('M12 12l3.6 2.1')] },
      { s: [h(circle(12, 12, 1.2))] },
    ],
  },
  {
    id: 'eye', name: 'View', tags: ['eye', 'see', 'visible', 'preview'], palette: 3,
    parts: [{
      a: 'm-blinkeye', o: [12, 12], dur: 3.2, s: [b('M2.6 12S6 5.6 12 5.6 21.4 12 21.4 12 18 18.4 12 18.4 2.6 12 2.6 12z')],
      kids: [{ a: 'm-look', o: [12, 12], dur: 3.2, s: [c(circle(12, 12, 3.4)), h(circle(12, 12, 1.4))] }],
    }],
  },
  {
    id: 'cart', name: 'Cart', tags: ['shop', 'buy', 'basket', 'checkout'], palette: 1,
    parts: [
      { a: 'm-dropin', o: [13, 5], dur: 2.2, s: [a(rect(11.4, 2.4, 3.6, 3.6, 0.8))] },
      { a: 'm-nudge', o: [12, 12], dur: 2.2, s: [l('M3 4.4h2.2l1.4 2.6'), b('M6.6 7h13.6l-1.5 7.1a1.6 1.6 0 0 1-1.6 1.3H8.7a1.6 1.6 0 0 1-1.6-1.3z'), o(circle(9.4, 19.2, 1.5)), o(circle(16.6, 19.2, 1.5))] },
    ],
  },
  {
    id: 'bolt', name: 'Energy', tags: ['bolt', 'lightning', 'fast', 'power', 'flash'], palette: 4,
    parts: [
      { a: 'm-zap', o: [12, 12], dur: 1.8, s: [b('M13.6 2.6 5.4 13.4h6.2l-1.4 8 8.4-11.2h-6.2z')] },
      { a: 'm-blink', o: [19.8, 4.6], dl: 0.1, dur: 1.8, ghost: true, s: [l('M19.2 5.2l1.4-1.4M20.4 7.6h1.6')] },
      { a: 'm-blink', o: [4.2, 19], dl: 0.25, dur: 1.8, ghost: true, s: [l('M4.8 18.4l-1.4 1.4M3.6 16h-1.6')] },
    ],
  },
  {
    id: 'folder', name: 'Folder', tags: ['files', 'directory', 'documents'], palette: 0,
    parts: [
      { s: [b('M3.4 6.6A1.6 1.6 0 0 1 5 5h4.2l2 2.2H19a1.6 1.6 0 0 1 1.6 1.6v9.6A1.6 1.6 0 0 1 19 20H5a1.6 1.6 0 0 1-1.6-1.6z')] },
      { a: 'm-peek', o: [12, 12], dur: 2.4, s: [a(rect(6.8, 8.2, 10.4, 6, 1))] },
      { a: 'm-folder', o: [12, 20], dur: 2.4, s: [b('M3.4 11.2h17.2v7.2A1.6 1.6 0 0 1 19 20H5a1.6 1.6 0 0 1-1.6-1.6z'), c('M3.4 11.2h17.2')] },
    ],
  },
];
