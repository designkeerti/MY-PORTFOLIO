/**
 * Motion for 1,500 icons. Each icon gets one motion that suits what it is, picked from its
 * name (a bell rings, an arrow darts its way, a gear clicks round, a plant sways), falling back
 * on its category. Motions are simulated, not hand-keyed: a kick that swings out and dies away,
 * or a move that overshoots a touch and settles, sampled into plain CSS keyframes in the icons'
 * 256-unit grid, so an exported SVG carries them.
 *
 * Markup the CSS expects (render.ts writes it):
 *   .pt        one piece of the drawing (style --k: its rank); comes in when the icon appears
 *   [data-a]   the moving glyph inside a piece (--a: motion, --dur, --dl: follow-through delay)
 * An icon plays while it or an ancestor has .ic-play (.ic-once: one time through). Its entrance
 * runs when it appears, after --in; .ic-settled skips it (a colour change, not a new icon).
 * The root class is icx (the about section's own icons use .ic).
 */

export type Motion = { a: string; o?: [number, number]; dur: number };

type Ch = { x?: number; y?: number; r?: number; s?: number; sx?: number; sy?: number; k?: number; o?: number; d?: number };
type Def = { T: number; f: (t: number) => Ch; loop?: boolean };

const { exp, sin, cos, atan, sqrt, abs, PI } = Math;
const TAU = PI * 2;
/** a kick from rest: swings out to about `a` (its first peak), then rings down */
const kick = (t: number, a: number, f: number, z = 0.3, d = 0) => {
  t -= d; if (t <= 0) return 0;
  const w = TAU * f, p = atan(1 / z);
  return a * exp(-z * w * t) * sin(w * t) / (exp(-z * p) * sin(p));
};
/** a move to `to` that overshoots a little and settles (a damped spring) */
const go = (t: number, to: number, f: number, z = 0.5, d = 0) => {
  t -= d; if (t <= 0) return 0;
  const w = TAU * f, q = sqrt(1 - z * z);
  return to * (1 - exp(-z * w * t) * (cos(w * q * t) + z / q * sin(w * q * t)));
};
/** bounces off the floor, smaller each time */
const bounce = (t: number, a: number, f: number, z = 0.12) => -abs(kick(t, a, f, z));

