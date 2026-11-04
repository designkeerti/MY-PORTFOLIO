import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Film, FilmTiming, Visual } from './types';
import type { Scene } from '../previews/types';
import { Words, EASE } from '../previews/kit';

/**
 * Renders a case-study film on a 1280×720 stage, in the site's light language: warm paper,
 * the sky on the title card, Chillax for the big lines, the project's accent for marks.
 * Time comes from requestAnimationFrame, so a faked clock can step it frame by frame.
 */

const W = 1280, H = 720;
const ink = '#17191e';
const head: CSSProperties = { fontFamily: "'Chillax', sans-serif", fontWeight: 600, letterSpacing: '-0.02em', color: ink };
const kickerStyle = (c: string): CSSProperties => ({ fontSize: 14, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: c });
const deepen = (hex: string) => `color-mix(in srgb, ${hex} 72%, ${ink})`;

type Ctx = { dur: number; marks: number[]; accent: string; dark: string; scenes: Scene[] };

/** when item i should land: on its sentence if there is one, else spread across the beat */
const at = (c: Ctx, i: number, lead = 0, n = 1) => {
  const m = c.marks[i + lead];
  if (m != null) return m + 0.1;
  const last = c.marks.length ? c.marks[c.marks.length - 1] : 0.3;
  return Math.min(c.dur - 1, last + 0.6 + (i - (c.marks.length - lead)) * ((c.dur * 0.5) / Math.max(1, n)));
};

const Rise = ({ delay = 0, children, style, y = 26 }: { delay?: number; children: ReactNode; style?: CSSProperties; y?: number }) => (
  <motion.div style={style} initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.7, ease: EASE }}>{children}</motion.div>
);

