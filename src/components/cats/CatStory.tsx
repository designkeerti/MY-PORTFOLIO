import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { pose } from './rig';
import { build, fetchArt, place } from './actor';
import { BACK, BACK_SCALE, BOWLS, FRONT, HEAP, K, LOOP, SITTERS, SLEEPER, WALKERS, kibble, sitterPose, sleeperPose, walkerPose, walkerState } from './story';

/**
 * The quote card's scene: nine rigged cats and two bowls, playing the story in ./story on a
 * loop. The drawings (public/about/cats) are fetched once the card is near, rigged in place,
 * then posed every frame. The story starts from the beginning the first time it is seen,
 * and only runs while the card is on screen. With reduced motion it holds one still frame.
 */

export function CatStory({ className = '' }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const near = useInView(wrap, { once: true, margin: '400px 0px' });
  const reduce = !!useReducedMotion();
  const back = useRef<SVGGElement>(null), walk = useRef<SVGGElement>(null), front = useRef<SVGGElement>(null);
  const pieces = useRef<(SVGCircleElement | null)[][]>([[], []]);
  const [ready, setReady] = useState(false);
  // phones: a tighter window on the middle of the stage, so the cats read larger
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const set = () => setNarrow(mq.matches);
    set(); mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  useEffect(() => {
    if (!near) return;
    let alive = true, raf = 0, last = 0, t = 0, onScreen = false;
    const uid = `cs${Math.random().toString(36).slice(2, 7)}`;
    const layersUsed = [back.current!, walk.current!, front.current!];
    let io: IntersectionObserver | undefined;
    let kick = () => {};
    const onVis = () => kick();
    document.addEventListener('visibilitychange', onVis);

    (async () => {
      const names = [...SITTERS.map(c => c.name), ...WALKERS.map(w => w.name), SLEEPER.name];
      const art = await Promise.all(names.map(fetchArt));
      if (!alive) return;
      const sitters = SITTERS.map((c, i) => build(c.name, art[i], back.current!, uid));
      const walkers = WALKERS.map((w, i) => build(w.name, art[SITTERS.length + i], walk.current!, uid));
      const sleeper = build(SLEEPER.name, art[art.length - 1], front.current!, uid);

      const draw = (time: number) => {
        SITTERS.forEach((c, i) => { place(sitters[i], c.x, BACK, 1, K * BACK_SCALE); pose(sitters[i].r, sitterPose(c, time)); });
        WALKERS.forEach((w, i) => {
          const s = walkerState(w, time);
          walkers[i].root.style.display = s.on ? '' : 'none';
          if (!s.on) return;
          place(walkers[i], s.x, FRONT, s.sx, K);
          pose(walkers[i].r, walkerPose(w, s, time));
        });
        place(sleeper, SLEEPER.x, FRONT + 6, 1, K * SLEEPER.scale);
        pose(sleeper.r, sleeperPose(time, SLEEPER.seed));
        pieces.current.forEach((row, b) => row.forEach((el, i) => {
          if (!el) return;
          const k = kibble(b, i, time);
          if (!k) { el.setAttribute('r', '0'); return; }
          el.setAttribute('cx', k.x.toFixed(1)); el.setAttribute('cy', k.y.toFixed(1));
          el.setAttribute('r', k.r.toFixed(2)); el.setAttribute('opacity', k.o.toFixed(2));
        }));
      };

      setReady(true);
      if (reduce) { draw(10.5); return; }   // one still frame: everyone at the bowls
      // dev: ?catT=12 holds the story at that second, for looking at one beat
      const hold = import.meta.env.DEV ? parseFloat(new URLSearchParams(location.search).get('catT') ?? '') : NaN;
      if (Number.isFinite(hold)) { draw(hold); return; }
      draw(0);
      const loop = (now: number) => {
        raf = 0;
        if (!onScreen || document.hidden) { last = 0; return; }
        if (last) t = (t + Math.min(0.1, (now - last) / 1000)) % LOOP;
        last = now;
        draw(t);
        raf = requestAnimationFrame(loop);
      };
      kick = () => { if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(loop); };
      io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); }, { threshold: 0 });
      io.observe(wrap.current!);
    })();

    return () => {
      alive = false; cancelAnimationFrame(raf); io?.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      layersUsed.forEach(l => { while (l.firstChild) l.removeChild(l.firstChild); });
    };
  }, [near, reduce]);

  return (
    <div ref={wrap} aria-hidden className={`pointer-events-none relative ${className}`}>
      <svg viewBox={narrow ? '60 0 880 345' : '0 0 1000 345'} preserveAspectRatio="xMidYMax meet" overflow="visible"
        className="absolute inset-x-0 bottom-0 h-full w-full transition-opacity duration-500" style={{ opacity: ready ? 1 : 0 }}>
        <g ref={back} />
        <g ref={walk} />
        {BOWLS.map((x, b) => (
          <g key={x} transform={`translate(${x} ${FRONT})`}>
            <ellipse cx="0" cy="3" rx="72" ry="8" fill="#17191e" opacity="0.1" />
            <g transform="translate(0 -42)">
              {HEAP.map((_, i) => (
                <circle key={i} ref={el => { pieces.current[b][i] = el; }} r="0" fill={i % 3 ? '#8a5a3b' : '#a8714c'} />
              ))}
            </g>
            <g transform="scale(1.4)">
              <path d="M-46 -26h92l-8 22c-1.5 4-4.5 6-9 6h-58c-4.5 0-7.5-2-9-6Z" fill="#d9734e" />
              <path d="M-48 -30h96a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-96a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3Z" fill="#ee9472" />
              <path d="M-30 -14h60" stroke="#f3b49b" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            </g>
          </g>
        ))}
        <g ref={front} />
      </svg>
    </div>
  );
}