const D: Record<string, Def> = {
  'm-ring': { T: 1.5, f: t => ({ r: kick(t, 14, 3.2, 0.14) }) },
  'm-flip': { T: 1.3, f: t => ({ r: go(t, 180, 1.1, 0.55) }) },
  'm-spin': { T: 1.4, loop: true, f: t => ({ r: 360 * t / 1.4 }) },
  'm-spin-slow': { T: 14, loop: true, f: t => ({ r: 360 * t / 14 }) },
  'm-step': { T: 1.1, f: t => ({ r: go(t, 90, 1.4, 0.42) }) },
  'm-spin-half': { T: 1.2, f: t => ({ r: go(t, 180, 1.1, 0.48) }) },
  'm-beat': { T: 1.1, f: t => ({ s: 1 + kick(t, 0.1, 2.8, 0.34) + kick(t, 0.07, 2.8, 0.34, 0.26) }) },
  'm-go-r': { T: 1.1, f: t => ({ x: kick(t, 18, 1.5, 0.4) }) },
  'm-go-l': { T: 1.1, f: t => ({ x: kick(t, -18, 1.5, 0.4) }) },
  'm-go-u': { T: 1.1, f: t => ({ y: kick(t, -18, 1.5, 0.4) }) },
  'm-go-d': { T: 1.1, f: t => ({ y: kick(t, 18, 1.5, 0.4) }) },
  'm-go-ur': { T: 1.1, f: t => ({ x: kick(t, 13, 1.5, 0.4), y: kick(t, -13, 1.5, 0.4) }) },
  'm-go-ul': { T: 1.1, f: t => ({ x: kick(t, -13, 1.5, 0.4), y: kick(t, -13, 1.5, 0.4) }) },
  'm-go-dr': { T: 1.1, f: t => ({ x: kick(t, 13, 1.5, 0.4), y: kick(t, 13, 1.5, 0.4) }) },
  'm-go-dl': { T: 1.1, f: t => ({ x: kick(t, -13, 1.5, 0.4), y: kick(t, 13, 1.5, 0.4) }) },
  'm-jiggle': { T: 1.1, f: t => ({ r: kick(t, 8, 4.4, 0.2) }) },
  'm-fly': { T: 1.4, f: t => ({ x: kick(t, 14, 1.2, 0.38), y: kick(t, -14, 1.2, 0.38), r: kick(t, -6, 1.2, 0.38, 0.04) }) },
  'm-buzz': { T: 0.9, f: t => ({ r: kick(t, 7, 11, 0.1), x: kick(t, 3, 11, 0.1, 0.02) }) },
  'm-bob': { T: 1.2, f: t => ({ y: kick(t, -12, 1.6, 0.32), r: kick(t, -3, 1.6, 0.32, 0.06) }) },
  'm-pulse': { T: 0.9, f: t => ({ s: 1 + kick(t, 0.08, 2.4, 0.3) }) },
  'm-wobble': { T: 1.3, f: t => ({ r: kick(t, -10, 2.4, 0.2) }) },
  'm-twinkle': { T: 1.2, f: t => ({ r: kick(t, 20, 1.8, 0.3), s: 1 + kick(t, 0.1, 1.8, 0.3, 0.02) }) },
  'm-drive': { T: 1.1, f: t => ({ x: kick(t, 12, 1.6, 0.34), r: kick(t, -3, 1.6, 0.34) }) },
  'm-drift': { T: 3.2, loop: true, f: t => ({ x: 6 * sin(TAU * t / 3.2) }) },
  'm-drip': { T: 1.1, f: t => ({ y: kick(t, -9, 1.8, 0.3) }) },
  'm-blink': { T: 0.7, f: t => ({ sy: 1 - 0.86 * (t > 0.08 && t < 0.26 ? sin(PI * (t - 0.08) / 0.18) : 0) }) },
  'm-wave': { T: 1.3, f: t => ({ k: kick(t, -5, 2.2, 0.24) }) },
  'm-scan': { T: 1.6, f: t => ({ x: kick(t, 11, 1.3, 0.16), y: kick(t, -7, 1.3, 0.16, 0.19) }) },
  'm-tick': { T: 1, f: t => ({ r: kick(t, -8, 3.6, 0.24) }) },
  'm-wave-hand': { T: 1.6, f: t => ({ r: kick(t, 16, 2.6, 0.13) }) },
  'm-tilt': { T: 1.2, f: t => ({ r: kick(t, -10, 1.6, 0.4), y: kick(t, -5, 1.6, 0.4) }) },
  'm-flicker': { T: 1.8, loop: true, f: t => ({ sy: 1 + 0.03 * sin(TAU * t / 0.6) + 0.02 * sin(TAU * t / 0.225) }) },
  'm-sway': { T: 3, loop: true, f: t => ({ r: 4 * sin(TAU * t / 3) }) },
  'm-groove': { T: 1.2, f: t => ({ r: kick(t, 6, 2.2, 0.2), s: 1 + kick(t, 0.05, 4.4, 0.25) }) },
  'm-roll': { T: 1.1, f: t => ({ r: go(t, 90, 1.4, 0.42) }) },
  'm-hop': { T: 1.2, f: t => ({ y: bounce(t, 16, 1.5) }) },
  'm-coin': { T: 1.3, f: t => ({ sx: cos(TAU * go(t, 1, 1.1, 0.6)) }) },
  'm-settle': { T: 1.1, f: t => ({ y: kick(t, -9, 1.7, 0.38) }) },
  'm-nod': { T: 1.2, f: t => ({ r: kick(t, -7, 1.6, 0.4) }) },
  'm-pop': { T: 0.9, f: t => ({ s: 1 + kick(t, 0.1, 2.6, 0.34) }) },
  'm-write': { T: 1.3, f: t => ({ x: kick(t, 8, 1.8, 0.3), y: kick(t, -5, 3.6, 0.3), r: kick(t, -5, 1.8, 0.3) }) },
  'm-click': { T: 0.8, f: t => ({ s: 1 + kick(t, -0.12, 2.6, 0.45) }) },
  'm-drop': { T: 1.3, f: t => ({ y: bounce(t, 18, 1.3, 0.16) }) },
  'm-float': { T: 3, loop: true, f: t => ({ y: -5 * sin(TAU * t / 3) }) },
  // entrances
  'ic-in-pop': { T: 0.75, f: t => ({ s: 0.55 + 0.45 * go(t, 1, 1.6, 0.48), o: Math.min(1, t / 0.12) }) },
  'ic-in-rise': { T: 0.85, f: t => ({ y: 26 * (1 - go(t, 1, 1.4, 0.55)), o: Math.min(1, t / 0.15) }) },
  'ic-in-back': { T: 1, f: t => ({ x: -26 * (1 - go(t, 1, 1.2, 0.6, 0.12)), y: 26 * (1 - go(t, 1, 1.2, 0.6, 0.12)), o: Math.min(1, Math.max(0, (t - 0.12) / 0.2)) }) },
  'ic-in-front': { T: 0.85, f: t => ({ s: 0.9 + 0.1 * go(t, 1, 1.5, 0.55), o: Math.min(1, t / 0.18) }) },
  'ic-in-3d': { T: 1.1, f: t => ({ y: -18 * (1 - go(t, 1, 1.5, 0.5)), d: go(t, 1, 1.2, 0.6, 0.12), o: Math.min(1, t / 0.12) }) },
  'ic-in-iso': { T: 1, f: t => ({ y: -7 * (1 - go(t, 1, 1.5, 0.45)), o: Math.min(1, t / 0.15) }) },
  'ic-in-raise': { T: 1, f: t => ({ d: go(t, 1, 1.4, 0.5, 0.2) }) },
};