const DarkPanel = ({ c, children }: { c: Ctx; children: ReactNode }) => (
  <div style={{ position: 'absolute', left: 64, right: 64, top: 92, bottom: 64, borderRadius: 28, background: c.dark, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 80% at 50% 110%, color-mix(in srgb, ${c.accent} 30%, transparent), transparent 70%)` }} />
    {children}
  </div>
);

const Area = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ position: 'absolute', left: 80, right: 80, top: 100, bottom: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style }}>{children}</div>
);

/** a clip whose time follows the film's clock, so a frame-by-frame capture sees it play */
const FilmClip = ({ src, t }: { src: string; t: number }) => {
  const [el, setEl] = useState<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (!el || !el.duration) return;
    const want = (t % (el.duration * 1000)) / 1000;
    if (Math.abs(el.currentTime - want) > 0.02) el.currentTime = want;
  }, [el, t]);
  return <video ref={setEl} src={src} muted playsInline preload="auto" style={{ width: '100%', display: 'block' }} />;
};

function VisualView({ v, c, t }: { v: Visual; c: Ctx; t: number }) {
  switch (v.kind) {
    case 'title': return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #8fcbef 0%, #bfe2f6 38%, #e8f3f8 70%, #f7f6f2 100%)' }} />
        {[[18, 30, 520], [70, 22, 600], [44, 62, 760], [88, 70, 480]].map(([x, y, s], i) => (
          <motion.div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: s, height: s * 0.42, marginLeft: -s / 2, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,255,255,.85), rgba(255,255,255,0))', filter: 'blur(6px)' }}
            initial={{ x: 0 }} animate={{ x: i % 2 ? -60 : 60 }} transition={{ duration: c.dur, ease: 'linear' }} />
        ))}
        <Area>
          <Rise delay={0.15}><div style={{ ...kickerStyle(deepen(c.accent)), textAlign: 'center' }}>Case study · {v.kicker}</div></Rise>
          <Words text={v.title} delay={0.35} size="66px" color={ink} weight={600} font="'Chillax', sans-serif" align="center" letterSpacing="-0.025em" lineHeight={1.04} style={{ marginTop: 22, maxWidth: 1000 }} stagger={0.06} />
          <Rise delay={1.2}><div style={{ marginTop: 30, fontSize: 18, color: 'rgba(23,25,30,.55)', fontWeight: 500 }}>Keerthi Vardhan · Product designer</div></Rise>
        </Area>
      </>
    );
    case 'statement': return (
      <Area>
        {v.kicker && <Rise delay={0.1}><div style={{ ...kickerStyle(deepen(c.accent)), textAlign: 'center' }}>{v.kicker}</div></Rise>}
        <Words text={v.text} delay={0.25} size={v.text.length > 40 ? '56px' : '76px'} color={ink} weight={600} font="'Chillax', sans-serif" align="center" letterSpacing="-0.025em" lineHeight={1.06} style={{ marginTop: 20, maxWidth: 1040 }} stagger={0.06} />
      </Area>
    );
    case 'image': {
      const img = (
        <motion.img src={v.src} alt="" draggable={false} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1.03 }}
          transition={{ opacity: { duration: 0.6 }, scale: { duration: c.dur, ease: 'linear' } }}
          style={{ maxWidth: v.dark ? 1060 : 1120, maxHeight: v.dark ? 500 : 540, objectFit: 'contain', borderRadius: 16, display: 'block', boxShadow: v.dark ? '0 30px 60px -30px rgba(0,0,0,.7)' : '0 1px 0 rgba(23,25,30,.04), 0 30px 60px -36px rgba(15,30,55,.55)' }} />
      );
      return v.dark ? <DarkPanel c={c}>{img}</DarkPanel> : <Area style={{ top: 92, bottom: 64 }}>{img}</Area>;
    }
    case 'scroll': return (
      <Area style={{ top: 92, bottom: 56 }}>
        <Rise delay={0.05} y={40} style={{ width: 940, height: 560, borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 0 rgba(23,25,30,.04), 0 30px 60px -36px rgba(15,30,55,.55), 0 0 0 1px rgba(23,25,30,.06)' }}>
          <div style={{ height: 26, background: '#f1f0ec', display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map(k => <i key={k} style={{ width: 9, height: 9, borderRadius: 5, background: k, display: 'block' }} />)}
          </div>
          <div style={{ overflow: 'hidden', height: 534 }}>
            <motion.img src={v.src} alt="" draggable={false} style={{ width: '100%', display: 'block' }} initial={{ y: 0 }} animate={{ y: `-${v.to ?? 60}%` }} transition={{ duration: Math.max(2, c.dur - 1.6), delay: 0.8, ease: [0.45, 0, 0.55, 1] }} />
          </div>
        </Rise>
      </Area>
    );
    case 'phones': {
      const n = v.srcs.length;
      const w = n >= 4 ? 196 : n === 3 ? 214 : 226;
      return (
        <DarkPanel c={c}>
          {v.srcs.map((s, i) => (
            <motion.div key={s} className="phone" style={{ width: w, position: 'relative', alignSelf: 'center', marginTop: n > 1 && i % 2 ? 40 : 0 }}
              initial={{ opacity: 0, y: 120 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.16, duration: 0.8, ease: EASE }}>
              <img src={s} alt="" draggable={false} style={{ display: 'block', width: '100%', maxHeight: 470, objectFit: 'cover', objectPosition: 'top' }} />
            </motion.div>
          ))}
        </DarkPanel>
      );
    }
    case 'grid': {
      const n = v.srcs.length;
      const h = n === 2 ? 470 : n === 3 ? 420 : 250;
      const cols = n === 4 ? 2 : n;
      const cell = (s: string, i: number) => (
        <Rise key={s} delay={0.1 + i * 0.14} y={30} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
          <div style={{ height: h - (v.captions ? 30 : 0), width: '100%', borderRadius: 16, overflow: 'hidden', background: v.dark ? 'transparent' : '#fff', boxShadow: '0 1px 0 rgba(23,25,30,.04), 0 24px 50px -34px rgba(15,30,55,.5), 0 0 0 1px rgba(23,25,30,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={s} alt="" draggable={false} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
          </div>
          {v.captions?.[i] && <div style={{ marginTop: 10, fontSize: 16, fontWeight: 600, color: 'rgba(23,25,30,.6)' }}>{v.captions[i]}</div>}
        </Rise>
      );
      return (
        <Area style={{ top: 92, bottom: 60 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 18, width: n === 4 ? 900 : 1120 }}>{v.srcs.map(cell)}</div>
        </Area>
      );
    }
    case 'stats': {
      const one = v.items.length === 1;
      return (
        <Area>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${v.items.length}, minmax(0, 1fr))`, gap: 28, width: one ? 700 : 1120 }}>
            {v.items.map((s, i) => (
              <Rise key={s.l} delay={at(c, i, v.lead, v.items.length)} style={{ textAlign: one ? 'center' : 'left', borderTop: one ? 'none' : `2px solid ${c.accent}`, paddingTop: 22 }}>
                <div style={{ ...head, fontSize: one ? 170 : 88, lineHeight: 1 }}>{s.n}</div>
                <div style={{ marginTop: 14, fontSize: one ? 24 : 19, lineHeight: 1.35, color: 'rgba(23,25,30,.62)', fontWeight: 500 }}>{s.l}</div>
              </Rise>
            ))}
          </div>
        </Area>
      );
    }
    case 'points': return (
      <Area style={{ alignItems: 'flex-start', paddingLeft: 60 }}>
        <Words text={v.title} delay={0.1} size="48px" color={ink} weight={600} font="'Chillax', sans-serif" letterSpacing="-0.02em" />
        <div style={{ marginTop: 34, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {v.items.map((it, i) => (
            <Rise key={it} delay={at(c, i, v.lead, v.items.length)} y={18} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <span style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: deepen(c.accent), border: `1.5px solid ${c.accent}`, background: `color-mix(in srgb, ${c.accent} 12%, #fbfaf7)` }}>{i + 1}</span>
              <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.015em', color: ink }}>{it}</span>
            </Rise>
          ))}
        </div>
      </Area>
    );
    case 'cards': return (
      <Area>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${v.items.length}, minmax(0, 1fr))`, gap: 20, width: v.items.length === 2 ? 920 : 1120 }}>
          {v.items.map((k, i) => (
            <Rise key={k.title} delay={at(c, i, v.lead, v.items.length)} y={36} style={{ background: '#fff', borderRadius: 24, padding: '34px 32px 36px', boxShadow: '0 1px 0 rgba(23,25,30,.04), 0 30px 60px -40px rgba(15,30,55,.5), 0 0 0 1px rgba(23,25,30,.05)' }}>
              <div style={kickerStyle(deepen(c.accent))}>{k.kicker}</div>
              <div style={{ marginTop: 16, fontSize: 32, lineHeight: 1.15, fontWeight: 650, letterSpacing: '-0.02em', color: ink }}>{k.title}</div>
              {k.text && <div style={{ marginTop: 14, fontSize: 20, lineHeight: 1.4, color: 'rgba(23,25,30,.62)' }}>{k.text}</div>}
            </Rise>
          ))}
        </div>
      </Area>
    );
    case 'flow': {
      const step = Math.min(1.1, (c.dur * 0.62) / v.items.length);
      return (
        <Area>
          {v.title && <Words text={v.title} delay={0.05} size="46px" color={ink} weight={600} font="'Chillax', sans-serif" align="center" letterSpacing="-0.02em" />}
          <div style={{ marginTop: 46, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 14, maxWidth: 1120 }}>
            {v.items.map((it, i) => (
              <Rise key={it} delay={0.5 + i * step} y={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {i > 0 && <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>}
                <span style={{ padding: '16px 26px', borderRadius: 999, background: '#fff', fontSize: 25, fontWeight: 600, color: ink, boxShadow: '0 1px 0 rgba(23,25,30,.04), 0 18px 40px -28px rgba(15,30,55,.5), 0 0 0 1px rgba(23,25,30,.06)' }}>{it}</span>
              </Rise>
            ))}
          </div>
        </Area>
      );
    }
    case 'clip': return (
      <Area style={{ top: 92, bottom: 60 }}>
        <Rise delay={0.05} y={40} style={{ width: 960, borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 0 rgba(23,25,30,.04), 0 30px 60px -36px rgba(15,30,55,.55), 0 0 0 1px rgba(23,25,30,.06)' }}>
          <FilmClip src={v.src} t={t} />
        </Rise>
      </Area>
    );
    case 'scene': {
      const s = c.scenes.find(x => x.id === v.id);
      const fw = 1120, fh = 576, k = fw / 1280;
      return (
        <Area style={{ top: 96, bottom: 48 }}>
          <Rise delay={0} y={30} style={{ width: fw, height: fh, borderRadius: 22, overflow: 'hidden', position: 'relative', background: '#000', boxShadow: '0 40px 70px -40px rgba(15,30,55,.7)' }}>
            <div className="scene" style={{ width: 1280, height: fh / k, transform: `scale(${k})`, transformOrigin: '0 0', ['--fw' as string]: '1280px', ['--fh' as string]: `${fh / k}px` }}>
              {s?.render({ active: true, compact: false, w: 1280 })}
            </div>
          </Rise>
        </Area>
      );
    }
    case 'end': return (
      <>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #8fcbef 0%, #bfe2f6 40%, #eef6f9 75%, #f7f6f2 100%)' }} />
        <Area>
          <Rise delay={0.1}><div style={{ ...kickerStyle(deepen(c.accent)), textAlign: 'center' }}>{v.line}</div></Rise>
          <Words text="Keerthi Vardhan" delay={0.3} size="84px" color={ink} weight={600} font="'Chillax', sans-serif" align="center" letterSpacing="-0.03em" style={{ marginTop: 22 }} />
          <Rise delay={0.9}><div style={{ marginTop: 18, fontSize: 22, color: 'rgba(23,25,30,.6)', fontWeight: 500, textAlign: 'center' }}>Product designer · interfaces, motion and systems, all the way to production</div></Rise>
        </Area>
      </>
    );
  }
}

export function FilmView({ film, timing, accent, dark, scenes, running, onDone }:
  { film: Film; timing: FilmTiming; accent: string; dark: string; scenes: Scene[]; running: boolean; onDone?: () => void }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0; const t0 = performance.now();
    const tick = (now: number) => {
      const ms = now - t0; setT(ms);
      if (ms / 1000 < timing.total) raf = requestAnimationFrame(tick); else onDone?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, timing.total, onDone]);

  const sec = t / 1000;
  let i = timing.beats.findIndex(b => sec < b.start + b.dur);
  if (i < 0) i = timing.beats.length - 1;
  const beat = film.beats[i], bt = timing.beats[i];
  let chapter = '';
  for (let k = 0; k <= i; k++) if (film.beats[k].chapter) chapter = film.beats[k].chapter!;
  const showChrome = beat.show.kind !== 'end';

  return (
    <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden', background: '#f7f6f2', fontFamily: "'Sofia Sans', system-ui, sans-serif", color: ink }}>
      <AnimatePresence mode="sync">
        <motion.div key={i} style={{ position: 'absolute', inset: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.35 } }} transition={{ duration: 0.4 }}>
          <VisualView v={beat.show} c={{ dur: bt.dur, marks: bt.marks, accent, dark, scenes }} t={Math.max(0, t - bt.start * 1000)} />
        </motion.div>
      </AnimatePresence>
      {/* chrome */}
      <motion.div animate={{ opacity: showChrome ? 1 : 0 }} transition={{ duration: 0.4 }} style={{ position: 'absolute', left: 64, right: 64, top: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(23,25,30,.5)' }}>Keerthi Vardhan <span style={{ fontWeight: 500 }}>· Case study</span></span>
        <AnimatePresence mode="wait">
          <motion.span key={chapter} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
            style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: deepen(accent) }}>{chapter}</motion.span>
        </AnimatePresence>
      </motion.div>
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, width: `${Math.min(100, (sec / timing.total) * 100)}%`, background: accent }} />
    </div>
  );
}
