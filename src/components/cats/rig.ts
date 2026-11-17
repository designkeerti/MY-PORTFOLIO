/**
 * Cut-out rigging for flat SVG illustrations.
 *
 * The cats are drawn as stacked shapes, and the big ones (a whole silhouette, say) run across
 * body, legs and tail at once. So rather than sorting shapes into parts, each part gets a
 * polygon in the drawing's own coordinates and a joint (pivot):
 *   - a shape that sits wholly inside one part's polygon simply belongs to that part
 *   - a shape that crosses polygons is drawn once per polygon, each copy clipped to it,
 *     plus once for the body, clipped to everything outside them
 * Each part's copy is clipped to its polygon grown by a little, and drawn under or over
 * the body's copy, so when the part turns about its joint no seam opens.
 * The original paint order is kept: consecutive copies that belong to the same part are
 * wrapped in one <g>, and a pose sets one transform per part, composed down the hierarchy.
 */

export type Pt = [number, number];

export type PartDef = {
  name: string;
  /** the part it hangs from; omitted means the body */
  parent?: string;
  pivot: Pt;
  /** region of the drawing this part owns */
  poly: Pt[];
  /** split shapes that cross into this region (true), or only take shapes wholly inside it (false) */
  split?: boolean;
  /** where its cut copies sit relative to the body's: under hides the seam beneath the body */
  layer?: 'under' | 'over';
  /** how far the clip grows past the seam, in drawing units */
  pad?: number;
  /** cut only these shapes (by leaf index) with this region; others ignore it */
  only?: number[];
};

export type RigDef = {
  /** the body's pivot: it breathes and tilts about this point */
  pivot: Pt;
  parts: PartDef[];
  /** fix-ups: leaf index -> part, for shapes the polygons get wrong */
  assign?: Record<number, string>;
};

export type Pose = Record<string, { r?: number; x?: number; y?: number; sx?: number; sy?: number }>;

const LEAVES = 'path,ellipse,polygon,circle,rect,polyline,line';
const NS = 'http://www.w3.org/2000/svg';

const area = (p: Pt[]) => p.reduce((s, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return s + x * y2 - x2 * y; }, 0) / 2;

function inside([x, y]: Pt, p: Pt[]) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** grow a polygon outward by d (mitred, limited) */
function grow(p: Pt[], d: number): Pt[] {
  if (!d) return p;
  const s = Math.sign(area(p)) || 1;
  return p.map((v, i) => {
    const a = p[(i - 1 + p.length) % p.length], b = p[(i + 1) % p.length];
    const n1 = norm([(v[1] - a[1]) * s, -(v[0] - a[0]) * s]), n2 = norm([(b[1] - v[1]) * s, -(b[0] - v[0]) * s]);
    const m = norm([n1[0] + n2[0], n1[1] + n2[1]]);
    const k = d / Math.max(0.35, m[0] * n1[0] + m[1] * n1[1]);
    return [v[0] + m[0] * k, v[1] + m[1] * k] as Pt;
  });
}
const norm = ([x, y]: Pt): Pt => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const d = (p: Pt[]) => 'M' + p.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L') + 'Z';

export type Rigged = {
  /** part name -> the groups that carry it */
  groups: Map<string, SVGGElement[]>;
  /** parent chain for each part, body first */
  chain: Map<string, string[]>;
  def: RigDef;
};

/**
 * Restructure an inline, rendered drawing (`root` holds its shapes) into rigged groups.
 * Must run while the drawing is in the document (it measures shapes with getBBox).
 */