/** for the loop: a pause after each go */
const REST = 1.1;

const RULES: [RegExp, string, [number, number]?][] = [
  [/bell|siren|alarm/, 'm-ring', [128, 40]],
  [/hourglass/, 'm-flip'],
  [/spinner|circle-notch|fan|hurricane|tornado/, 'm-spin'],
  [/gear|aperture|disc|vinyl|record$|atom|yin-yang|cookie|pinwheel|ferris|life-buoy|steering-wheel|tire|arrows-clockwise|arrows-counter-clockwise|arrow-clockwise|arrow-counter-clockwise/, 'm-step'],
  [/snowflake|sun(?!-horizon)|asterisk/, 'm-spin-slow'],
  [/heart|pulse|heartbeat|first-aid/, 'm-beat'],
  [/arrow.*(up-right|square-up-right|circle-up-right)/, 'm-go-ur'],
  [/arrow.*(up-left)/, 'm-go-ul'],
  [/arrow.*(down-right)/, 'm-go-dr'],
  [/arrow.*(down-left)/, 'm-go-dl'],
  [/(arrow|caret).*right|sign-in|sign-out|share|skip-forward|fast-forward|next/, 'm-go-r'],
  [/(arrow|caret).*left|skip-back|rewind|previous|reply|undo|arrow-u-/, 'm-go-l'],
  [/(arrow|caret).*down|download|tray-arrow-down|import/, 'm-go-d'],
  [/(arrow|caret).*up|upload|export|cloud-arrow-up|rocket/, 'm-go-u'],
  [/arrows|swap|shuffle|repeat|recycle/, 'm-spin-half'],
  [/lock|key|shield|password|fingerprint|vault|safe/, 'm-jiggle', [128, 120]],
  [/paper-plane|airplane|drone|bird|butterfly|feather|kite/, 'm-fly'],
  [/phone|device-mobile|call/, 'm-buzz'],
  [/chat|envelope|mail|megaphone|speech|note|sticker|messenger|whatsapp|telegram/, 'm-bob'],
  [/battery|lightning|plug|cell-signal|wifi|broadcast|radio|rss|bluetooth|antenna|cell-tower|signal/, 'm-pulse'],
  [/trash|eraser|broom|bucket/, 'm-wobble', [128, 224]],
  [/star|sparkle|seal|crown|trophy|medal|confetti|magic-wand|diamond|shooting/, 'm-twinkle'],
  [/car|bus|truck|bicycle|motorcycle|train|boat|sailboat|scooter|taxi|van|jeep|tractor|ambulance|subway|tram|police|garage/, 'm-drive', [128, 220]],
  [/cloud|wind|fog|smoke|rainbow|moon|planet/, 'm-drift'],
  [/drop|rain|water|shower|drip|coffee|tea|wine|beer|martini|bowl|pot|cooking/, 'm-drip'],
  [/eye|binoculars|scan/, 'm-blink'],
  [/flag|banner|pennant|windsock/, 'm-wave', [40, 128]],
  [/magnifying|detective|search/, 'm-scan'],
  [/clock|timer|watch|calendar/, 'm-tick', [128, 40]],
  [/hand-waving|hand-palm/, 'm-wave-hand', [128, 220]],
  [/thumbs|hand|handshake|hands/, 'm-tilt', [128, 200]],
  [/fire|flame|campfire|candle|torch|fireplace/, 'm-flicker', [128, 230]],
  [/leaf|plant|tree|flower|cactus|grains|clover|palm|mushroom|potted|acorn|orange-slice/, 'm-sway', [128, 236]],
  [/music|speaker|headphones|microphone|guitar|piano|metronome|waveform|equalizer|playlist|boombox/, 'm-groove'],
  [/dice|game|puzzle|cards|chess|club|spade|joystick|sword|crosshair|target/, 'm-roll'],
  [/cat|dog|paw|horse|rabbit|bug|bee|cow|duck|fish|shrimp|spider|cherries|egg|frog/, 'm-hop', [128, 236]],
  [/coin|currency|money|cash|wallet|bank|credit-card|receipt|tag|percent|chart|trend|piggy/, 'm-coin'],
  [/house|building|storefront|warehouse|factory|church|castle|tent|igloo|hospital|lighthouse/, 'm-settle', [128, 236]],
  [/user|person|people|smiley|baby|student|chalkboard-teacher|identification|face|skull|ghost|robot|alien/, 'm-nod', [128, 220]],
  [/play|pause|stop|record|video|film|image|camera|monitor-play|youtube/, 'm-pop'],
  [/pencil|pen|paint|brush|eyedropper|highlighter|marker|palette|scribble|signature|crayon/, 'm-write', [60, 200]],
  [/cursor|pointing|mouse|click|hand-tap|selection/, 'm-click'],
  [/bookmark|push-pin|map-pin|pin|anchor|location|navigation|compass/, 'm-drop', [128, 236]],
  [/globe|earth/, 'm-drift'],
  [/package|box|archive|gift|basket|shopping|bag|cube|stack|tote/, 'm-settle', [128, 236]],
];

