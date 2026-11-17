import { rig, type Rigged } from './rig';
import { RIGS } from './rigs';

/** Loading, rigging and placing the cat drawings in public/about/cats, shared by every scene. */

const NS = 'http://www.w3.org/2000/svg';
export type Actor = { root: SVGGElement; r: Rigged; vw: number; vh: number };

const cache = new Map<string, Promise<string>>();
/** each drawing is fetched once per page, however many cats use it */
export const fetchArt = (name: string) => {
  if (!cache.has(name)) cache.set(name, fetch(`/about/cats/${name}.svg`).then(r => r.text()));
  return cache.get(name)!;
};

/** build one rigged cat into a layer (synchronous, so a stale effect never adds a second copy) */
export function build(name: string, txt: string, layer: SVGGElement, uid: string): Actor {
  const src = new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement;
  const [, , vw, vh] = src.getAttribute('viewBox')!.split(/\s+/).map(Number);
  const root = document.createElementNS(NS, 'g') as SVGGElement;
  const art = document.createElementNS(NS, 'g') as SVGGElement;
  art.innerHTML = src.innerHTML;
  root.appendChild(art);
  layer.appendChild(root);
  return { root, r: rig(art, RIGS[name], `${uid}-${name}`), vw, vh };
}

/** stand a drawing at x with its point `anchorY` (default: its bottom) on y, mirrored by sx, s units a drawing unit */
export const place = (a: Actor, x: number, y: number, sx: number, s: number, anchorY = a.vh) =>
  a.root.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(sx * s).toFixed(3)} ${s.toFixed(3)}) translate(${-a.vw / 2} ${-anchorY})`);
