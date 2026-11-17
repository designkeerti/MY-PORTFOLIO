/**
 * One animation frame loop for all the little cats on the page. Each subscribes while it is on
 * screen; the loop stops when nobody is listening or the tab is hidden. Time is in seconds.
 */
type Tick = (t: number) => void;
const subs = new Set<Tick>();
let raf = 0;

const frame = (now: number) => {
  raf = 0;
  if (!subs.size || document.hidden) return;
  const t = now / 1000;
  subs.forEach(f => f(t));
  raf = requestAnimationFrame(frame);
};
const kick = () => { if (!raf && subs.size && !document.hidden) raf = requestAnimationFrame(frame); };
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', kick);

export function onTick(f: Tick) {
  subs.add(f);
  kick();
  return () => { subs.delete(f); };
}
