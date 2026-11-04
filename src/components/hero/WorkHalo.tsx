import { useEffect, useRef } from 'react';

/**
 * A still, curved band of the work around the head: short looping clips of
 * real projects, set in 3D on an arc that wraps behind the head and leaves
 * the face clear. Nothing orbits; on load the panels resolve one by one out
 * of a blur. Clips only play while the hero is on screen.
 *
 * Sized from the CSS variable --stage-w set by the parent.
 */

export type HaloClip = { src: string; poster: string; label: string };

// angle around the head (0 = facing you; the face sits at 0, so nothing goes near it),
// and height relative to the eyes, as a fraction of --stage-w
// A wide arc at eye level: three panels each side of the face, spreading outwards,
// each turned a little more (ry) and set a little smaller (k), so the strip reads as
// curving round the head without stacking up. x, y are offsets from the head centre,
// as fractions of --stage-w (y rises slightly towards the outside).
const SLOTS: { x: number; y: number; ry: number; k: number }[] = [
  { x: -0.42, y: 0.03, ry: -16, k: 1 }, { x: 0.42, y: 0.03, ry: 16, k: 1 },
  { x: -0.68, y: -0.01, ry: -26, k: 0.94 }, { x: 0.68, y: -0.01, ry: 26, k: 0.94 },
  { x: -0.92, y: -0.06, ry: -36, k: 0.88 }, { x: 0.92, y: -0.06, ry: 36, k: 0.88 },
];

export function WorkHalo({ clips, head, shown, className }: { clips: HaloClip[]; head: [number, number]; shown: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // play only while on screen
  useEffect(() => {
    const el = ref.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(es => {
      const on = es.some(e => e.isIntersecting) && !reduce;
      el.querySelectorAll('video').forEach(v => { if (on) v.play().catch(() => {}); else v.pause(); });
    }, { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ perspective: '1400px', perspectiveOrigin: `${head[0] * 100}% ${head[1] * 100}%` }} role="group" aria-label="Recent work">
      {/* the band's centre sits on the head; a slight tilt makes it read as a curve */}
      <div className="absolute h-0 w-0" style={{ left: `${head[0] * 100}%`, top: `${head[1] * 100}%`, transformStyle: 'preserve-3d', transform: 'rotateZ(-6deg)' }}>
        {clips.slice(0, SLOTS.length).map((c, i) => {
          const { x, y, ry, k } = SLOTS[i];
          const away = Math.abs(x) > 0.8;                      // the outermost pair: a touch softer
          return (
            <figure
              key={c.src}
              className="absolute m-0 overflow-hidden rounded-[6px] border border-white/70 bg-white shadow-[0_16px_34px_-16px_rgba(15,30,55,0.55)]"
              style={{
                width: 'calc(var(--stage-w) * 0.27)', height: 'calc(var(--stage-w) * 0.18)',
                left: `calc(var(--stage-w) * ${(x - 0.135).toFixed(3)})`, top: `calc(var(--stage-w) * ${(y - 0.09).toFixed(3)})`,
                transform: `rotateY(${ry}deg) scale(${k})`,
                opacity: shown ? (away ? 0.85 : 1) : 0,
                filter: shown ? (away ? 'blur(0.6px)' : 'blur(0)') : 'blur(14px)',
                transition: `opacity 900ms ease ${200 + i * 140}ms, filter 900ms ease ${200 + i * 140}ms`,
              }}
            >
              <video src={c.src} poster={c.poster} muted loop playsInline preload="metadata" aria-label={c.label} className="h-full w-full object-cover" />
            </figure>
          );
        })}
      </div>
    </div>
  );
}
