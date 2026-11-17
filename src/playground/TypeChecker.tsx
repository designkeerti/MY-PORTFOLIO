import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FONTS, PAIRINGS, fontByName, fallbackFor, fontHref, loadFont, type Font } from './data';
import { Panel, Slider, Button, Select, useToast } from './ui';

/**
 * Two fonts, three specimens, and a verdict. The checks are the ones I make by eye:
 * do the two contrast in style, do their x-heights sit together, is the body face built
 * for reading. x-heights are measured from the real fonts in the browser.
 */

type Theme = 'paper' | 'ink' | 'sky';
const THEMES: Record<Theme, { bg: string; fg: string; sub: string; card: string; accent: string; accentInk: string }> = {
  paper: { bg: '#f7f6f2', fg: '#17191e', sub: 'rgba(23,25,30,.66)', card: '#ffffff', accent: '#17191e', accentInk: '#ffffff' },
  ink: { bg: '#141318', fg: '#f1ece4', sub: 'rgba(241,236,228,.66)', card: '#1f1e25', accent: '#f1ece4', accentInk: '#141318' },
  sky: { bg: '#2c8bc6', fg: '#ffffff', sub: 'rgba(255,255,255,.78)', card: 'rgba(255,255,255,.14)', accent: '#ffffff', accentInk: '#1f5f8b' },
};

/** x-height as a share of cap height, measured from the font itself */
function useXHeight(f: Font) {
  const [ratio, setRatio] = useState<number | null>(null);
  useEffect(() => {
    let on = true;
    setRatio(null);
    loadFont(f).then(() => {
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx || !on) return;
      ctx.font = `400 200px "${f.name}", ${fallbackFor(f.cat)}`;
      const x = ctx.measureText('x').actualBoundingBoxAscent, H = ctx.measureText('H').actualBoundingBoxAscent;
      if (on && H > 0) setRatio(x / H);
    });
    return () => { on = false; };
  }, [f]);
  return ratio;
}

type Check = { ok: boolean | null; title: string; text: string };
function verdict(h: Font, b: Font, hx: number | null, bx: number | null) {
  const checks: Check[] = [];
  let score = 60;
  if (h.name === b.name) {
    checks.push({ ok: null, title: 'One family', text: 'A single family is always safe. Build the hierarchy with size and weight, and keep the heading weight well above the body.' });
    score += 12;
  } else if (h.cat !== b.cat || (h.cat === 'display' && b.cat === 'sans')) {
    checks.push({ ok: true, title: 'Clear contrast', text: `A ${h.cat} heading over a ${b.cat} body: different enough to tell apart at a glance.` });
    score += 20;
  } else {
    checks.push({ ok: false, title: 'Too alike', text: `Both are ${b.cat}s. Two similar faces look like a mistake; pick one, or make them clearly different.` });
    score -= 15;
  }
  if (hx && bx) {
    const diff = Math.abs(hx - bx) / Math.max(hx, bx);
    const pct = Math.round(diff * 100);
    if (diff < 0.08) { checks.push({ ok: true, title: 'Proportions match', text: `Their x-heights are within ${pct}% of each other, so they sit comfortably on the same line.` }); score += 12; }
    else checks.push({ ok: null, title: `x-heights differ by ${pct}%`, text: 'Fine for big headings over small text. If you mix them on one line, nudge the sizes to even them out.' });
  }
  if (b.cat === 'display') { checks.push({ ok: false, title: 'Display face for body', text: `${b.name} is drawn for big sizes; long paragraphs in it get tiring. Use it for headings.` }); score -= 25; }
  else if (b.cat === 'mono') { checks.push({ ok: null, title: 'Mono body', text: 'Monospace reads slowly in long text. Lovely for captions, labels and data.' }); score -= 8; }
  else checks.push({ ok: true, title: 'Built for reading', text: `${b.name} is a text face: open shapes and even spacing at small sizes.` });
  if (h.cat === 'mono' && b.cat !== 'mono') score -= 5;
  score = Math.max(0, Math.min(100, score));
  const label = score >= 80 ? 'Great pairing' : score >= 65 ? 'Good pairing' : 'Worth another look';
  return { checks, score, label };
}

