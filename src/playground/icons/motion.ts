/**
 * Motion for 1,500 icons. Each icon gets one motion that suits what it is, picked from its
 * name (a bell rings, an arrow travels its way, a gear turns, a plant sways), falling back
 * on its category. The motions are plain CSS, in the icons' 256-unit grid, so an exported
 * SVG carries them. A moving glyph is <g data-a style="--a: name; --dur; transform-origin">
 * and plays while an ancestor has the class ic-play; each style adds a flourish of its own.
 * The root class is icx (the about section's own icons use .ic).
 */

export type Motion = { a: string; o?: [number, number]; dur?: number; ease?: string };

const RULES: [RegExp, Motion][] = [
  [/bell|siren|alarm/, { a: 'm-ring', o: [128, 40], dur: 1.8 }],
  [/hourglass/, { a: 'm-flip', dur: 2.6 }],
  [/spinner|circle-notch|fan|hurricane|tornado/, { a: 'm-spin', dur: 1.4, ease: 'linear' }],
  [/gear|aperture|disc|vinyl|record$|atom|yin-yang|cookie|pinwheel|ferris|life-buoy|steering-wheel|tire|arrows-clockwise|arrows-counter-clockwise|arrow-clockwise|arrow-counter-clockwise/, { a: 'm-step', dur: 2.2 }],
  [/snowflake|sun(?!-horizon)|asterisk/, { a: 'm-spin', dur: 12, ease: 'linear' }],
  [/heart|pulse|heartbeat|first-aid/, { a: 'm-beat', dur: 1.3 }],
  [/arrow.*(up-right|square-up-right|circle-up-right)/, { a: 'm-go-ur', dur: 1.6 }],
  [/arrow.*(up-left)/, { a: 'm-go-ul', dur: 1.6 }],
  [/arrow.*(down-right)/, { a: 'm-go-dr', dur: 1.6 }],
  [/arrow.*(down-left)/, { a: 'm-go-dl', dur: 1.6 }],
  [/(arrow|caret).*right|sign-in|sign-out|share|skip-forward|fast-forward|next/, { a: 'm-go-r', dur: 1.6 }],
  [/(arrow|caret).*left|skip-back|rewind|previous|reply|undo|arrow-u-/, { a: 'm-go-l', dur: 1.6 }],
  [/(arrow|caret).*down|download|tray-arrow-down|import/, { a: 'm-go-d', dur: 1.6 }],
  [/(arrow|caret).*up|upload|export|cloud-arrow-up|rocket/, { a: 'm-go-u', dur: 1.6 }],
  [/arrows|swap|shuffle|repeat|recycle/, { a: 'm-spin-half', dur: 2.2 }],
  [/lock|key|shield|password|fingerprint|vault|safe/, { a: 'm-jiggle', dur: 2 }],
  [/paper-plane|airplane|drone|bird|butterfly|feather|kite/, { a: 'm-fly', dur: 2.6 }],
  [/phone|device-mobile|call/, { a: 'm-buzz', dur: 1.6 }],
  [/chat|envelope|mail|megaphone|speech|note|sticker|messenger|whatsapp|telegram/, { a: 'm-bob', dur: 2.2 }],
  [/battery|lightning|plug|cell-signal|wifi|broadcast|radio|rss|bluetooth|antenna|cell-tower|signal/, { a: 'm-pulse', dur: 1.4 }],
  [/trash|eraser|broom|bucket/, { a: 'm-wobble', dur: 2 }],
  [/star|sparkle|seal|crown|trophy|medal|confetti|magic-wand|diamond|shooting/, { a: 'm-twinkle', dur: 2.2 }],
  [/car|bus|truck|bicycle|motorcycle|train|boat|sailboat|scooter|taxi|van|jeep|tractor|ambulance|subway|tram|police|garage/, { a: 'm-drive', dur: 1.2 }],
  [/cloud|wind|fog|smoke|rainbow|moon|planet/, { a: 'm-drift', dur: 3.2 }],
  [/drop|rain|water|shower|drip|coffee|tea|wine|beer|martini|bowl|pot|cooking/, { a: 'm-drip', dur: 2 }],
  [/eye|binoculars|scan/, { a: 'm-blink', dur: 2.8 }],
  [/flag|banner|pennant|windsock/, { a: 'm-wave', o: [40, 128], dur: 1.8 }],
  [/magnifying|detective|search/, { a: 'm-scan', dur: 2.4 }],
  [/clock|timer|watch|calendar/, { a: 'm-tick', dur: 2.4 }],
  [/hand-waving|hand-palm/, { a: 'm-wave-hand', o: [128, 220], dur: 1.6 }],
  [/thumbs|hand|handshake|hands/, { a: 'm-tilt', o: [128, 200], dur: 1.8 }],
  [/fire|flame|campfire|candle|torch|fireplace/, { a: 'm-flicker', o: [128, 230], dur: 0.9 }],
  [/leaf|plant|tree|flower|cactus|grains|clover|palm|mushroom|potted|acorn|orange-slice/, { a: 'm-sway', o: [128, 236], dur: 2.6 }],
  [/music|speaker|headphones|microphone|guitar|piano|metronome|waveform|equalizer|playlist|boombox/, { a: 'm-groove', dur: 1.2 }],
  [/dice|game|puzzle|cards|chess|club|spade|joystick|sword|crosshair|target/, { a: 'm-roll', dur: 2.2 }],
  [/cat|dog|paw|horse|rabbit|bug|bee|cow|duck|fish|shrimp|spider|cherries|egg|frog/, { a: 'm-hop', o: [128, 236], dur: 1.4 }],
  [/coin|currency|money|cash|wallet|bank|credit-card|receipt|tag|percent|chart|trend|piggy/, { a: 'm-coin', dur: 2.4 }],
  [/house|building|storefront|warehouse|factory|church|castle|tent|igloo|hospital|lighthouse/, { a: 'm-settle', o: [128, 236], dur: 2 }],
  [/user|person|people|smiley|baby|student|chalkboard-teacher|identification|face|skull|ghost|robot|alien/, { a: 'm-nod', o: [128, 220], dur: 2.2 }],
  [/play|pause|stop|record|video|film|image|camera|monitor-play|youtube/, { a: 'm-pop', dur: 1.8 }],
  [/pencil|pen|paint|brush|eyedropper|highlighter|marker|palette|scribble|signature|crayon/, { a: 'm-write', o: [60, 200], dur: 1.6 }],
  [/cursor|pointing|mouse|click|hand-tap|selection/, { a: 'm-click', dur: 1.4 }],
  [/bookmark|push-pin|map-pin|pin|anchor|location|navigation|compass/, { a: 'm-drop', o: [128, 236], dur: 1.8 }],
  [/globe|earth/, { a: 'm-drift', dur: 4 }],
  [/package|box|archive|gift|basket|shopping|bag|cube|stack|tote/, { a: 'm-settle', o: [128, 236], dur: 2 }],
];

