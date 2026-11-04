import { useEffect, useRef } from 'react';

/**
 * The portrait with a ring of panels orbiting the head: videos of the work
 * and photos of the cats. Real CSS 3D: the portrait and the ring share one
 * 3D space, so panels behind the head are hidden by it and panels in front
 * cross over it. The ring turns slowly; the pointer tilts the whole stage a
 * little, for depth. Videos only play while the stage is on screen.
 */

export type OrbitItem = { kind: 'video' | 'image'; src: string; alt: string };

type Props = {
  portrait: string;
  portraitAlt: string;
  /** portrait's natural aspect ratio, width / height */
  aspect: number;
  /** where the head is in the portrait (0..1 of its width / height): the ring's centre */
  head: [number, number];
  items: OrbitItem[];
  /** ring radius and panel size, as fractions of the portrait's width */
  radius?: number;
  panel?: [number, number];
  className?: string;
  shown: boolean;
};

export function OrbitStage({ portrait, portraitAlt, aspect, head, items, radius = 0.5, panel = [0.27, 0.19], className, shown }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current!, tilt = tiltRef.current!, ring = ringRef.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, angle = 0, last = performance.now(), visible = true;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    };
    const vids = () => [...stage.querySelectorAll('video')];
    const io = new IntersectionObserver(es => {
      visible = es.some(e => e.isIntersecting);
      vids().forEach(v => { if (visible && !reduce) v.play().catch(() => {}); else v.pause(); });
    }, { threshold: 0.05 });
    io.observe(stage);

    function frame(now: number) {
      const dt = Math.min(64, now - last); last = now;
      if (visible && !document.hidden) {
        if (!reduce) angle = (angle + dt * 0.006) % 360;       // a full turn in a minute
        cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
        tilt.style.transform = `rotateY(${cx * 6}deg) rotateX(${-cy * 4}deg)`;
        ring.style.transform = `rotateX(-9deg) rotateZ(-6deg) rotateY(${angle}deg)`;
      }
      raf = requestAnimationFrame(frame);
    }
    if (!reduce) window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('pointermove', onMove); };
  }, []);

  const n = items.length;
  // Sizes come from the CSS variable --stage-w (set by the parent), so the
  // ring, panels and portrait all scale together.
  return (
    <div
      ref={stageRef}
      className={className}
      style={{ perspective: '1600px', width: 'var(--stage-w)', height: `calc(var(--stage-w) / ${aspect})` }}
    >
      <div ref={tiltRef} className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
        {/* the portrait: a flat plane at depth 0 in the same 3D space as the ring */}
        <img
          src={portrait}
          alt={portraitAlt}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none transition-[opacity,transform] duration-[1200ms] ease-out"
          style={{
            transform: `translate3d(0, ${shown ? 0 : 40}px, 0)`, opacity: shown ? 1 : 0,
            // the photo's bottom edge dissolves into the cloud bank in front of it
            WebkitMaskImage: 'linear-gradient(to bottom, #000 78%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, #000 78%, transparent 100%)',
          }}
        />
        {/* the ring, centred on the head */}
        <div
          className="pointer-events-none absolute"
          style={{ left: `${head[0] * 100}%`, top: `${head[1] * 100}%`, transformStyle: 'preserve-3d', width: 0, height: 0 }}
        >
          <div ref={ringRef} style={{ transformStyle: 'preserve-3d', transition: 'opacity 1.2s ease', opacity: shown ? 1 : 0 }}>
            {items.map((it, i) => (
              <div
                key={it.src}
                className="absolute overflow-hidden rounded-xl border border-white/60 bg-white/40 shadow-[0_12px_30px_-12px_rgba(20,40,70,0.5)]"
                style={{
                  width: `calc(var(--stage-w) * ${panel[0]})`,
                  height: `calc(var(--stage-w) * ${panel[1]})`,
                  left: `calc(var(--stage-w) * ${-panel[0] / 2})`,
                  top: `calc(var(--stage-w) * ${-panel[1] / 2})`,
                  transform: `rotateY(${(i * 360) / n}deg) translateZ(calc(var(--stage-w) * ${radius}))`,
                }}
              >
                {it.kind === 'video'
                  ? <video src={it.src} muted loop playsInline preload="auto" aria-label={it.alt} className="h-full w-full object-cover" />
                  : <img src={it.src} alt={it.alt} draggable={false} className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
