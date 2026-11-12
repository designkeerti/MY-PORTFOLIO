/**
 * The motions, as plain CSS so an exported SVG carries them with it. A moving part is a
 * <g data-a style="--a: name; --dur; --dl; --ease; transform-origin: x y">; it plays while
 * an ancestor has the class ic-play. (The root class is icx: the about section's icons own .ic.) Each style adds one flourish of its own (s-* classes).
 * Everything is still under prefers-reduced-motion.
 */

const KEYFRAMES: Record<string, string> = {
  'm-swing': '0%,58%,100%{transform:rotate(0)}10%{transform:rotate(17deg)}22%{transform:rotate(-14deg)}34%{transform:rotate(9deg)}46%{transform:rotate(-4deg)}',
  'm-pop': '0%,58%,100%{transform:scale(1)}14%{transform:scale(1.32)}28%{transform:scale(.9)}40%{transform:scale(1.05)}',
  'm-beat': '0%,100%{transform:scale(1)}14%{transform:scale(1.14)}28%{transform:scale(.98)}42%{transform:scale(1.1)}70%{transform:scale(1)}',
  'm-spin': 'to{transform:rotate(360deg)}',
  'm-bob': '0%,100%{transform:translateY(0)}50%{transform:translateY(-1.2px)}',
  'm-nod': '0%,100%{transform:rotate(0) translateY(0)}25%{transform:rotate(-9deg) translateY(-.5px)}55%{transform:rotate(7deg)}75%{transform:rotate(-2deg)}',
  'm-shutter': '0%,40%,100%{transform:scale(1)}50%{transform:scale(.4)}62%{transform:scale(1.1)}72%{transform:scale(1)}',
  'm-flash': '0%,44%,70%,100%{transform:scale(1);opacity:1}52%{transform:scale(2.6);opacity:1}60%{transform:scale(1.4);opacity:.25}',
  'm-unlock': '0%,14%,86%,100%{transform:translateY(0) rotate(0)}32%,68%{transform:translateY(-2.4px) rotate(-16deg)}',
  'm-drift': '0%,100%{transform:translateX(-.6px)}50%{transform:translateX(.8px)}',
  'm-rain': '0%{transform:translate(.6px,-3px);opacity:0}25%{opacity:1}80%{opacity:1}100%{transform:translate(-.8px,3.4px);opacity:0}',
  'm-hop': '0%,16%{transform:translate(0,0)}22%,38%{transform:translate(-8px,-4px)}44%,60%{transform:translate(-4px,-4px)}66%,82%{transform:translate(0,-4px)}88%,100%{transform:translate(0,0)}',
  'm-type': '0%,60%,100%{transform:translateY(0);opacity:.55}30%{transform:translateY(-1.8px);opacity:1}',
  'm-rock': '0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}',
  'm-launch': '0%,100%{transform:translate(0,0)}10%{transform:translate(-.3px,.2px)}20%{transform:translate(.3px,-.2px)}30%{transform:translate(-.3px,0)}55%{transform:translate(0,-2.4px)}80%{transform:translate(0,.4px)}',
  'm-flicker': '0%,100%{transform:scale(1,1)}25%{transform:scale(.82,1.38)}50%{transform:scale(1.08,.8)}75%{transform:scale(.9,1.2)}',
  'm-rays': '0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.2);opacity:.3}',
  'm-twinkle': '0%,100%{transform:rotate(0) scale(1)}35%{transform:rotate(72deg) scale(.8)}55%{transform:rotate(72deg) scale(1.14)}70%{transform:rotate(72deg) scale(1)}',
  'm-blink': '0%,100%{transform:scale(0) rotate(0);opacity:0}40%,60%{transform:scale(1) rotate(45deg);opacity:1}',
  'm-lid': '0%,18%,82%,100%{transform:rotate(0) translateY(0)}38%,62%{transform:rotate(-30deg) translateY(-1.4px)}',
  'm-dl': '0%{transform:translateY(-6px);opacity:0}25%{opacity:1}55%{transform:translateY(0)}68%{transform:translateY(1.4px)}80%,100%{transform:translateY(0);opacity:1}',
  'm-tray': '0%,55%,82%,100%{transform:translateY(0)}68%{transform:translateY(1.1px)}',
  'm-ripple': '0%{transform:scale(1);opacity:.75}100%{transform:scale(1.45);opacity:0}',
  'm-charge': '0%,100%{opacity:.18;transform:scaleY(.6)}30%,70%{opacity:1;transform:scaleY(1)}',
  'm-wave': '0%,100%{opacity:.2}35%,65%{opacity:1}',
  'm-bounce': '0%,100%{transform:translateY(0) scale(1,1)}10%{transform:translateY(0) scale(1.08,.9)}32%{transform:translateY(-4.2px) scale(.96,1.05)}52%{transform:translateY(0) scale(1.06,.92)}64%{transform:translateY(-1.2px) scale(1)}74%{transform:translateY(0)}',
  'm-shadow': '0%,100%{transform:scaleX(1);opacity:1}32%{transform:scaleX(.5);opacity:.35}52%{transform:scaleX(1.05);opacity:1}64%{transform:scaleX(.85)}',
  'm-steam': '0%{transform:translateY(1.6px) scaleY(.7);opacity:0}30%{opacity:1}100%{transform:translateY(-2.6px) scaleY(1.1);opacity:0}',
  'm-gift': '0%,14%,76%,100%{transform:translateY(0) rotate(0)}30%{transform:translateY(-3.8px) rotate(-9deg)}46%{transform:translateY(-2.4px) rotate(4deg)}60%{transform:translateY(-.4px) rotate(-1deg)}',
  'm-fly': '0%{transform:translate(0,0) scale(1);opacity:1}38%{transform:translate(9px,-8px) scale(.55);opacity:0}39%{transform:translate(-10px,9px) scale(.55);opacity:0}72%,100%{transform:translate(0,0) scale(1);opacity:1}',
  'm-grow': '0%{transform:scaleY(.25)}35%,80%{transform:scaleY(1)}100%{transform:scaleY(.25)}',
  'm-door': '0%,22%,78%,100%{transform:scaleX(1)}40%,60%{transform:scaleX(.28)}',
  'm-smoke': '0%{transform:translate(0,1.4px) scale(.8);opacity:0}30%{opacity:1}100%{transform:translate(1.2px,-2.4px) scale(1.15);opacity:0}',
  'm-flap': '0%,16%,84%,100%{transform:scaleY(1)}40%,60%{transform:scaleY(-.82)}',
  'm-rise': '0%,32%{transform:translateY(1px) scale(.6);opacity:0}48%{opacity:1}74%{transform:translateY(-5.6px) scale(1);opacity:1}100%{transform:translateY(-7.4px) scale(1);opacity:0}',
  'm-scan': '0%,100%{transform:translate(0,0) rotate(0)}25%{transform:translate(1.2px,-1px) rotate(-6deg)}50%{transform:translate(0,-1.6px) rotate(0)}75%{transform:translate(-1.2px,-.6px) rotate(6deg)}',
  'm-trace': '0%{stroke-dashoffset:1}38%,78%{stroke-dashoffset:0}100%{stroke-dashoffset:-1}',
  'm-blinkeye': '0%,40%,52%,100%{transform:scaleY(1)}46%{transform:scaleY(.08)}',
  'm-look': '0%,100%{transform:translateX(0)}18%,38%{transform:translateX(-2.2px)}58%,78%{transform:translateX(2.2px)}',
  'm-dropin': '0%{transform:translateY(-4px);opacity:0}18%{opacity:1}42%{transform:translateY(6px);opacity:1}54%,100%{transform:translateY(6px);opacity:0}',
  'm-nudge': '0%,40%,100%{transform:translate(0,0)}46%{transform:translate(0,.8px)}54%{transform:translate(1.2px,0)}62%{transform:translate(-.5px,0)}70%{transform:translate(0,0)}',
  'm-zap': '0%,100%{transform:scale(1) rotate(0);opacity:1}8%{transform:scale(1.14)}12%{opacity:.35}16%{opacity:1}26%{transform:scale(1)}48%{transform:rotate(-5deg)}60%{transform:rotate(0)}',
  'm-folder': '0%,20%,80%,100%{transform:scaleY(1) skewX(0)}40%,60%{transform:scaleY(.7) skewX(-9deg)}',
  'm-peek': '0%,20%,80%,100%{transform:translateY(0)}40%,60%{transform:translateY(-3.4px)}',
  // the styles' own flourishes
  'ic-draw': 'from{stroke-dashoffset:1}to{stroke-dashoffset:0}',
  'ic-tint': '0%,100%{fill-opacity:.16}50%{fill-opacity:.36}',
  'ic-pop': '0%{transform:scale(.84)}55%{transform:scale(1.06)}100%{transform:scale(1)}',
  'ic-sheen': '0%{transform:translateX(-30px) skewX(-20deg)}55%,100%{transform:translateX(30px) skewX(-20deg)}',
  'ic-drift': '0%,100%{transform:translate(0,0)}50%{transform:translate(-1.4px,1.4px)}',
  'ic-float': '0%,100%{transform:translateY(0)}50%{transform:translateY(-1.8px)}',
  'ic-shadow': '0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(.84);opacity:.3}',
};