export function TypeChecker() {
  const [params, setParams] = useSearchParams();
  const [hName, setH] = useState(fontByName(params.get('h'))?.name ?? 'Fraunces');
  const [bName, setB] = useState(fontByName(params.get('b'))?.name ?? 'Inter');
  const h = fontByName(hName)!, b = fontByName(bName)!;
  const hWeights = h.w ? h.w.split(';').map(Number) : [400];
  const [hw, setHw] = useState(600);
  const weight = hWeights.includes(hw) ? hw : hWeights[hWeights.length - 1];
  const [hSize, setHSize] = useState(56);
  const [bSize, setBSize] = useState(17);
  const [theme, setTheme] = useState<Theme>('paper');
  const [headline, setHeadline] = useState('Design that earns its place');
  const [body, setBody] = useState('Good type pairing is mostly restraint: one face with character, one that gets out of the way, and enough contrast between them that nobody has to wonder which is which.');
  const [ready, setReady] = useState(false);
  const toast = useToast();
  const hx = useXHeight(h), bx = useXHeight(b);
  const v = useMemo(() => verdict(h, b, hx, bx), [h, b, hx, bx]);
  const T = THEMES[theme];

  useEffect(() => { setReady(false); Promise.all([loadFont(h), loadFont(b)]).then(() => setReady(true)); }, [h, b]);
  useEffect(() => { setParams({ h: hName, b: bName }, { replace: true }); }, [hName, bName, setParams]);

  const hFam = `"${h.name}", ${fallbackFor(h.cat)}`, bFam = `"${b.name}", ${fallbackFor(b.cat)}`;
  const options = FONTS.map(f => ({ value: f.name, label: f.name, group: { sans: 'Sans', serif: 'Serif', display: 'Display', mono: 'Mono', slab: 'Slab' }[f.cat] }));
  const shuffle = () => { const p = PAIRINGS[Math.floor(Math.random() * PAIRINGS.length)]; setH(p.heading); setB(p.body); if (p.weight) setHw(p.weight); };
  const css = () => {
    const links = [...new Set([h, b].map(fontHref).filter(Boolean))].map(u => `@import url('${u}');`).join('\n');
    return `${links}\n\nh1, h2, h3 {\n  font-family: ${hFam};\n  font-weight: ${weight};\n}\n\nbody {\n  font-family: ${bFam};\n  font-weight: 400;\n  line-height: 1.55;\n}`;
  };
  const copyCss = async () => { try { await navigator.clipboard.writeText(css()); toast('CSS copied'); } catch { toast('Copy blocked by the browser'); } };

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 md:grid-cols-[320px_minmax(0,1fr)] md:gap-5 md:px-6">
      <div className="flex flex-col gap-4 self-start">
        <Panel className="flex flex-col gap-4 p-5">
          <Select label="Heading font" value={hName} onChange={setH} options={options} />
          <Select label="Body font" value={bName} onChange={setB} options={options} />
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setH(bName); setB(hName); }}>Swap</Button>
            <Button variant="ghost" onClick={shuffle}>Try a pick</Button>
          </div>
          {hWeights.length > 1 && (
            <div>
              <p className="pg-label">Heading weight</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hWeights.map(w => (
                  <button key={w} type="button" onClick={() => setHw(w)} className={`rounded-full border px-3 py-1 text-[13px] tabular-nums ${w === weight ? 'border-ink bg-ink text-white' : 'border-ink/12 bg-white text-ink/70'}`}>{w}</button>
                ))}
              </div>
            </div>
          )}
          <Slider label="Heading size" min={28} max={96} step={1} value={hSize} onChange={setHSize} unit="px" />
          <Slider label="Body size" min={13} max={22} step={0.5} value={bSize} onChange={setBSize} unit="px" />
          <div>
            <p className="pg-label">Background</p>
            <div className="mt-2 flex gap-2">
              {(Object.keys(THEMES) as Theme[]).map(k => (
                <button key={k} type="button" onClick={() => setTheme(k)} aria-pressed={theme === k}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] capitalize ${theme === k ? 'border-ink bg-ink text-white' : 'border-ink/12 bg-white text-ink/70'}`}>
                  <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: THEMES[k].bg }} />{k}
                </button>
              ))}
            </div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-baseline justify-between">
            <p className="pg-label">Verdict</p>
            <p className="font-mono text-[12px] text-ink/50">{v.score}/100</p>
          </div>
          <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.01em] text-ink">{v.label}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${v.score}%` }} /></div>
          <ul className="mt-4 flex flex-col gap-3">
            {v.checks.map(c => (
              <li key={c.title} className="flex gap-3">
                <span aria-hidden className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${c.ok === true ? 'bg-[#2f9e6a] text-white' : c.ok === false ? 'bg-[#e0533d] text-white' : 'bg-ink/12 text-ink/70'}`}>{c.ok === true ? '✓' : c.ok === false ? '!' : '·'}</span>
                <span className="text-[14px] leading-snug text-ink/75"><span className="font-semibold text-ink">{c.title}.</span> {c.text}</span>
              </li>
            ))}
          </ul>
          <Button onClick={copyCss} className="mt-5 w-full">Copy CSS</Button>
        </Panel>
      </div>

      {/* the specimens */}
      <div className={`flex flex-col gap-4 transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-60'}`}>
        <div className="rounded-[24px] p-6 md:p-10" style={{ background: T.bg, color: T.fg, boxShadow: '0 30px 60px -40px rgba(15,30,55,.5), 0 0 0 1px rgba(23,25,30,.06)' }}>
          <p className="text-[12px] uppercase tracking-[0.2em]" style={{ fontFamily: bFam, color: T.sub }}>Hero</p>
          <h2 contentEditable suppressContentEditableWarning spellCheck={false} onBlur={e => setHeadline(e.currentTarget.textContent || headline)}
            className="mt-3 outline-none" style={{ fontFamily: hFam, fontWeight: weight, fontSize: `clamp(28px, 7vw, ${hSize}px)`, lineHeight: 1.04, letterSpacing: '-0.02em' }}>{headline}</h2>
          <p contentEditable suppressContentEditableWarning spellCheck={false} onBlur={e => setBody(e.currentTarget.textContent || body)}
            className="mt-4 max-w-[60ch] outline-none" style={{ fontFamily: bFam, fontSize: bSize + 1, lineHeight: 1.55, color: T.sub }}>{body}</p>
          <p className="mt-4 text-[12px]" style={{ fontFamily: bFam, color: T.sub }}>Tap the heading or the paragraph to write your own.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <article className="rounded-[24px] p-6 md:p-8" style={{ background: T.bg, color: T.fg, boxShadow: '0 0 0 1px rgba(23,25,30,.06)' }}>
            <p className="text-[11px] uppercase tracking-[0.2em]" style={{ fontFamily: bFam, color: T.sub }}>Article · 4 min read</p>
            <h3 className="mt-2" style={{ fontFamily: hFam, fontWeight: weight, fontSize: Math.round(hSize * 0.55), lineHeight: 1.1, letterSpacing: '-0.015em' }}>The quiet half of a pairing</h3>
            <p className="mt-3" style={{ fontFamily: bFam, fontSize: bSize, lineHeight: 1.6, color: T.sub }}>The body face does most of the work. Readers spend minutes with it and seconds with the heading, so choose it first, then find a heading that adds character without fighting it.</p>
            <p className="mt-3" style={{ fontFamily: bFam, fontSize: bSize, lineHeight: 1.6, color: T.sub }}>Check the small things: numbers like 1,240 and 08:45, quotes “like these”, and how an em dash sits. The details give a face away.</p>
          </article>
          <div className="flex flex-col justify-between rounded-[24px] p-6" style={{ background: T.bg, color: T.fg, boxShadow: '0 0 0 1px rgba(23,25,30,.06)' }}>
            <div className="rounded-[18px] p-5" style={{ background: T.card }}>
              <p className="text-[11px] uppercase tracking-[0.2em]" style={{ fontFamily: bFam, color: T.sub }}>Pro plan</p>
              <p className="mt-1" style={{ fontFamily: hFam, fontWeight: weight, fontSize: 34, lineHeight: 1 }}>$24<span style={{ fontSize: 16, fontFamily: bFam, fontWeight: 400, color: T.sub }}> / month</span></p>
              <p className="mt-3" style={{ fontFamily: bFam, fontSize: Math.max(13, bSize - 2), lineHeight: 1.5, color: T.sub }}>Unlimited projects, shared libraries and priority support.</p>
              <button type="button" className="mt-4 w-full rounded-full py-2.5 text-[14px] font-medium" style={{ fontFamily: bFam, background: T.accent, color: T.accentInk }}>Start free trial</button>
            </div>
          </div>
        </div>
        <p className="px-1 text-[13px] text-ink/55">Showing <span className="font-medium text-ink/75">{h.name}</span> {weight} over <span className="font-medium text-ink/75">{b.name}</span>. Fonts load from Google Fonts{[h, b].some(f => f.src === 'fontshare') ? ' and Fontshare' : ''}, both free.</p>
      </div>
    </div>
  );
}
