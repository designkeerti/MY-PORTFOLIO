// Builds the icon library's data from Phosphor Icons (MIT, @phosphor-icons/core).
//   public/icons/index.json        every icon: name, categories, tags (small, loaded first)
//   public/icons/<category>.json   per icon: line (regular), body (duotone's tint layer), solid (fill)
// Run: node scripts/icons/build.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { icons } from '@phosphor-icons/core';

const ROOT = 'node_modules/@phosphor-icons/core';
const OUT = 'public/icons';
mkdirSync(OUT, { recursive: true });

const slug = c => c.replace(/&/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').toLowerCase();
const read = (weight, name) => readFileSync(join(ROOT, 'assets', weight, `${name}${weight === 'regular' ? '' : '-' + weight}.svg`), 'utf8');
const paths = svg => [...svg.matchAll(/<path d="([^"]+)"( opacity="0\.2")?/g)].map(m => ({ d: m[1], tint: !!m[2] }));

const index = [];
const byCat = {};
for (const icon of icons) {
  const cat = slug(icon.categories[0]);
  const line = paths(read('regular', icon.name)).map(p => p.d).join('');
  const duo = paths(read('duotone', icon.name));
  const body = duo.filter(p => p.tint).map(p => p.d).join('');
  const solid = paths(read('fill', icon.name)).map(p => p.d).join('');
  (byCat[cat] ??= {})[icon.name] = body ? [line, solid, body] : [line, solid];
  index.push([icon.name, icon.categories.map(slug), icon.tags.filter(t => !t.startsWith('*'))]);
}
writeFileSync(join(OUT, 'index.json'), JSON.stringify(index));
for (const [cat, data] of Object.entries(byCat)) writeFileSync(join(OUT, `${cat}.json`), JSON.stringify(data));
copyFileSync(join(ROOT, 'LICENSE'), join(OUT, 'PHOSPHOR-LICENSE.txt'));
console.log(`${index.length} icons, ${Object.keys(byCat).length} files:`, Object.fromEntries(Object.entries(byCat).map(([k, v]) => [k, Object.keys(v).length])));