const BY_CATEGORY: Record<string, Motion> = {
  arrows: { a: 'm-pop', dur: 2.2 }, brands: { a: 'm-pop', dur: 2.4 }, weather: { a: 'm-drift', dur: 3.2 },
  nature: { a: 'm-sway', o: [128, 236], dur: 2.6 }, people: { a: 'm-nod', o: [128, 220], dur: 2.2 },
  media: { a: 'm-pop', dur: 1.8 }, games: { a: 'm-roll', dur: 2.2 }, finances: { a: 'm-coin', dur: 2.4 },
  'maps-travel': { a: 'm-drop', o: [128, 236], dur: 1.8 }, commerce: { a: 'm-settle', o: [128, 236], dur: 2 },
  communications: { a: 'm-bob', dur: 2.2 }, 'health-wellness': { a: 'm-beat', dur: 1.6 },
};
const DEFAULT: Motion = { a: 'm-float', dur: 2.4 };

export function motionFor(name: string, cats: string[]): Motion {
  for (const [re, m] of RULES) if (re.test(name)) return m;
  return BY_CATEGORY[cats[0]] ?? DEFAULT;
}

const KEYFRAMES: Record<string, string> = {
  'm-ring': '0%,50%,100%{transform:rotate(0)}8%{transform:rotate(12deg)}18%{transform:rotate(-9deg)}28%{transform:rotate(5deg)}38%{transform:rotate(-2deg)}',
  'm-flip': '0%,15%{transform:rotate(0)}45%,100%{transform:rotate(180deg)}',
  'm-spin': 'to{transform:rotate(360deg)}',
  'm-step': '0%{transform:rotate(0)}35%,100%{transform:rotate(90deg)}',
  'm-spin-half': '0%{transform:rotate(0)}40%,100%{transform:rotate(180deg)}',
  'm-beat': '0%,45%,100%{transform:scale(1)}12%{transform:scale(1.08)}24%{transform:scale(.99)}34%{transform:scale(1.04)}',
  'm-go-r': '0%,55%,100%{transform:translateX(0)}22%{transform:translateX(14px)}',
  'm-go-l': '0%,55%,100%{transform:translateX(0)}22%{transform:translateX(-14px)}',
  'm-go-u': '0%,55%,100%{transform:translateY(0)}22%{transform:translateY(-14px)}',
  'm-go-d': '0%,55%,100%{transform:translateY(0)}22%{transform:translateY(14px)}',
  'm-go-ur': '0%,55%,100%{transform:translate(0,0)}22%{transform:translate(11px,-11px)}',
  'm-go-ul': '0%,55%,100%{transform:translate(0,0)}22%{transform:translate(-11px,-11px)}',
  'm-go-dr': '0%,55%,100%{transform:translate(0,0)}22%{transform:translate(11px,11px)}',
  'm-go-dl': '0%,55%,100%{transform:translate(0,0)}22%{transform:translate(-11px,11px)}',
  'm-jiggle': '0%,45%,100%{transform:rotate(0)}8%{transform:rotate(-5deg)}16%{transform:rotate(4deg)}24%{transform:rotate(-2deg)}32%{transform:rotate(1deg)}',
  'm-fly': '0%,55%,100%{transform:translate(0,0)}24%{transform:translate(12px,-12px)}',
  'm-buzz': '0%,40%,100%{transform:rotate(0)}5%,15%,25%{transform:rotate(-5deg)}10%,20%,30%{transform:rotate(5deg)}',
  'm-bob': '0%,55%,100%{transform:translateY(0)}24%{transform:translateY(-10px)}',
  'm-pulse': '0%,55%,100%{transform:scale(1);opacity:1}22%{transform:scale(1.06);opacity:.7}',
  'm-wobble': '0%,50%,100%{transform:rotate(0)}10%{transform:rotate(-6deg)}22%{transform:rotate(5deg)}34%{transform:rotate(-2deg)}',
  'm-twinkle': '0%,55%,100%{transform:rotate(0) scale(1)}24%{transform:rotate(15deg) scale(.94)}',
  'm-drive': '0%,55%,100%{transform:translateX(0)}20%{transform:translateX(8px)}34%{transform:translateX(-2px)}',
  'm-drift': '0%,100%{transform:translateX(-6px)}50%{transform:translateX(6px)}',
  'm-drip': '0%,55%,100%{transform:translateY(0)}24%{transform:translateY(-8px)}',
  'm-blink': '0%,40%,52%,100%{transform:scaleY(1)}46%{transform:scaleY(.12)}',
  'm-wave': '0%,55%,100%{transform:skewY(0)}18%{transform:skewY(-4deg)}36%{transform:skewY(3deg)}',
  'm-scan': '0%,60%,100%{transform:translate(0,0)}15%{transform:translate(8px,-6px)}30%{transform:translate(0,-10px)}45%{transform:translate(-8px,-6px)}',
  'm-tick': '0%,45%,100%{transform:rotate(0)}10%{transform:rotate(-6deg)}20%{transform:rotate(5deg)}30%{transform:rotate(-2deg)}',
  'm-wave-hand': '0%,50%,100%{transform:rotate(0)}10%,30%{transform:rotate(12deg)}20%,40%{transform:rotate(-6deg)}',
  'm-tilt': '0%,55%,100%{transform:rotate(0)}24%{transform:rotate(-8deg) translateY(-4px)}',
  'm-flicker': '0%,100%{transform:scaleY(1)}30%{transform:scaleY(1.04)}60%{transform:scaleY(.98)}',
  'm-sway': '0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}',
  'm-groove': '0%,55%,100%{transform:rotate(0) scale(1)}15%{transform:rotate(-4deg) scale(1.03)}35%{transform:rotate(4deg) scale(1.03)}',
  'm-roll': '0%{transform:rotate(0)}35%,100%{transform:rotate(90deg)}',
  'm-hop': '0%,55%,100%{transform:translateY(0)}24%{transform:translateY(-10px)}',
  'm-coin': '0%,10%{transform:scaleX(1)}35%{transform:scaleX(-1)}60%,100%{transform:scaleX(1)}',
  'm-settle': '0%,55%,100%{transform:translateY(0)}22%{transform:translateY(-8px)}',
  'm-nod': '0%,55%,100%{transform:rotate(0)}22%{transform:rotate(-5deg)}40%{transform:rotate(2deg)}',
  'm-pop': '0%,50%,100%{transform:scale(1)}18%{transform:scale(1.08)}34%{transform:scale(.99)}',
  'm-write': '0%,55%,100%{transform:translate(0,0) rotate(0)}18%{transform:translate(6px,-4px) rotate(-4deg)}36%{transform:translate(10px,0) rotate(0)}',
  'm-click': '0%,45%,100%{transform:scale(1)}18%{transform:scale(.9)}32%{transform:scale(1.02)}',
  'm-drop': '0%,55%,100%{transform:translateY(0)}20%{transform:translateY(-12px)}36%{transform:translateY(1px)}',
  'm-turn': '0%,10%{transform:scaleX(1)}35%{transform:scaleX(-1)}60%,100%{transform:scaleX(1)}',
  'm-float': '0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}',
  // the styles' flourishes
  'ic-reveal': 'from{transform:scale(0)}to{transform:scale(1)}',
  'ic-tint': '0%,100%{fill-opacity:.2}50%{fill-opacity:.34}',
  'ic-pop': '0%{transform:scale(.94)}100%{transform:scale(1)}',
  'ic-sheen': '0%{transform:translateX(-300px) skewX(-20deg)}55%,100%{transform:translateX(300px) skewX(-20deg)}',
  'ic-drift': '0%,100%{transform:translate(0,0)}50%{transform:translate(-8px,8px)}',
  'ic-float': '0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}',
  'ic-shadow': '0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(.84);opacity:.3}',
  'ic-turn3d': '0%,100%{--t:62deg}50%{--t:118deg}',
};

