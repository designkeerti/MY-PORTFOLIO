import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import type { Scene } from './types';

/** Every scene is composed at this width, then scaled to whatever the frame is. */
const DESIGN_W = 1280;

export type PlayerHandle = { jump: (i: number) => void; toggle: () => void; next: () => void; prev: () => void };
export type PlayerState = { idx: number; count: number; paused: boolean; caption?: string };

type Props = {
  scenes: Scene[];
  accent?: string;
  /** loop forever (thumbnails) or stop on the last scene */
  loop?: boolean;
  className?: string;
  /** hide the caption strip */
  bare?: boolean;
  /** hide the in-frame progress segments (a transport bar outside the frame shows them instead) */
  chromeless?: boolean;
  /** scene or pause changes, for an external transport bar */
  onState?: (s: PlayerState) => void;
  /** progress of the current scene, 0..1, every frame; write it to the DOM, do not set state with it */
  onTick?: (t: number) => void;
  /** the last scene finished (only when not looping) */
  onEnd?: () => void;
};

/**
 * An animated project preview: a timed sequence of scenes built from the real product.
 * Plays when at least half of it is on screen, pauses when it scrolls away, click to hold.
 * Under prefers-reduced-motion it simply shows the last scene and never animates.
 */
export const PreviewPlayer = forwardRef<PlayerHandle, Props>(({ scenes, accent = '#DF95FF', loop = true, className = '', bare = false, chromeless = false, onState, onTick, onEnd }, ref) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { amount: 0.4 });
  const reduce = useReducedMotion();

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const elapsedRef = useRef(0);
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const scene = scenes[Math.min(idx, scenes.length - 1)];
  const scale = box.w ? box.w / DESIGN_W : 1;
  const stageH = box.w ? Math.round(DESIGN_W * (box.h / box.w)) : 960;
  const playing = started && inView && !paused && !stopped && !reduce;

  useEffect(() => { if (reduce) { setIdx(scenes.length - 1); setStopped(true); } }, [reduce, scenes.length]);
  useEffect(() => { if (inView && !started) setStarted(true); }, [inView, started]);
  useEffect(() => { onState?.({ idx, count: scenes.length, paused, caption: scene?.caption }); }, [idx, paused, scenes.length, scene, onState]);

  // measure the frame so the stage can be scaled into it
  useEffect(() => {
    const el = frameRef.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const paint = useCallback((i: number, t: number) => {
    barRefs.current.forEach((b, k) => {
      if (!b) return;
      b.style.width = k < i ? '100%' : k === i ? `${Math.min(100, t * 100)}%` : '0%';
    });
    onTick?.(Math.min(1, t));
  }, [onTick]);

  useEffect(() => {
    if (!playing) { lastRef.current = null; if (rafRef.current) cancelAnimationFrame(rafRef.current); return; }
    const tick = (now: number) => {
      if (lastRef.current == null) lastRef.current = now;
      // cap the step so a backgrounded tab cannot skip whole scenes on return
      elapsedRef.current += Math.min(100, now - lastRef.current);
      lastRef.current = now;
      paint(idx, elapsedRef.current / scene.duration);
      if (elapsedRef.current >= scene.duration) {
        elapsedRef.current = 0;
        if (idx + 1 < scenes.length) setIdx(idx + 1);
        else if (loop) { setIdx(0); paint(0, 0); }
        else { setStopped(true); paint(scenes.length - 1, 1); onEnd?.(); }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, idx, scene, scenes.length, loop, paint, onEnd]);

  const jumpTo = useCallback((i: number) => {
    const k = ((i % scenes.length) + scenes.length) % scenes.length;
    elapsedRef.current = 0; lastRef.current = null;
    setStopped(false); setPaused(false); setStarted(true); setIdx(k); paint(k, 0);
  }, [scenes.length, paint]);

  useImperativeHandle(ref, () => ({
    jump: jumpTo,
    toggle: () => { setStarted(true); setPaused(p => !p); },
    next: () => jumpTo(idx + 1),
    prev: () => jumpTo(idx - 1),
  }), [jumpTo, idx]);

  const jump = (i: number, e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); jumpTo(i); };

  return (
    <div
      ref={frameRef}
      className={`preview-frame group ${className}`}
      style={{ ['--accent' as string]: accent }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPaused(p => !p); }}
      role="button"
      tabIndex={-1}
      aria-label={paused ? 'Resume preview' : 'Pause preview'}
    >
      {!chromeless && (
        <div className="preview-progress">
          {scenes.map((s, k) => (
            <i key={s.id} onClick={(e) => jump(k, e)}><b ref={(el) => { barRefs.current[k] = el; }} /></i>
          ))}
        </div>
      )}

      <AnimatePresence mode="sync">
        <motion.div key={scene.id} className="scene"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.28 } }} transition={{ duration: 0.32 }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: DESIGN_W, height: stageH,
            transform: `scale(${scale})`, transformOrigin: '0 0',
            ['--fw' as string]: `${DESIGN_W}px`, ['--fh' as string]: `${stageH}px`,
          }}>
            {started || reduce ? scene.render({ active: true, compact: false, w: DESIGN_W }) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      {!bare && scene.caption && (
        <AnimatePresence>
          <motion.div key={scene.id + '-cap'} className="scene-caption"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
            {scene.caption}
          </motion.div>
        </AnimatePresence>
      )}

      {paused && (
        <div className="preview-paused"><span>Paused</span></div>
      )}
    </div>
  );
});
PreviewPlayer.displayName = 'PreviewPlayer';
