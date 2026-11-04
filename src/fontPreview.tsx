import { useEffect, useState } from 'react';

/**
 * Font pairing preview. Open the site with ?font=D (or any id below) and the
 * whole site switches to that pairing; a small switcher at the bottom of the
 * screen flips through the rest. ?font=off goes back to the live fonts.
 *
 * Preview fonts load from Fontshare / Google Fonts. Whichever pairing is
 * chosen gets self-hosted and baked into index.css; this file then goes.
 */

type Pairing = { id: string; name: string; mood: string; css: string[]; vars: Record<string, string> };

const FS = 'https://api.fontshare.com/v2/css?';
const GF = 'https://fonts.googleapis.com/css2?';

// name1 / name2 are the two lines of the name in the hero ("Keerthi" / "Vardhan").
const v = (o: {
  text: string; display: string; displayStyle?: string;
  n1: [family: string, style: string, weight: number, track: string, scale?: number];
  n2: [family: string, style: string, weight: number, track: string, scale?: number];
  head: [family: string, weight: number, track: string, style?: string];
}) => ({
  '--font-text': `'${o.text}'`,
  '--font-display': `'${o.display}'`,
  '--display-style': o.displayStyle ?? 'normal',
  '--name1-family': `'${o.n1[0]}'`, '--name1-style': o.n1[1], '--name1-weight': String(o.n1[2]), '--name1-track': o.n1[3], '--name1-scale': String(o.n1[4] ?? 1),
  '--name2-family': `'${o.n2[0]}'`, '--name2-style': o.n2[1], '--name2-weight': String(o.n2[2]), '--name2-track': o.n2[3], '--name2-scale': String(o.n2[4] ?? 1),
  '--head-family': `'${o.head[0]}'`, '--head-weight': String(o.head[1]), '--head-track': o.head[2], '--head-style': o.head[3] ?? 'normal',
});

export const PAIRINGS: Pairing[] = [
  { id: 'A', name: 'Boska + Switzer', mood: 'Quiet editorial', css: [FS + 'f[]=boska@400,401,500,700&f[]=switzer@400,500&display=swap'],
    vars: v({ text: 'Switzer', display: 'Boska', displayStyle: 'italic', n1: ['Boska', 'italic', 400, '-0.01em'], n2: ['Boska', 'normal', 700, '-0.025em'], head: ['Boska', 500, '-0.01em'] }) },
  { id: 'B', name: 'Cabinet Grotesk + Erode', mood: 'Confident studio', css: [FS + 'f[]=cabinet-grotesk@800&display=swap', FS + 'f[]=erode@400,401&display=swap'],
    vars: v({ text: 'Erode', display: 'Erode', displayStyle: 'italic', n1: ['Cabinet Grotesk', 'normal', 800, '-0.04em'], n2: ['Cabinet Grotesk', 'normal', 800, '-0.04em'], head: ['Cabinet Grotesk', 800, '-0.03em'] }) },
  { id: 'C', name: 'Gloock + Familjen Grotesk', mood: 'Ink and character', css: [GF + 'family=Gloock&family=Familjen+Grotesk:wght@400..700&display=swap'],
    vars: v({ text: 'Familjen Grotesk', display: 'Gloock', n1: ['Gloock', 'normal', 400, '-0.02em'], n2: ['Gloock', 'normal', 400, '-0.02em'], head: ['Gloock', 400, '-0.01em'] }) },
  { id: 'D', name: 'Melodrama + Switzer', mood: 'Fashion editorial', css: [FS + 'f[]=melodrama@300,400,500,600,700&display=swap', FS + 'f[]=switzer@400,500&display=swap'],
    vars: v({ text: 'Switzer', display: 'Melodrama', n1: ['Melodrama', 'normal', 300, '-0.01em', 1.08], n2: ['Melodrama', 'normal', 700, '-0.02em', 1.08], head: ['Melodrama', 600, '-0.01em'] }) },
  { id: 'E', name: 'Zodiak + Supreme', mood: 'Sharp modern classic', css: [FS + 'f[]=zodiak@400,401,700,800&f[]=supreme@400,500&display=swap'],
    vars: v({ text: 'Supreme', display: 'Zodiak', displayStyle: 'italic', n1: ['Zodiak', 'italic', 400, '-0.01em'], n2: ['Zodiak', 'normal', 800, '-0.03em'], head: ['Zodiak', 700, '-0.02em'] }) },
  { id: 'F', name: 'Kalnia + Hedvig Letters Sans', mood: 'Contemporary drama', css: [GF + 'family=Kalnia:wght@300..700&family=Hedvig+Letters+Sans&display=swap'],
    vars: v({ text: 'Hedvig Letters Sans', display: 'Kalnia', n1: ['Kalnia', 'normal', 300, '-0.01em'], n2: ['Kalnia', 'normal', 700, '-0.02em'], head: ['Kalnia', 600, '-0.01em'] }) },
  { id: 'G', name: 'Panchang + Sentient', mood: 'Wide and literary', css: [FS + 'f[]=panchang@700,800&f[]=sentient@400,401&display=swap'],
    vars: v({ text: 'Sentient', display: 'Sentient', displayStyle: 'italic', n1: ['Panchang', 'normal', 800, '-0.02em', 0.56], n2: ['Panchang', 'normal', 800, '-0.02em', 0.56], head: ['Panchang', 700, '-0.02em'] }) },
  { id: 'H', name: 'Funnel Display + Funnel Sans', mood: 'Playful precision', css: [GF + 'family=Funnel+Display:wght@300..800&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap'],
    vars: v({ text: 'Funnel Sans', display: 'Funnel Display', n1: ['Funnel Display', 'normal', 300, '-0.03em'], n2: ['Funnel Display', 'normal', 800, '-0.04em'], head: ['Funnel Display', 700, '-0.03em'] }) },
];