const BY_CATEGORY: Record<string, [string, [number, number]?]> = {
  arrows: ['m-pop'], brands: ['m-pop'], weather: ['m-drift'], nature: ['m-sway', [128, 236]], people: ['m-nod', [128, 220]],
  media: ['m-pop'], games: ['m-roll'], finances: ['m-coin'], 'maps-travel': ['m-drop', [128, 236]], commerce: ['m-settle', [128, 236]],
  communications: ['m-bob'], 'health-wellness': ['m-beat'],
};

export function motionFor(name: string, cats: string[]): Motion {
  const hit = RULES.find(([re]) => re.test(name));
  const [a, o] = hit ? [hit[1], hit[2]] : BY_CATEGORY[cats[0]] ?? ['m-pop'];
  const def = D[a];
  return { a, o, dur: +(def.loop ? def.T : def.T + REST).toFixed(2) };
}

const n1 = (v: number) => +v.toFixed(1), n3 = (v: number) => +v.toFixed(3);
/** a motion sampled into keyframes: the motion first, then the rest (for a loop) */
function keyframes(name: string): string {
  const def = D[name];
  const total = def.loop || name.startsWith('ic-') ? def.T : def.T + REST;
  const n = Math.max(12, Math.min(48, Math.ceil(def.T * (def.loop && def.T > 4 ? 2 : 30))));
  const samples = Array.from({ length: n + 1 }, (_, i) => def.f(def.T * i / n));
  const has = (k: keyof Ch) => samples.some(c => c[k] !== undefined);
  const body = (c: Ch) => {
    const tf: string[] = [];
    if (has('x') || has('y')) tf.push(`translate(${n1(c.x ?? 0)}px,${n1(c.y ?? 0)}px)`);
    if (has('r')) tf.push(`rotate(${n1(c.r ?? 0)}deg)`);
    if (has('s')) tf.push(`scale(${n3(c.s ?? 1)})`);
    if (has('sx') || has('sy')) tf.push(`scale(${n3(c.sx ?? 1)},${n3(c.sy ?? 1)})`);
    if (has('k')) tf.push(`skewY(${n1(c.k ?? 0)}deg)`);
    return (tf.length ? `transform:${tf.join(' ')};` : '') + (has('o') ? `opacity:${n3(c.o ?? 1)};` : '') + (has('d') ? `--d:${n3(c.d ?? 1)};` : '');
  };
  const P = (def.T / total) * 100;
  const out = samples.map((c, i) => `${+(P * i / n).toFixed(2)}%{${body(c)}}`);
  if (P < 100) out.push(`100%{${body(samples[n])}}`);
  return out.join('');
}

