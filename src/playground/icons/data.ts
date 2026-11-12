import type { Geo } from './render';

/**
 * Phosphor's icons, built into public/icons by scripts/icons/build.mjs. The index (names,
 * categories, tags) loads first; drawings come one category file at a time, when an icon
 * from that category is on screen.
 */

export type IconMeta = { name: string; cats: string[]; tags: string[] };

export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'arrows', label: 'Arrows' }, { value: 'brands', label: 'Brands' }, { value: 'commerce', label: 'Commerce' },
  { value: 'communications', label: 'Communication' }, { value: 'design', label: 'Design' }, { value: 'technology-development', label: 'Development' },
  { value: 'editor', label: 'Editor' }, { value: 'finances', label: 'Finance' }, { value: 'games', label: 'Games' },
  { value: 'health-wellness', label: 'Health' }, { value: 'maps-travel', label: 'Maps & travel' }, { value: 'media', label: 'Media' },
  { value: 'nature', label: 'Nature' }, { value: 'objects', label: 'Objects' }, { value: 'office', label: 'Office' },
  { value: 'people', label: 'People' }, { value: 'system', label: 'System' }, { value: 'weather', label: 'Weather' },
];

let index: Promise<IconMeta[]> | null = null;
export const loadIndex = () => (index ??= fetch('/icons/index.json')
  .then(r => { if (!r.ok) throw new Error(`icons ${r.status}`); return r.json() as Promise<[string, string[], string[]][]>; })
  .then(rows => rows.map(([name, cats, tags]) => ({ name, cats, tags })))
  .catch(e => { index = null; throw e; }));

const files = new Map<string, Promise<Record<string, Geo>>>();
/** one category's drawings, keyed by icon name (an icon lives in its first category's file) */
export function loadCategory(cat: string) {
  let p = files.get(cat);
  if (!p) {
    p = fetch(`/icons/${cat}.json`)
      .then(r => { if (!r.ok) throw new Error(`icons/${cat} ${r.status}`); return r.json() as Promise<Record<string, [string, string, string?]>>; })
      .then(raw => Object.fromEntries(Object.entries(raw).map(([n, [line, solid, body]]) => [n, { line, solid, body }])))
      .catch(e => { files.delete(cat); throw e; });
    files.set(cat, p);
  }
  return p;
}

/** best matches first: the name, then the start of a word in it, then a tag */
export function search(list: IconMeta[], q: string) {
  q = q.trim().toLowerCase().replace(/\s+/g, '-');
  if (!q) return list;
  const scored: [IconMeta, number][] = [];
  for (const i of list) {
    const s = i.name === q ? 0 : i.name.startsWith(q) ? 1 : i.name.includes('-' + q) ? 2 : i.name.includes(q) ? 3
      : i.tags.some(t => t.startsWith(q.replace(/-/g, ' '))) ? 4 : -1;
    if (s >= 0) scored.push([i, s]);
  }
  return scored.sort((a, b) => a[1] - b[1] || a[0].name.length - b[0].name.length).map(([i]) => i);
}
