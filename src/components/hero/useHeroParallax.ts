import { useEffect, type RefObject } from 'react';

/**
 * Pointer parallax for the hero. While the pointer is over the hero, sets two
 * CSS variables on <html>, --px and --py (each -1..1, eased), which layers turn
 * into movement with the `translate` property, each by its own amount, so
 * nearer things move more (see `depth`). Off on touch screens and under
 * reduced motion. Eases back to rest when the pointer leaves.
 */
export function useHeroParallax(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement.style;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const tick = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      root.setProperty('--px', x.toFixed(4));
      root.setProperty('--py', y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      kick();
    };
    const onLeave = () => { tx = 0; ty = 0; kick(); };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      root.removeProperty('--px'); root.removeProperty('--py');
    };
  }, [ref]);
}

/**
 * A layer's parallax, as a `translate` value. Positive depth moves with the
 * pointer (near), negative against it (far). Uses the individual `translate`
 * property, so it adds to any existing transform (rotations, animations).
 */
export const depth = (px: number, py = px * 0.6) =>
  `calc(var(--px, 0) * ${px}px) calc(var(--py, 0) * ${py}px)`;
