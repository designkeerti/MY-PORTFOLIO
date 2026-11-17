// Builds the icon library's data from Phosphor Icons (MIT, @phosphor-icons/core).
//   public/icons/index.json        every icon: name, categories, tags (small, loaded first)
//   public/icons/<category>.json   per icon: line (regular), body (duotone's tint layer), solid (fill)
// line and solid come split into parts ("|" between them): each part one piece of the drawing
// with its holes, biggest first, so the parts can move on their own.
// Run: node scripts/icons/build.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { icons } from '@phosphor-icons/core';
import svgpath from 'svgpath';

const ROOT = 'node_modules/@phosphor-icons/core';
const OUT = 'public/icons';
mkdirSync(OUT, { recursive: true });

const slug = c => c.replace(/&/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').toLowerCase();
const read = (weight, name) => readFileSync(join(ROOT, 'assets', weight, `${name}${weight === 'regular' ? '' : '-' + weight}.svg`), 'utf8');
const paths = svg => [...svg.matchAll(/<path d="([^"]+)"( opacity="0\.2")?/g)].map(m => ({ d: m[1], tint: !!m[2] }));

// a subpath as points (curves sampled), for areas and containment
function poly(d) {
  const pts = [];
  svgpath(d).unarc().unshort().iterate((s, _i, x, y) => {
    const [c] = s;
    if (c === 'M' || c === 'L') pts.push([s[1], s[2]]);
    else if (c === 'H') pts.push([s[1], y]);
    else if (c === 'V') pts.push([x, s[1]]);
    else if (c === 'C' || c === 'Q') {
      const P = c === 'C' ? [[x, y], [s[1], s[2]], [s[3], s[4]], [s[5], s[6]]] : [[x, y], [s[1], s[2]], [s[3], s[4]]];
      for (let t = 0.25; t <= 1; t += 0.25) {
        let q = P; while (q.length > 1) q = q.slice(1).map((p, k) => [q[k][0] + (p[0] - q[k][0]) * t, q[k][1] + (p[1] - q[k][1]) * t]);
        pts.push(q[0]);
      }
    }
  });
  return pts;
}
const area = P => Math.abs(P.reduce((a, p, i) => { const q = P[(i + 1) % P.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
const inside = (P, [x, y]) => {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
};
// pieces of a drawing: every subpath at an even depth starts a piece, the ones inside it
// (its holes) go with it
function split(d) {
  const subs = svgpath(d).abs().round(2).toString().split(/(?=M)/).filter(s => s.trim());
  if (subs.length < 2) return subs.join('');
  const P = subs.map(poly), A = P.map(area);
  const holders = subs.map((_, i) => subs.map((_, j) => j).filter(j => j !== i && A[j] > A[i] && inside(P[j], P[i][0])));
  const own = subs.map((_, i) => holders[i].length % 2 === 0
    ? i
    // the nearest (smallest) holder at one level up
    : holders[i].filter(j => holders[j].length === holders[i].length - 1).sort((a, b) => A[a] - A[b])[0] ?? i);
  const pieces = new Map();
  own.forEach((o, i) => { const p = pieces.get(o) ?? { d: '', a: A[o] }; p.d += subs[i]; pieces.set(o, p); });
  let list = [...pieces.values()].sort((a, b) => b.a - a.a);
  // at most eight: the smallest share the last
  if (list.length > 8) list = [...list.slice(0, 7), { d: list.slice(7).map(p => p.d).join(''), a: 0 }];
  return list.map(p => p.d).join('|');
}

const index = [];
const byCat = {};
for (const icon of icons) {
  const cat = slug(icon.categories[0]);
  const line = split(paths(read('regular', icon.name)).map(p => p.d).join(''));
  const duo = paths(read('duotone', icon.name));
  const body = duo.filter(p => p.tint).map(p => p.d).join('');
  const solid = split(paths(read('fill', icon.name)).map(p => p.d).join(''));
  (byCat[cat] ??= {})[icon.name] = body ? [line, solid, body] : [line, solid];
  index.push([icon.name, icon.categories.map(slug), icon.tags.filter(t => !t.startsWith('*'))]);
}
writeFileSync(join(OUT, 'index.json'), JSON.stringify(index));
for (const [cat, data] of Object.entries(byCat)) writeFileSync(join(OUT, `${cat}.json`), JSON.stringify(data));
copyFileSync(join(ROOT, 'LICENSE'), join(OUT, 'PHOSPHOR-LICENSE.txt'));
console.log(`${index.length} icons, ${Object.keys(byCat).length} files:`, Object.fromEntries(Object.entries(byCat).map(([k, v]) => [k, Object.keys(v).length])));
