import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { ExpoScaleEase } from 'gsap/EasePack';

gsap.registerPlugin(ScrollTrigger, Flip, ExpoScaleEase);

type Tile = { src: string; alt: string; pos?: string };

/** Slot order follows the grid areas: 1, 4 and 6 are tall, 3 is the gate (the one that grows), the rest are wide. */
const tiles: Tile[] = [
  { src: '/world/cats-turf.jpg', alt: 'Two cats on a green lawn', pos: '50% 45%' },
  { src: '/world/bougainvillea-sky.jpg', alt: 'Bougainvillea against a summer sky', pos: '50% 52%' },
  { src: '/world/self-love.jpg', alt: 'A bookshop shelf with a self-love sign', pos: '50% 52%' },
  { src: '/world/metro.jpg', alt: 'Keerthi on a metro platform, smiling', pos: '50% 28%' },
  { src: '/world/cat-bench.jpg', alt: 'A cat perched on a wooden bench', pos: '50% 29%' },
  { src: '/world/poems-roses.jpg', alt: 'A book of poems with white roses', pos: '50% 48%' },
  { src: '/world/flowers-notebook.jpg', alt: 'Bougainvillea and a scarf on a notebook', pos: '50% 30%' },
  { src: '/world/kitten-hug.jpg', alt: 'Keerthi hugging a kitten', pos: '50% 40%' },
];

/**
 * The gateway: a scrubbed bento of pictures, pinned for 1.6 screens of scroll. The grid Flips from a bento to three
 * screen-wide columns, so the gate tile grows until it fills the viewport, holds there, and lets go.
 */
export const WorldGate = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current, grid = gridRef.current; if (!wrap || !grid) return;
    let ctx: gsap.Context | undefined;
    const build = () => {
      ctx?.revert();
      grid.classList.remove('gallery--final');
      ctx = gsap.context(() => {
        const items = grid.querySelectorAll('.gallery__item');
        // borrow the final layout for a moment to record where everything ends up
        grid.classList.add('gallery--final');
        const state = Flip.getState(items, { props: 'borderRadius,boxShadow' });
        grid.classList.remove('gallery--final');
        const flip = Flip.to(state, { simple: true, duration: 1, ease: 'expoScale(1, 5)', props: 'borderRadius,boxShadow' });
        const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'center center', end: '+=160%', scrub: 0.4, pin: wrap, anticipatePin: 1 } });
        tl.add(flip);
        tl.to({}, { duration: 0.45 }); // hold on the full-screen picture before the pin lets go
        return () => gsap.set(items, { clearProps: 'all' });
      }, wrap);
    };
    build();
    let t: number | undefined;
    const onResize = () => { window.clearTimeout(t); t = window.setTimeout(build, 150); };
    window.addEventListener('resize', onResize);
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => { window.removeEventListener('resize', onResize); window.clearTimeout(t); window.clearTimeout(refresh); ctx?.revert(); };
  }, []);

  return (
    <div ref={wrapRef} className="gallery-wrap">
      <div ref={gridRef} className="gallery gallery--bento" id="world-gate">
        {tiles.map((t, i) => (
          <div key={t.src} className={`gallery__item${i === 2 ? ' gallery__item--gate' : ''}`}>
            <img src={t.src} alt={t.alt} loading={i === 2 ? 'eager' : 'lazy'} style={t.pos ? { objectPosition: t.pos } : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
};