const KEY = 'fontPreview';
const linkIds: string[] = [];
let appliedVars: string[] = [];

function apply(id: string | null) {
  const root = document.documentElement;
  linkIds.splice(0).forEach(l => document.getElementById(l)?.remove());
  appliedVars.forEach(k => root.style.removeProperty(k));
  appliedVars = [];
  const p = PAIRINGS.find(x => x.id === id);
  if (!p) { delete root.dataset.font; return; }
  p.css.forEach((href, i) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href; l.id = `font-preview-${i}`;
    document.head.appendChild(l); linkIds.push(l.id);
  });
  Object.entries(p.vars).forEach(([k, val]) => { root.style.setProperty(k, val); appliedVars.push(k); });
  root.dataset.font = p.id;
}

function readInitial(): string | null {
  try {
    const q = new URLSearchParams(location.search).get('font');
    if (q === 'off') { sessionStorage.removeItem(KEY); return null; }
    if (q) { sessionStorage.setItem(KEY, q.toUpperCase()); return q.toUpperCase(); }
    return sessionStorage.getItem(KEY);
  } catch { return null; }
}

// Apply before first paint, so there is no flash of the live fonts.
const initial = readInitial();
apply(initial);

export function FontSwitcher() {
  const [id, setId] = useState<string | null>(initial && PAIRINGS.some(p => p.id === initial) ? initial : null);
  useEffect(() => {
    apply(id);
    try {
      const u = new URL(location.href);
      if (id) { u.searchParams.set('font', id); sessionStorage.setItem(KEY, id); }
      else { u.searchParams.delete('font'); sessionStorage.removeItem(KEY); }
      history.replaceState(history.state, '', u);
    } catch { /* ignore */ }
  }, [id]);
  if (!id) return null;
  const i = PAIRINGS.findIndex(p => p.id === id);
  const p = PAIRINGS[i];
  const go = (d: number) => setId(PAIRINGS[(i + d + PAIRINGS.length) % PAIRINGS.length].id);
  const btn = 'flex h-9 w-9 items-center justify-center rounded-full text-lg text-white/80 hover:bg-white/10';
  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-[#16131c]/90 p-1 text-white shadow-2xl backdrop-blur-md">
        <button aria-label="Previous pairing" className={btn} onClick={() => go(-1)}>‹</button>
        <div className="min-w-[200px] px-2 text-center leading-tight">
          <div className="text-[13px] font-semibold">{p.id} · {p.name}</div>
          <div className="text-[11px] text-white/55">{p.mood} · {i + 1} of {PAIRINGS.length}</div>
        </div>
        <button aria-label="Next pairing" className={btn} onClick={() => go(1)}>›</button>
        <button aria-label="Close font preview" className={btn + ' text-sm'} onClick={() => setId(null)}>✕</button>
      </div>
    </div>
  );
}
