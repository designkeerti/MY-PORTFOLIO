import { motion } from 'framer-motion';
import { useMemo } from 'react';

export type HeroState = {
  h1a: string; h1b: string; lead: string; btn1: string; btn2: string; img: string;
  glow: string; /** rotates the crack art from its native red toward the brand colour */ crackHue: number;
  stats: { n: string; l: string }[]; brand: string; country: string;
};

export const heroStates: HeroState[] = [
  { h1a: 'PURE FUEL.', h1b: 'ZERO FAKES.', lead: 'India’s destination for authentic, premium supplements. Every brand directly contracted, every product sealed. No grey market, no middlemen.', btn1: 'Shop the stacks', btn2: 'Talk to us', img: '/cbs/products/hero-Apollon_Omega_Supreme-removebg-preview.png', glow: 'rgba(108,189,224,.42)', crackHue: 175, stats: [{ n: 'FAST', l: 'Delivery' }, { n: '11', l: 'Authorised brands' }, { n: 'PAN', l: 'India shipping' }, { n: 'SECURE', l: 'Payments' }], brand: 'CBS · Cross Border Supps', country: '· India' },
  { h1a: 'PURE POTENCY.', h1b: 'OMEGA SUPREME.', lead: 'Apollon Nutrition’s wild-caught Icelandic fish oil. 1300 mg EPA + 945 mg DHA per serving, a megadose of omega-3s for recovery, performance and long-term health.', btn1: 'Shop Omega Supreme', btn2: 'Shop Apollon', img: '/cbs/products/hero-Apollon_Omega_Supreme-removebg-preview.png', glow: 'rgba(230,170,70,.40)', crackHue: 32, stats: [{ n: '1300', l: 'MG EPA' }, { n: '945', l: 'MG DHA' }, { n: '60', l: 'Servings' }, { n: 'WILD', l: 'Icelandic' }], brand: 'Apollon Nutrition', country: '· USA' },
  { h1a: 'PURE PUMP.', h1b: 'BEAST STIM.', lead: 'Beast Pharm’s stimulant pre-workout. 6 g citrulline, 3.2 g beta-alanine and 300 mg caffeine per scoop. Sour cherry.', btn1: 'Shop STIM', btn2: 'Shop Beast Pharm', img: '/cbs/products/hero-bp_stim-tub_sour-cherry_transparent-backtif-1024x1024.webp', glow: 'rgba(214,52,90,.42)', crackHue: 0, stats: [{ n: '6g', l: 'Citrulline' }, { n: '3.2g', l: 'B-Alanine' }, { n: '300', l: 'MG Caffeine' }, { n: '30', l: 'Servings' }], brand: 'Beast Pharm', country: '· UK' },
  { h1a: 'PURE FOCUS.', h1b: 'OPTIMISE.', lead: 'Combat Fuel’s nootropic pre-workout. Strawberry lime.', btn1: 'Shop Optimise', btn2: 'Shop Combat Fuel', img: '/cbs/products/hero-CF-Optimise-Strawberry-Lime-Front-2-1024x1024.webp', glow: 'rgba(80,190,120,.38)', crackHue: 120, stats: [{ n: 'FOCUS', l: 'Nootropic blend' }, { n: '30', l: 'Servings' }, { n: 'GBR', l: 'Origin' }, { n: 'SEALED', l: 'Authentic' }], brand: 'Combat Fuel', country: '· UK' },
];

/* Debris: the store's own broken-brick pieces, thrown outward from the hole. */
const PIECES = [
  { src: 1, x: -46, y: -40, r: -24, s: 0.92, d: 0.00 }, { src: 3, x: 42, y: -46, r: 20, s: 0.66, d: 0.10 },
  { src: 2, x: -56, y: 22, r: 34, s: 0.80, d: 0.06 }, { src: 4, x: 52, y: 34, r: -18, s: 0.86, d: 0.16 },
  { src: 3, x: -26, y: 52, r: 12, s: 0.58, d: 0.22 }, { src: 1, x: 30, y: 56, r: -30, s: 0.72, d: 0.12 },
  { src: 2, x: -64, y: -14, r: -12, s: 0.54, d: 0.26 }, { src: 4, x: 64, y: -12, r: 26, s: 0.60, d: 0.20 },
];

