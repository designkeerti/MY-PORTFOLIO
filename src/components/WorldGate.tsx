import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { ExpoScaleEase } from 'gsap/EasePack';

gsap.registerPlugin(ScrollTrigger, Flip, ExpoScaleEase);

type Tile = { kind: 'photo'; src: string; alt: string; pos?: string } | { kind: 'word'; text: string; tone: 'ink' | 'glow' };

/** Slot order follows the grid areas: 1, 4 and 6 are tall, 3 is the gate (the one that grows), the rest are wide. */
const tiles: Tile[] = [
  { kind: 'photo', src: '/world/cat-1.jpg', alt: 'Keerthi laughing with a cat on his shoulder' },
  { kind: 'word', text: 'My world', tone: 'ink' },
  { kind: 'photo', src: '/world/metro.jpg', alt: 'Keerthi on a metro platform, smiling', pos: '50% 22%' },
  { kind: 'photo', src: '/world/cat-2.jpg', alt: 'Keerthi hugging a kitten' },
  { kind: 'photo', src: '/world/sleeping.jpg', alt: 'Illustration of Keerthi fast asleep', pos: '50% 45%' },
  { kind: 'photo', src: '/world/holding-cat.jpg', alt: 'Illustration of Keerthi holding a cat', pos: '50% 30%' },
  { kind: 'photo', src: '/world/reading.jpg', alt: 'Illustration of Keerthi reading', pos: '50% 35%' },
  { kind: 'word', text: 'I want to be rich enough to feed every animal 🐱 around me', tone: 'glow' },
];

/**
 * The gateway: a scrubbed bento of pictures, pinned for 1.7 screens of scroll. The grid Flips from a bento to three
 * screen-wide columns, so the gate tile grows until it fills the viewport; then the welcome card opens over it.
 */
export const WorldGate = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current, grid = gridRef.current, card = cardRef.current; if (!wrap || !grid || !card) return;
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
        const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'center center', end: '+=170%', scrub: 0.4, pin: wrap, anticipatePin: 1 } });
        tl.add(flip);
        // the picture dims as the welcome card opens over it
        tl.to(grid.querySelector('.gallery__item--gate'), { filter: 'brightness(0.5)', duration: 0.35, ease: 'power1.inOut' }, '-=0.08');
        tl.fromTo(card, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<');
        tl.to({}, { duration: 0.35 }); // hold, so the card sits fully open before the pin lets go
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
          <div key={i} className={`gallery__item${i === 2 ? ' gallery__item--gate' : ''}`}>
            {t.kind === 'photo'
              ? <img src={t.src} alt={t.alt} loading={i === 2 ? 'eager' : 'lazy'} style={t.pos ? { objectPosition: t.pos } : undefined} />
              : <div className={`world-word world-word--${t.tone}`}>{t.tone === 'ink' ? <b>{t.text}</b> : <span>{t.text}</span>}</div>}
          </div>
        ))}
      </div>

      <div ref={cardRef} className="bento-card bento-card--world" style={{ visibility: 'hidden' }}>
        <div className="bento-card__scrim" />
        <div className="bento-card__body">
          <div className="bento-card__kicker"><span aria-hidden="true">✨</span>My world</div>
          <h2 className="bento-card__title">Welcome to my world.</h2>
          <p className="bento-card__blurb">Designing with purpose, heart, &amp; rhythm. Off the clock: a ball, a notebook, a half-read novel, and every cat within reach.</p>
          <ul className="bento-card__facts" aria-label="Off the clock">{['Basketball', 'Poetry', 'Novels', 'Cats'].map(f => <li key={f}>{f}</li>)}</ul>
          <div className="bento-card__hint">Scroll on <span aria-hidden="true">↓</span></div>
        </div>
      </div>
    </div>
  );
};
