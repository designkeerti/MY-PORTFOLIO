import { useLayoutEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { ExpoScaleEase } from 'gsap/EasePack';
import { PreviewPlayer } from '../previews/PreviewPlayer';
import { cbs } from '../content/cbs';

gsap.registerPlugin(ScrollTrigger, Flip, ExpoScaleEase);

const STAGE_W = 1280, STAGE_H = 960;

/**
 * The centre tile: the Cross Border Supps reel on a fixed 1280×960 stage, cover-fitted to whatever size the tile
 * is at this instant. The fit is written straight to the DOM, so the player never re-renders while the grid is scrubbed.
 */
const Reel = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scenes = useMemo(() => cbs.preview(), []);
  useLayoutEffect(() => {
    const box = boxRef.current, stage = stageRef.current; if (!box || !stage) return;
    const fit = () => {
      const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return;
      // letterboxed while it is a tile, full-bleed once it has grown to the viewport, blended in between
      const contain = Math.min(w / STAGE_W, h / STAGE_H), cover = Math.max(w / STAGE_W, h / STAGE_H);
      const f = Math.min(1, Math.max(0, (w / window.innerWidth - 0.4) / 0.55));
      const s = contain + (cover - contain) * f;
      stage.style.transform = `translate(${(w - STAGE_W * s) / 2}px, ${(h - STAGE_H * s) / 2}px) scale(${s})`;
    };
    const ro = new ResizeObserver(fit); ro.observe(box); fit();
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={boxRef} className="bento-reel">
      <div ref={stageRef} className="bento-reel__stage" style={{ width: STAGE_W, height: STAGE_H }}>
        <PreviewPlayer scenes={scenes} accent={cbs.meta.accent} />
      </div>
    </div>
  );
};

type Tile = { kind: 'video'; src: string; label: string } | { kind: 'img'; src: string; label: string } | { kind: 'reel' };

/** Slot order follows the bento's grid areas: 1, 4 and 6 are tall, 3 is the centre, the rest are wide. */
const tiles: Tile[] = [
  { kind: 'video', src: '/videos/1dark.mp4', label: 'A Rive button with a state machine' },
  { kind: 'img', src: '/work/ekai/poster.jpg', label: 'ekai' },
  { kind: 'reel' },
  { kind: 'video', src: '/videos/1light.mp4', label: 'Body profile flow' },
  { kind: 'img', src: '/work/misfits/poster.jpg', label: 'Misfits' },
  { kind: 'video', src: '/videos/2light.mp4', label: 'Meeting notes' },
  { kind: 'img', src: '/work/dmrc/poster.jpg', label: 'Delhi Metro' },
  { kind: 'video', src: '/videos/2dark.mp4', label: 'Cross Border Supps on a phone' },
];

const arrow = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);

/**
 * The scrubbed bento. Pinned for 1.7 screens of scroll: the grid Flips from a bento to three screen-wide columns, so
 * the centre tile (the CBS reel) grows until it fills the viewport; then the Cross Border Supps title card opens over it.
 */
export const BentoGallery = () => {
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
        const state = Flip.getState(items, { props: 'borderRadius' });
        grid.classList.remove('gallery--final');
        const flip = Flip.to(state, { simple: true, duration: 1, ease: 'expoScale(1, 5)', props: 'borderRadius' });
        const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'center center', end: '+=170%', scrub: 0.4, pin: wrap, anticipatePin: 1 } });
        tl.add(flip);
        // the reel dims as the title card opens over it, like a title over footage
        tl.to(grid.querySelector('.gallery__item--reel'), { filter: 'brightness(0.42)', duration: 0.35, ease: 'power1.inOut' }, '-=0.08');
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

  const blurb = cbs.meta.oneLiner.split(/(?<=\.)\s/)[0];

  return (
    <div ref={wrapRef} className="gallery-wrap">
      <div ref={gridRef} className="gallery gallery--bento" id="gallery-8">
        {tiles.map((t, i) => (
          <div key={i} className={`gallery__item${t.kind === 'reel' ? ' gallery__item--reel' : ''}`}>
            {t.kind === 'video' && <video src={t.src} muted loop autoPlay playsInline preload="auto" aria-label={t.label} />}
            {t.kind === 'img' && <img src={t.src} alt={t.label} loading="lazy" />}
            {t.kind === 'reel' && <Reel />}
          </div>
        ))}
      </div>

      <div ref={cardRef} className="bento-card" style={{ visibility: 'hidden' }}>
        <div className="bento-card__scrim" />
        <div className="bento-card__body">
          <div className="bento-card__kicker"><span aria-hidden="true">✨</span>Selected work · 01</div>
          <h2 className="bento-card__title">{cbs.meta.title}</h2>
          <p className="bento-card__blurb">{blurb}</p>
          {cbs.facts && <ul className="bento-card__facts" aria-label="Project facts">{cbs.facts.map(f => <li key={f}>{f}</li>)}</ul>}
          <Link to="/work/cbs" className="bento-card__cta">View case study{arrow}</Link>
        </div>
      </div>
    </div>
  );
};