/**
 * The store's home hero, composed for a preview frame: the brick wall, the broken hole with its
 * crack artwork, the product coming through it, and the two-tone headline with the stats bar.
 * `enterDelay` lets the vault doors open first.
 */
export const WallHero = ({ state = heroStates[0], enterDelay = 0, compact = false, tiny = false }: { state?: HeroState; enterDelay?: number; compact?: boolean; tiny?: boolean }) => {
  const pieces = useMemo(() => PIECES, []);
  const d = enterDelay;
  const crackFilter = `hue-rotate(${state.crackHue}deg) saturate(1.1)`;

  return (
    <div className="cbs" style={{ position: 'absolute', inset: 0, background: '#06080b', overflow: 'hidden', fontFamily: 'var(--cbs-font-body)' }}>
      {/* the wall itself */}
      <img src="/cbs/wall-bg.webp" alt="" aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(2.05) contrast(1.06) saturate(1.05)' }} />
      {/* keep the copy readable over it */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,8,11,.94) 0%, rgba(6,8,11,.72) 34%, rgba(6,8,11,.12) 62%), linear-gradient(180deg, rgba(6,8,11,.55), transparent 26%, transparent 74%, rgba(6,8,11,.8))' }} />

      {/* the broken hole */}
      <div style={{ position: 'absolute', right: '2%', top: '50%', width: '54%', aspectRatio: '1', transform: 'translateY(-50%)' }}>
        <motion.div style={{ position: 'absolute', inset: '8%', borderRadius: '50%', background: `radial-gradient(circle at 50% 50%, ${state.glow} 0%, transparent 68%)`, filter: 'blur(14px)' }}
          initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: d + .15, duration: .9, ease: [0.22, 0.61, 0.36, 1] }} />

        <motion.img src="/cbs/wall/wall-cracks-and-bricks0.svg" alt="" aria-hidden
          style={{ position: 'absolute', inset: '9%', width: '82%', height: '82%', filter: crackFilter, opacity: .95 }}
          initial={{ opacity: 0, scale: .92 }} animate={{ opacity: .95, scale: 1 }} transition={{ delay: d + .1, duration: .8, ease: [0.22, 0.61, 0.36, 1] }} />

        {/* the product coming through */}
        <motion.img src={state.img} alt="" draggable={false}
          style={{ position: 'absolute', left: '50%', top: '50%', height: '58%', width: 'auto', maxWidth: '58%', objectFit: 'contain', x: '-50%', filter: 'drop-shadow(0 24px 34px rgba(0,0,0,.75))', zIndex: 2 }}
          initial={{ opacity: 0, y: '-24%', scale: .84 }}
          animate={{ opacity: 1, y: ['-24%', '-50%', '-54%', '-50%'], scale: 1 }}
          transition={{ opacity: { delay: d + .5, duration: .5 }, scale: { delay: d + .5, duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }, y: { delay: d + .5, duration: 4.4, times: [0, .3, .66, 1], ease: 'easeOut' } }} />

        <motion.img src="/cbs/wall/wall-cracks-and-bricks.svg" alt="" aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: crackFilter, zIndex: 3 }}
          initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: d + .2, duration: .85, ease: [0.22, 0.61, 0.36, 1] }} />

        {/* debris thrown out of the wall */}
        {pieces.map((p, i) => (
          <motion.img key={i} src={`/cbs/wall/piece${p.src}.svg`} alt="" aria-hidden
            style={{ position: 'absolute', left: '50%', top: '50%', width: `${9 * p.s}%`, zIndex: 4, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.6))' }}
            initial={{ opacity: 0, x: '-50%', y: '-50%', rotate: 0, scale: .4 }}
            animate={{ opacity: [0, 1, 1], x: `calc(-50% + ${p.x}%)`, y: `calc(-50% + ${p.y}%)`, rotate: p.r, scale: 1 }}
            transition={{ delay: d + .3 + p.d, duration: 1.2, ease: [0.16, 0.8, 0.3, 1] }} />
        ))}
      </div>

      {/* copy */}
      <div style={{ position: 'absolute', left: '5%', top: '50%', transform: 'translateY(-50%)', width: '52%', zIndex: 5 }}>
        <motion.div className="kicker" style={{ color: 'var(--cbs-edge)', marginBottom: 10, fontSize: 10 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d + .3 }}>{state.brand} {state.country}</motion.div>
        <h1 style={{ fontFamily: 'var(--cbs-font-display)', fontWeight: 400, textTransform: 'uppercase', lineHeight: .92, letterSpacing: '.005em', fontSize: tiny ? 'clamp(17px, calc(var(--fw) * 0.082), 34px)' : compact ? 'clamp(22px, calc(var(--fw) * 0.062), 54px)' : 'clamp(26px, calc(var(--fw) * 0.068), 78px)', margin: 0, color: '#fff' }}>
          <motion.span style={{ display: 'block' }} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d + .35, duration: .7, ease: [0.22, 0.61, 0.36, 1] }}>{state.h1a}</motion.span>
          <motion.span style={{ display: 'block', color: 'var(--cbs-edge)' }} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d + .5, duration: .7, ease: [0.22, 0.61, 0.36, 1] }}>{state.h1b}</motion.span>
        </h1>
        {!compact && !tiny && (
          <motion.p style={{ color: 'rgba(255,255,255,.74)', fontSize: 'clamp(10px, calc(var(--fw) * 0.0115), 15px)', lineHeight: 1.5, margin: '12px 0 0', paddingLeft: 12, borderLeft: '2px solid var(--cbs-edge)', maxWidth: '42ch' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d + .75, duration: .6 }}>{state.lead}</motion.p>
        )}
        {!tiny && <motion.div style={{ display: 'flex', gap: 8, marginTop: compact ? 12 : 18, flexWrap: 'nowrap' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d + .9, duration: .5 }}>
          <span className="kicker" style={{ background: '#fff', color: '#000', padding: compact ? '8px 10px' : '10px 15px', borderRadius: 4, fontSize: compact ? 7.5 : 9, whiteSpace: 'nowrap' }}>{state.btn1} →</span>
          <span className="kicker" style={{ border: '1px solid rgba(255,255,255,.3)', color: '#fff', padding: compact ? '8px 10px' : '10px 15px', borderRadius: 4, fontSize: compact ? 7.5 : 9, whiteSpace: 'nowrap' }}>{state.btn2}</span>
        </motion.div>}
        {!tiny && <motion.div style={{ display: 'flex', marginTop: compact ? 12 : 18, border: '1px solid rgba(255,255,255,.12)', borderRadius: 6, background: 'rgba(10,13,18,.62)', backdropFilter: 'blur(10px)', maxWidth: 420 }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d + 1.05, duration: .5 }}>
          {(compact ? state.stats.slice(0, 3) : state.stats).map((s, i) => (
            <div key={s.l} style={{ flex: 1, padding: '9px 5px', textAlign: 'center', borderLeft: i ? '1px solid rgba(255,255,255,.1)' : 0, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--cbs-font-display)', fontSize: 'clamp(12px, calc(var(--fw) * 0.0165), 21px)', color: i === 0 ? 'var(--cbs-edge)' : '#fff', lineHeight: 1 }}>{s.n}</div>
              <div className="kicker" style={{ fontSize: 7, color: 'rgba(255,255,255,.45)', marginTop: 4, letterSpacing: '.06em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.l}</div>
            </div>
          ))}
        </motion.div>}
      </div>
    </div>
  );
};
