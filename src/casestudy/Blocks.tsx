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
const Media = ({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) =>
  src.endsWith('.mp4')
    ? <video src={src} autoPlay muted loop playsInline preload="metadata" aria-label={alt} style={{ display: 'block', width: '100%', height: 'auto', ...style }} />
    : <img src={src} alt={alt} loading="lazy" style={style} />;

export const BlockView = ({ b, accent }: { b: Block; accent: string }) => {
  switch (b.type) {
    case 'p': return <div className="cs-prose w-full max-w-[760px] mx-auto px-6"><p>{rich(b.text)}</p></div>;
    case 'lead': return <div className="w-full max-w-[860px] mx-auto px-6"><p className="text-[20px] md:text-[25px] leading-[1.45] font-medium tracking-[-0.01em] text-[#111]">{rich(b.text)}</p></div>;
    case 'h': return <div className="w-full max-w-[760px] mx-auto px-6 pt-6"><h3 className="text-[24px] md:text-[30px] font-bold tracking-[-0.02em] text-[#111]">{b.text}</h3></div>;
    case 'note': return <div className="w-full max-w-[760px] mx-auto px-6"><div className="rounded-2xl border border-black/10 bg-[#fafafa] p-6 text-[15.5px] leading-relaxed text-[#444]"><span className="kicker block mb-2" style={{ color: accent }}>Note</span>{rich(b.text)}</div></div>;
    case 'quote': return (
      <div className="w-full max-w-[900px] mx-auto px-6">
        <Reveal><blockquote className="text-[22px] md:text-[32px] font-bold leading-[1.25] tracking-[-0.02em] text-[#111] border-l-4 pl-6 md:pl-8" style={{ borderColor: accent }}>{b.text}{b.who && <footer className="kicker mt-4 text-[#777]">{b.who}</footer>}</blockquote></Reveal>
      </div>
    );
    case 'list': return (
      <div className="w-full max-w-[760px] mx-auto px-6">
        <ul className="flex flex-col gap-3">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-4 items-start text-[17px] md:text-[18px] leading-relaxed text-[#333]">
              <span className="kicker mt-[7px] shrink-0" style={{ color: accent }}>{String(i + 1).padStart(2, '0')}</span><span>{rich(it)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
    case 'stats': return (
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <Reveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {b.items.map(s => (
            <div key={s.l} className="rounded-2xl bg-[#f6f6f8] p-6 md:p-7">
              <div className="font-black tracking-[-0.04em] leading-none" style={{ fontSize: 'clamp(34px, 4.6vw, 60px)', color: accent }}>{s.n}</div>
              <div className="text-[13.5px] md:text-[14.5px] text-[#555] mt-3 leading-snug">{s.l}</div>
            </div>
          ))}
        </Reveal>
      </div>
    );
    case 'cards': return (
      <div className="w-full max-w-[1100px] mx-auto px-6">
        <div className={`grid gap-4 ${b.cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {b.items.map((c, i) => (
            <Reveal key={i} className="rounded-2xl border border-black/[.07] bg-white p-6 md:p-7 shadow-[0_20px_50px_-40px_rgba(0,0,0,.35)]">
              {c.kicker && <div className="kicker mb-3" style={{ color: accent }}>{c.kicker}</div>}
              <h4 className="text-[19px] md:text-[21px] font-bold tracking-[-0.015em] text-[#111] mb-2">{c.title}</h4>
              <p className="text-[15px] md:text-[16px] leading-relaxed text-[#555]">{rich(c.text)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    );
    case 'img': return (
      <figure className={`w-full ${widths[b.size ?? 'wide']} mx-auto px-6`}>
        <Reveal>
          <div className="fig" style={{ background: b.bg, padding: b.pad ? 'clamp(16px, 4vw, 48px)' : 0 }}>
            <Media src={b.src} alt={b.alt} style={b.pad ? { borderRadius: 12 } : undefined} />
          </div>
          {b.caption && <figcaption className="text-[14px] text-[#666] mt-3 max-w-[70ch]">{b.caption}</figcaption>}
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
                    <div className={b.phone ? 'phone w-full max-w-[260px]' : 'fig'}><Media src={im.src} alt={im.alt} /></div>
                    {im.caption && <div className={`text-[13.5px] mt-2 leading-snug ${b.bg ? 'text-white/70 text-center' : 'text-[#666]'}`}>{im.caption}</div>}
                  </div>
                ))}
              </div>
            </div>
            {b.caption && <figcaption className="text-[14px] text-[#666] mt-3 max-w-[70ch]">{b.caption}</figcaption>}
          </Reveal>
        </figure>
      );
    }
    case 'live': return <CbsLive id={b.id} />;
  }
};
