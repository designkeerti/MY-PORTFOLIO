import { useEffect, useRef, type ReactNode } from 'react';

/**
 * A tilted ring of the work, slowly turning around the body in real 3D.
 *
 * The portrait (children) is a plane inside the same 3D scene as the ring,
 * so the browser depth-sorts them: clips passing behind are hidden by the
 * body, clips in front cross the chest. The ring sits low (round the chest
 * and shoulders) so the face stays clear. Each clip is a two-sided panel:
 * the work on the front, plain glass on the back, so turned-away panels read
 * as solid objects rather than mirrored stickers.
 *
 * Sized from the CSS variable --stage-w set by the parent. Turns only while
 * on screen; still under reduced motion.
 */

export type OrbitClip = { src: string; poster: string; label: string };

type Props = {
  clips: OrbitClip[];
  /** ring centre, as fractions of the stage's width / height */
  centre: [number, number];
  shown: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/** Ring radius (fraction of --stage-w) and tilt. */
export const ORBIT = { radius: 0.74, tiltX: -11, tiltZ: -7 };

export function WorkOrbit({ clips, centre, shown, children, className, style }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    const root = rootRef.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n = clips.length;
    let raf = 0, last = performance.now(), angle = 24, visible = true, appear = reduce ? 1 : 0, t0 = 0;

    const io = new IntersectionObserver(es => {
      visible = es.some(e => e.isIntersecting);
      root.querySelectorAll('video').forEach(v => { if (visible && !reduce) v.play().catch(() => {}); else v.pause(); });
    }, { threshold: 0.05 });
    io.observe(root);

    function place() {
      for (let i = 0; i < n; i++) {
        const el = panels.current[i];
        if (!el) continue;
        const a = (i * 360) / n + angle;
        const r = (a * Math.PI) / 180;
        const facing = Math.cos(r);                          // 1 = front of the ring, -1 = behind the body
        el.style.transform = `rotateY(${a.toFixed(2)}deg) translateZ(calc(var(--stage-w) * ${ORBIT.radius}))`;
        // a little depth of field on the far side; everything resolves out of a blur on load
        // (set on the two faces, not the panel: opacity or filter on a 3D parent would flatten it)
        const far = Math.max(0, -facing);
        const op = (appear * (1 - far * 0.35)).toFixed(3);
        const blur = (1 - appear) * 14 + far * 2.5;
        for (const face of Array.from(el.children) as HTMLElement[]) {
          face.style.opacity = op;
          face.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : 'none';
        }
      }
    }

    function frame(now: number) {
      const dt = Math.min(64, now - last); last = now;
      if (shownRef.current && appear < 1) { if (!t0) t0 = now; appear = Math.min(1, (now - t0) / 1200); }
      if (visible && !document.hidden) {
        if (!reduce) angle = (angle + dt * 0.0072) % 360;      // one turn in ~50s
        place();
      }
      raf = requestAnimationFrame(frame);
    }
    place();
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [clips.length]);

  return (
    <div ref={rootRef} className={className} style={{ ...style, perspective: '1500px', perspectiveOrigin: `50% ${centre[1] * 100 - 20}%` }}>
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {/* the portrait: a plane at depth 0 in the same 3D space as the ring */}
        <div className="absolute inset-0" style={{ transform: 'translateZ(0)' }}>{children}</div>

        {/* the ring, centred on the chest and tilted */}
        <div
          className="pointer-events-none absolute h-0 w-0"
          style={{
            left: `${centre[0] * 100}%`, top: `${centre[1] * 100}%`, transformStyle: 'preserve-3d',
            transform: `rotateZ(${ORBIT.tiltZ}deg) rotateX(${ORBIT.tiltX}deg)`,
          }}
          role="group" aria-label="Recent work"
        >
          {clips.map((c, i) => (
            <div
              key={c.src}
              ref={el => { panels.current[i] = el; }}
              className="absolute"
              style={{
                width: 'calc(var(--stage-w) * 0.42)', height: 'calc(var(--stage-w) * 0.2625)',
                left: 'calc(var(--stage-w) * -0.21)', top: 'calc(var(--stage-w) * -0.13125)',
                transformStyle: 'preserve-3d', willChange: 'transform',
              }}
            >
              {/* front: the work */}
              <div className="absolute inset-0 overflow-hidden rounded-[6px] border border-white/70 bg-white shadow-[0_16px_34px_-16px_rgba(15,30,55,0.55)]" style={{ backfaceVisibility: 'hidden', opacity: 0 }}>
                <video src={c.src} poster={c.poster} muted loop playsInline preload="metadata" aria-label={c.label} className="h-full w-full object-cover" />
              </div>
              {/* back: plain glass */}
              <div className="absolute inset-0 rounded-[6px] border border-white/70 bg-gradient-to-br from-white/80 to-white/45" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', opacity: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