const BASE = `
@property --t{syntax:'<angle>';inherits:true;initial-value:70deg}
.icx [data-a],.icx .ic-root,.icx .sheen,.icx .gl-back,.icx .iso-float,.icx .iso-shadow,.icx .reveal,.icx .layer{transform-box:view-box}
.ic-play [data-a]{animation:var(--a) var(--dur,2.4s) var(--ease,cubic-bezier(.22,.8,.24,1)) var(--dl,0s) infinite both}
.ic-play.s-regular .reveal{transform-origin:128px 128px;animation:ic-reveal .7s cubic-bezier(.3,0,.2,1) both}
.ic-play.s-duotone .tint{animation:ic-tint 2.2s ease-in-out infinite}
.ic-play.s-filled .ic-root{transform-origin:128px 128px;animation:ic-pop .4s cubic-bezier(.22,.8,.24,1) both}
.icx .sheen{transform:translateX(-300px)}
.ic-play .sheen{animation:ic-sheen 2.6s cubic-bezier(.5,0,.3,1) infinite}
.ic-play .gl-back{animation:ic-drift 3.2s ease-in-out infinite}
.ic-play .iso-float{animation:ic-float 2.6s ease-in-out infinite}
.ic-play .iso-shadow{transform-origin:24px 34px;animation:ic-shadow 2.6s ease-in-out infinite}
.s-3d .layer{transform:translate(calc(var(--i)*cos(var(--t))*3.4px),calc(var(--i)*sin(var(--t))*3.4px))}
.ic-play.s-3d{animation:ic-turn3d 3.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.ic-play,.ic-play *{animation:none!important}}`;

/** all of it, for the page */
export const ICON_CSS = BASE + Object.entries(KEYFRAMES).map(([k, v]) => `@keyframes ${k}{${v}}`).join('');

/** only what one exported icon uses */
export function cssFor(motion: string) {
  return BASE + Object.entries(KEYFRAMES).filter(([k]) => k === motion || k.startsWith('ic-')).map(([k, v]) => `@keyframes ${k}{${v}}`).join('');
}
