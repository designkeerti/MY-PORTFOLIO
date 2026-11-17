import type { Block } from '../content/types';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CbsLive } from './CbsLive';

/** **bold** → <strong> */
const rich = (s: string): ReactNode => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p);

const Reveal = ({ children, className = '', style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) => (
  <motion.div className={className} style={style} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}>{children}</motion.div>
);

const widths = { text: 'max-w-[760px]', wide: 'max-w-[1100px]', full: 'max-w-[1400px]' } as const;

/** images, or silent looping clips for .mp4 sources */
const Media = ({ src, alt, style, ratio }: { src: string; alt: string; style?: React.CSSProperties; ratio?: string }) =>
  src.endsWith('.mp4')
    ? <video src={src} autoPlay muted loop playsInline preload="metadata" aria-label={alt} style={{ display: 'block', width: '100%', height: 'auto', ...style }} />
    : <img src={src} alt={alt} loading="lazy" style={{ ...(ratio ? { aspectRatio: ratio, width: '100%', height: 'auto', objectFit: 'cover' } : {}), ...style }} />;

export const BlockView = ({ b, accent }: { b: Block; accent: string }) => {
  switch (b.type) {
    case 'p': return <div className="cs-prose w-full max-w-[760px] mx-auto px-6"><p>{rich(b.text)}</p></div>;
    case 'lead': return <div className="w-full max-w-[760px] mx-auto px-6"><p className="text-[20px] md:text-[24px] leading-[1.45] font-medium tracking-[-0.01em] text-ink">{rich(b.text)}</p></div>;
    case 'h': return <div className="w-full max-w-[760px] mx-auto px-6 pt-4"><h3 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.015em] text-ink">{b.text}</h3></div>;
    case 'note': return <div className="w-full max-w-[760px] mx-auto px-6"><div className="cs-glass rounded-[18px] p-6 text-[15.5px] leading-relaxed text-ink/75"><span className="block mb-2 text-[12px] font-medium uppercase tracking-[0.2em]" style={{ color: accent }}>Note</span>{rich(b.text)}</div></div>;
    case 'quote': return (
      <div className="w-full max-w-[900px] mx-auto px-6">
        <Reveal><blockquote className="text-center text-[22px] md:text-[30px] font-semibold leading-[1.3] tracking-[-0.015em] text-ink">“{b.text}”{b.who && <footer className="mt-4 text-[13px] font-medium uppercase tracking-[0.2em] text-ink/45">{b.who}</footer>}</blockquote></Reveal>
      </div>
    );
    case 'list': return (
      <div className="w-full max-w-[760px] mx-auto px-6">
        <ol className="cs-steps flex flex-col">
          {b.items.map((it, i) => (
            <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
              <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium"
                style={{ borderColor: accent, color: accent, background: 'color-mix(in srgb, ' + accent + ' 10%, #fbfaf7)' }}>{i + 1}</span>
              <span className="pt-0.5 text-[16.5px] md:text-[17.5px] leading-relaxed text-ink/80">{rich(it)}</span>
            </li>
          ))}
        </ol>
      </div>
    );
    case 'stats': return (
      <div className="w-full max-w-[1000px] mx-auto px-6">
        <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {b.items.map(st => (
            <div key={st.l} className="cs-glass rounded-[18px] p-5 md:p-6">
              <div className="font-semibold tracking-[-0.03em] leading-none" style={{ fontSize: 'clamp(30px, 4vw, 48px)', color: accent }}>{st.n}</div>
              <div className="text-[13.5px] md:text-[14.5px] text-ink/60 mt-3 leading-snug">{st.l}</div>
            </div>
          ))}
        </Reveal>
      </div>
    );
    case 'cards': return (
      <div className="w-full max-w-[1000px] mx-auto px-6">
        <div className={`grid gap-3 ${b.cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {b.items.map((c, i) => (
            <Reveal key={i} className="cs-glass rounded-[18px] p-6">
              {c.kicker && <div className="mb-3 text-[12px] font-medium uppercase tracking-[0.2em]" style={{ color: accent }}>{c.kicker}</div>}
              <h4 className="text-[18px] md:text-[19px] font-semibold tracking-[-0.01em] text-ink mb-1.5">{c.title}</h4>
              <p className="text-[15px] leading-relaxed text-ink/60">{rich(c.text)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    );
    case 'img': return (
      <figure className={`w-full ${widths[b.size ?? 'wide']} mx-auto px-6`}>
        <Reveal>
          <div className="fig" style={{ background: b.bg, padding: b.pad ? 'clamp(16px, 4vw, 48px)' : 0 }}>
            <Media src={b.src} alt={b.alt} ratio={b.ratio} style={b.pad ? { borderRadius: 12 } : undefined} />
          </div>
          {b.caption && <figcaption className="text-[14px] text-ink/50 mt-3 max-w-[70ch]">{b.caption}</figcaption>}
        </Reveal>
      </figure>
    );
    case 'grid': {
      const cols = b.cols ?? 3;
      const cls = cols === 2 ? 'md:grid-cols-2' : cols === 4 ? 'grid-cols-2 md:grid-cols-4' : 'md:grid-cols-3';
      return (
        <figure className="w-full max-w-[1100px] mx-auto px-6">
          <Reveal>
            <div className={`rounded-[22px] ${b.bg ? 'p-6 md:p-10' : ''}`} style={{ background: b.bg }}>
              <div className={`grid gap-4 md:gap-6 ${cls} ${b.phone ? 'items-end' : ''}`}>
                {b.images.map((im, i) => (
                  <div key={i} className={b.phone ? 'flex flex-col items-center gap-3' : ''}>
                    <div className={b.phone ? 'phone w-full max-w-[260px]' : 'fig'}><Media src={im.src} alt={im.alt} ratio={im.ratio} /></div>
                    {im.caption && <div className={`text-[13.5px] mt-2 leading-snug text-ink/55 ${b.bg ? 'text-center' : ''}`}>{im.caption}</div>}
                  </div>
                ))}
              </div>
            </div>
            {b.caption && <figcaption className="text-[14px] text-ink/50 mt-3 max-w-[70ch]">{b.caption}</figcaption>}
          </Reveal>
        </figure>
      );
    }
    case 'live': return <div className="w-full"><CbsLive id={b.id} /></div>;
  }
};