const STATIC: Record<string, string> = {
  'ic-draw': 'from{stroke-dashoffset:1}to{stroke-dashoffset:0}',
  'ic-show': 'from{opacity:0}to{opacity:1}',
  'ic-tint': '0%,100%{fill-opacity:.2}50%{fill-opacity:.34}',
  'ic-sheen': '0%{transform:translateX(-300px) skewX(-20deg)}55%,100%{transform:translateX(300px) skewX(-20deg)}',
  'ic-drift': '0%,100%{transform:translate(0,0)}50%{transform:translate(-10px,10px)}',
  'ic-float': '0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}',
  'ic-shadow': '0%,100%{transform:scale(1);opacity:.3}50%{transform:scale(.86);opacity:.2}',
  'ic-turn3d': '0%,100%{--t:62deg}50%{--t:118deg}',
};

const IN = 'calc(var(--in,0ms) + var(--k,0) * 70ms)';
const BASE = `
@property --t{syntax:'<angle>';inherits:true;initial-value:70deg}
@property --d{syntax:'<number>';inherits:true;initial-value:1}
.icx [data-a],.icx .pt,.icx .ic-root,.icx .sheen,.icx .gl-back,.icx .gl-in,.icx .iso-in,.icx .iso-float,.icx .iso-shadow,.icx .layer{transform-box:view-box}
.ic-play [data-a]{animation:var(--a) var(--dur,2.4s) linear var(--dl,0s) infinite both}
.ic-once [data-a]{animation-iteration-count:1}
.icx .pt,.icx .gl-in,.icx .iso-in{transform-origin:128px 128px}
.icx .draw{stroke-dasharray:1 1;stroke-dashoffset:0}
.s-regular .draw,.s-duotone .draw{animation:ic-draw 1s cubic-bezier(.55,0,.25,1) ${IN} both}
.s-regular .draw-all,.s-duotone .draw-all{animation:ic-show .01s linear calc(var(--in,0ms) + 1.5s) both}
.s-duotone .tint-in{animation:ic-show .6s ease calc(var(--in,0ms) + .5s) both}
.s-filled .pt{animation:ic-in-pop .75s linear ${IN} both}
.s-graphical .pt{animation:ic-in-rise .85s linear ${IN} both}
.s-glass .gl-in.back{animation:ic-in-back 1s linear var(--in,0ms) both}
.s-glass .gl-in.front{animation:ic-in-front .85s linear var(--in,0ms) both}
.s-3d .ic-root{animation:ic-in-3d 1.1s linear var(--in,0ms) both}
.s-isometric .iso-in{transform-origin:24px 20px;animation:ic-in-iso 1s linear var(--in,0ms) both}
.s-isometric .raise{animation:ic-in-raise 1s linear var(--in,0ms) both}
.ic-settled :is(.pt,.draw,.draw-all,.tint-in,.gl-in,.ic-root,.iso-in,.raise){animation:none}
.ic-play .tint{animation:ic-tint 2.2s ease-in-out infinite}
.icx .sheen{transform:translateX(-300px)}
.ic-play .sheen{animation:ic-sheen 2.6s cubic-bezier(.5,0,.3,1) infinite}
.ic-play .gl-back{animation:ic-drift 3.2s ease-in-out infinite}
.ic-play .iso-float{animation:ic-float 2.6s ease-in-out infinite}
.ic-play .iso-shadow{transform-origin:24px 34px;animation:ic-shadow 2.6s ease-in-out infinite}
.s-3d .layer{transform:translate(calc(var(--i)*var(--d)*cos(var(--t))*3.4px),calc(var(--i)*var(--d)*sin(var(--t))*3.4px))}
.s-isometric .raise{transform:translateY(calc(var(--j)*var(--d)*-.4px))}
.ic-play .s-3d,.ic-play.s-3d{animation:ic-turn3d 3.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.icx,.icx *{animation:none!important}}`;

const all = () => ({ ...Object.fromEntries(Object.keys(D).map(k => [k, keyframes(k)])), ...STATIC });
let cache: string | null = null;
/** all of it, for the page */
export const iconCss = () => (cache ??= BASE + Object.entries(all()).map(([k, v]) => `@keyframes ${k}{${v}}`).join(''));

/** only what one exported icon uses */
export function cssFor(motion: string) {
  return BASE + Object.entries(all()).filter(([k]) => k === motion || k.startsWith('ic-')).map(([k, v]) => `@keyframes ${k}{${v}}`).join('');
}
