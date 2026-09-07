import { motion } from 'framer-motion';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

export const EASE = [0.22, 0.61, 0.36, 1] as const;

/** full-bleed scene background */
export const Bg = ({ color, children, style, className = '' }: { color?: string; children?: ReactNode; style?: CSSProperties; className?: string }) => (
  <div className={`scene ${className}`} style={{ background: color, ...style }}>{children}</div>
);

/** big words rising in one by one */
export const Words = ({ text, delay = 0, size = 'clamp(26px, 5vw, 74px)', color = '#fff', weight = 900, font, align = 'left', style, stagger = 0.07, lineHeight = 0.98, letterSpacing = '-.035em' }:
  { text: string; delay?: number; size?: string; color?: string; weight?: number; font?: string; align?: 'left' | 'center' | 'right'; style?: CSSProperties; stagger?: number; lineHeight?: number; letterSpacing?: string }) => {
  const lines = text.split('\n');
  let i = 0;
  return (
    <div style={{ textAlign: align, fontFamily: font, fontWeight: weight, fontSize: size, color, lineHeight, letterSpacing, ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: 'block' }}>
          {line.split(' ').map((w, wi) => {
            const k = i++;
            return (
              <span key={wi} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '.08em', marginBottom: '-.08em' }}>
                <motion.span style={{ display: 'inline-block', paddingRight: '.28em' }} initial={{ y: '110%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: delay + k * stagger, duration: 0.6, ease: EASE }}>{w}</motion.span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** an image with a slow push-in */
export const Shot = ({ src, alt = '', from = { scale: 1.06, x: 0, y: 0 }, to = { scale: 1, x: 0, y: 0 }, duration = 6, fit = 'cover', position = 'center', style, delay = 0, className = '' }:
  { src: string; alt?: string; from?: { scale?: number; x?: number | string; y?: number | string }; to?: { scale?: number; x?: number | string; y?: number | string }; duration?: number; fit?: 'cover' | 'contain'; position?: string; style?: CSSProperties; delay?: number; className?: string }) => (
  <motion.img src={src} alt={alt} className={className} draggable={false}
    style={{ width: '100%', height: '100%', objectFit: fit, objectPosition: position, display: 'block', ...style }}
    initial={{ opacity: 0, ...from }} animate={{ opacity: 1, ...to }} transition={{ opacity: { duration: 0.6, delay }, scale: { duration, ease: 'linear', delay }, x: { duration, ease: 'linear', delay }, y: { duration, ease: 'linear', delay } }} />
);

/** anything sliding in from an edge */
export const Slide = ({ children, delay = 0, from = 'bottom', distance = 60, duration = 0.7, style, className = '', rotate }:
  { children: ReactNode; delay?: number; from?: 'bottom' | 'top' | 'left' | 'right'; distance?: number; duration?: number; style?: CSSProperties; className?: string; rotate?: number }) => {
  const init = { bottom: { y: distance }, top: { y: -distance }, left: { x: -distance }, right: { x: distance } }[from];
  return (
    <motion.div className={className} style={style} initial={{ opacity: 0, rotate: rotate ?? 0, ...init }} animate={{ opacity: 1, x: 0, y: 0, rotate: rotate ?? 0 }} transition={{ delay, duration, ease: EASE }}>{children}</motion.div>
  );
};

/** a number counting up */
export const Counter = ({ to, prefix = '', suffix = '', duration = 1.5, delay = 0, decimals = 0, style, className = '' }:
  { to: number; prefix?: string; suffix?: string; duration?: number; delay?: number; decimals?: number; style?: CSSProperties; className?: string }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / (duration * 1000)));
      const e = 1 - Math.pow(1 - p, 3);
      setV(to * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, delay]);
  return <span className={className} style={style}>{prefix}{v.toFixed(decimals)}{suffix}</span>;
};

/** a phone-shaped device frame */
export const Device = ({ src, alt = '', width = 'clamp(120px, 18vw, 230px)', style, className = '' }: { src: string; alt?: string; width?: string; style?: CSSProperties; className?: string }) => (
  <div className={`phone ${className}`} style={{ width, ...style }}><img src={src} alt={alt} draggable={false} /></div>
);

/** a browser-shaped frame */
export const Browser = ({ src, alt = '', style, className = '', scrollTo = 0, duration = 6 }: { src: string; alt?: string; style?: CSSProperties; className?: string; scrollTo?: number; duration?: number }) => (
  <div className={`fig ${className}`} style={{ background: '#fff', boxShadow: '0 40px 80px -30px rgba(0,0,0,.6), 0 0 0 1px rgba(0,0,0,.08)', ...style }}>
    <div style={{ height: 22, background: '#f1f1f3', display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px' }}>
      {['#ff5f57', '#febc2e', '#28c840'].map(c => <i key={c} style={{ width: 7, height: 7, borderRadius: 4, background: c, display: 'block' }} />)}
    </div>
    <div style={{ overflow: 'hidden', position: 'relative', height: 'calc(100% - 22px)' }}>
      <motion.img src={src} alt={alt} draggable={false} style={{ width: '100%', display: 'block' }} initial={{ y: 0 }} animate={{ y: scrollTo ? `-${scrollTo}%` : 0 }} transition={{ duration, ease: 'linear', delay: 0.6 }} />
    </div>
  </div>
);

/** a silent looping clip (the ekai feature animations were GIFs; mp4 is a tenth of the weight) */
export const Clip = ({ src, style, className = '', fit = 'cover', position = 'center' }: { src: string; style?: CSSProperties; className?: string; fit?: 'cover' | 'contain'; position?: string }) => (
  <video src={src} className={className} autoPlay muted loop playsInline preload="metadata" aria-hidden
    style={{ width: '100%', height: '100%', objectFit: fit, objectPosition: position, display: 'block', ...style }} />
);

export const Mono = ({ children, color = 'rgba(255,255,255,.6)', style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <div className="kicker" style={{ color, ...style }}>{children}</div>
);
