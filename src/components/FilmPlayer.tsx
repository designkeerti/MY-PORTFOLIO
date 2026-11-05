import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * The narrated film of a case study: a button that says how long it is, and a player
 * with captions on and the chapters underneath to jump between. Files are made by
 * scripts/films/build.mjs into /films/{slug}.mp4 (+ .vtt, .jpg, .json).
 */

export type FilmInfo = { duration: number; chapters: { t: number; label: string }[] };

const cache = new Map<string, Promise<FilmInfo | null>>();
const load = (slug: string) => {
  if (!cache.has(slug)) cache.set(slug, fetch(`/films/${slug}.json`).then(r => (r.ok ? r.json() : null)).catch(() => null));
  return cache.get(slug)!;
};

/** the film's details, or null while loading or when this case study has no film */
export function useFilm(slug: string) {
  const [info, setInfo] = useState<FilmInfo | null>(null);
  useEffect(() => { let on = true; setInfo(null); load(slug).then(i => on && setInfo(i)); return () => { on = false; }; }, [slug]);
  return info;
}

/** dark text on light accents, white on deep ones */
export const onAccent = (hex: string) => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150 ? '#17191e' : '#ffffff';
};

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export const PlayGlyph = ({ className = 'h-3.5 w-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.4-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z" fill="currentColor" /></svg>
);

export function FilmPlayer({ slug, info, company, accent, open, onClose }:
  { slug: string; info: FilmInfo; company: string; accent: string; open: boolean; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const current = info.chapters.reduce((k, c, i) => (now >= c.t - 0.05 ? i : k), 0);
  const seek = (t: number) => { const v = video.current; if (!v) return; v.currentTime = t + 0.01; v.play().catch(() => {}); };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="film" role="dialog" aria-modal="true" aria-label={`${company} case study, video`}
          className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-[#0b0d12] px-3 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] md:px-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          onClick={onClose}>
          <motion.div className="relative w-full max-w-[1120px]" onClick={e => e.stopPropagation()}
            initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: 0.98 }} transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}>
            <div className="mb-3 flex items-center justify-between gap-4 text-white">
              <p className="min-w-0 truncate text-[13px] font-medium uppercase tracking-[0.2em] text-white/60">
                Case study · <span className="text-white">{company}</span> · {mmss(info.duration)}
              </p>
              <button type="button" onClick={onClose} aria-label="Close the video"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <video ref={video} className="film-video aspect-video w-full rounded-[16px] bg-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] md:rounded-[20px]"
              src={`/films/${slug}.mp4`} poster={`/films/${slug}.jpg`} controls autoPlay playsInline preload="metadata" crossOrigin="anonymous"
              onTimeUpdate={e => setNow(e.currentTarget.currentTime)}>
              <track kind="captions" src={`/films/${slug}.vtt`} srcLang="en" label="English" default />
            </video>
            <nav aria-label="Chapters" className="-mx-3 mt-3 overflow-x-auto px-3 [scrollbar-width:none] md:mx-0 md:px-0">
              <ol className="flex gap-2 md:flex-wrap">
                {info.chapters.map((c, i) => (
                  <li key={c.t} className="shrink-0">
                    <button type="button" onClick={() => seek(c.t)} aria-current={i === current ? 'step' : undefined}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${i === current ? 'border-transparent' : 'border-white/15 text-white/70 hover:bg-white/10 hover:text-white'}`}
                      style={i === current ? { background: accent, color: onAccent(accent) } : undefined}>
                      <span className="tabular-nums opacity-70">{mmss(c.t)}</span>{c.label}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