const BASE = `
.icx [data-a],.icx [data-dash] path,.icx .ic-root,.icx .sheen,.icx .gl-back,.icx .iso-float,.icx .iso-shadow{transform-box:view-box}
.ic-play [data-a]{animation:var(--a) var(--dur,1.8s) var(--ease,cubic-bezier(.45,0,.25,1)) var(--dl,0s) infinite both}
.icx [data-dash] path{stroke-dasharray:1 1}
.ic-play [data-dash] path{animation:m-trace var(--dur,2s) cubic-bezier(.6,0,.3,1) infinite both}
.ic-play.s-regular .dr{stroke-dasharray:1 1;animation:ic-draw .9s cubic-bezier(.6,0,.3,1) both}
.ic-play.s-duotone .tint{animation:ic-tint 2.2s ease-in-out infinite}
.ic-play.s-filled .ic-root{transform-origin:12px 12px;animation:ic-pop .55s cubic-bezier(.3,1.4,.5,1) both}
.ic-play .sheen{animation:ic-sheen 2.6s cubic-bezier(.5,0,.3,1) infinite}
.ic-play .gl-back{animation:ic-drift 3.2s ease-in-out infinite}
.ic-play .iso-float{animation:ic-float 2.6s ease-in-out infinite}
.ic-play .iso-shadow{transform-origin:24px 34px;animation:ic-shadow 2.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.ic-play *{animation:none!important}}`;

/** all of it, for the page */
export const ICON_CSS = BASE + Object.entries(KEYFRAMES).map(([k, v]) => `@keyframes ${k}{${v}}`).join('');

/** only what one exported icon uses */
export function cssFor(motions: string[]) {
  const keep = new Set([...motions, 'm-trace', 'ic-draw', 'ic-tint', 'ic-pop', 'ic-sheen', 'ic-drift', 'ic-float', 'ic-shadow']);
  return BASE + Object.entries(KEYFRAMES).filter(([k]) => keep.has(k)).map(([k, v]) => `@keyframes ${k}{${v}}`).join('');
}