export function rig(root: SVGGElement, def: RigDef, uid: string): Rigged {
  const leaves = [...root.querySelectorAll<SVGGraphicsElement>(LEAVES)];
  const boxes = leaves.map(l => l.getBBox());
  const parts = def.parts;
  const splitters = parts.filter(p => p.split !== false);

  // clip paths: each splitting part (grown), and the body's rest (the drawing minus all of them)
  const defs = document.createElementNS(NS, 'defs');
  const clip = (id: string, path: string, evenodd = false) => {
    const c = document.createElementNS(NS, 'clipPath');
    c.setAttribute('id', id); c.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const pth = document.createElementNS(NS, 'path');
    pth.setAttribute('d', path);
    if (evenodd) pth.setAttribute('clip-rule', 'evenodd');
    c.appendChild(pth); defs.appendChild(c);
  };
  for (const p of splitters) clip(`${uid}-${p.name}`, d(grow(p.poly, p.pad ?? 1.6)));
  // the body keeps what lies outside the regions that cut this shape (one clip per set of them)
  const rests = new Map<string, string>();
  const rest = (reach: PartDef[]) => {
    const key = reach.map(p => p.name).join('+');
    if (!rests.has(key)) {
      const id = `${uid}-rest${rests.size}`;
      clip(id, 'M-5000 -5000H5000V5000H-5000Z' + reach.map(p => d(p.poly)).join(''), true);
      rests.set(key, id);
    }
    return rests.get(key)!;
  };

  type Piece = { part: string; el: SVGGraphicsElement };
  const pieces: Piece[] = [];
  leaves.forEach((leaf, i) => {
    const b = boxes[i];
    const corners: Pt[] = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]];
    const forced = def.assign?.[i];
    if (forced) { pieces.push({ part: forced, el: leaf }); return; }
    // wholly inside: the smallest region that holds it
    const holders = parts.filter(p => (!p.only || p.only.includes(i)) && corners.every(c => inside(c, p.poly))).sort((a, b) => Math.abs(area(a.poly)) - Math.abs(area(b.poly)));
    if (holders.length) { pieces.push({ part: holders[0].name, el: leaf }); return; }
    // crossing: one clipped copy per region it reaches, and the rest for the body
    const reach = splitters.filter(p => {
      if (p.only && !p.only.includes(i)) return false;
      const xs = p.poly.map(v => v[0]), ys = p.poly.map(v => v[1]);
      return Math.min(...xs) < b.x + b.width && Math.max(...xs) > b.x && Math.min(...ys) < b.y + b.height && Math.max(...ys) > b.y;
    });
    if (!reach.length) { pieces.push({ part: 'body', el: leaf }); return; }
    const copy = (part: string, clipId: string) => {
      const c = leaf.cloneNode(true) as SVGGraphicsElement;
      c.setAttribute('clip-path', `url(#${clipId})`);
      pieces.push({ part, el: c });
    };
    reach.filter(p => p.layer === 'under').forEach(p => copy(p.name, `${uid}-${p.name}`));
    copy('body', rest(reach));
    reach.filter(p => p.layer !== 'under').forEach(p => copy(p.name, `${uid}-${p.name}`));
  });

  // rebuild: flat, in paint order, runs of one part share a group
  while (root.firstChild) root.removeChild(root.firstChild);
  root.appendChild(defs);
  const groups = new Map<string, SVGGElement[]>();
  let g: SVGGElement | null = null, cur = '';
  for (const p of pieces) {
    if (!g || p.part !== cur) {
      g = document.createElementNS(NS, 'g') as SVGGElement;
      g.dataset.part = p.part; cur = p.part;
      root.appendChild(g);
      groups.set(p.part, [...(groups.get(p.part) ?? []), g]);
    }
    g.appendChild(p.el);
  }

  const chain = new Map<string, string[]>([['body', ['body']]]);
  const byName = new Map(parts.map(p => [p.name, p]));
  const up = (n: string): string[] => {
    if (chain.has(n)) return chain.get(n)!;
    const parent = byName.get(n)?.parent ?? 'body';
    const c = [...up(parent), n];
    chain.set(n, c);
    return c;
  };
  parts.forEach(p => up(p.name));
  return { groups, chain, def };
}

/** set a pose: angles in degrees about each part's pivot, offsets in drawing units */
export function pose(r: Rigged, p: Pose) {
  const pivots = new Map<string, Pt>([['body', r.def.pivot], ...r.def.parts.map(x => [x.name, x.pivot] as [string, Pt])]);
  const local = (n: string) => {
    const q = p[n]; if (!q) return '';
    const [px, py] = pivots.get(n)!;
    let s = '';
    if (q.x || q.y) s += `translate(${(q.x ?? 0).toFixed(2)} ${(q.y ?? 0).toFixed(2)})`;
    if (q.r) s += `rotate(${q.r.toFixed(2)} ${px} ${py})`;
    if ((q.sx ?? 1) !== 1 || (q.sy ?? 1) !== 1) s += `translate(${px} ${py})scale(${(q.sx ?? 1).toFixed(3)} ${(q.sy ?? 1).toFixed(3)})translate(${-px} ${-py})`;
    return s;
  };
  for (const [name, gs] of r.groups) {
    const t = (r.chain.get(name) ?? ['body', name]).map(local).join('');
    for (const g of gs) g.setAttribute('transform', t);
  }
}
