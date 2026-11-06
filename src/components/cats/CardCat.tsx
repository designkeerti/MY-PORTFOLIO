import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { pose, type Pose } from './rig';
import { RIGS } from './rigs';
import { build, fetchArt, place, type Actor } from './actor';
import { onTick } from './ticker';
import { blink } from './story';
import { projects } from '../../content/projects';
import { TOOLS } from '../../playground/data';

/**
 * Four cats on the cards at a time, each doing something different. Every page load picks
 * one work card, one playground tile, one about card and one more work card or tile, and
 * gives them the four walkers and the four acts, shuffled:
 *   nap     melted flat over the top edge: front paws hanging down the card, hind legs and
 *           tail behind it; slow breathing, ear twitches, a dreaming paddle, a small z
 *   pounce  crouched low, stalking a ball of yarn hanging over the edge; the rear wiggles,
 *           the tail lashes, then a lunge and a swat; it watches the ball swing and settle
 *   groom   lifts a paw to its mouth, licks it in little bobs, wipes it over its face
 *   stroll  walks the length of the edge, stops to look about, turns, walks back
 * A card that hosts one needs `position: relative` and no clipping at its top edge.
 */

type Act = 'nap' | 'pounce' | 'groom' | 'stroll';
type Walker = { faces: 1 | -1; front: string[]; back: string[]; belly: number; legs: Record<string, number> };
const WALKERS: Record<string, Walker> = {
  tabby: { faces: 1, front: ['frontNear', 'frontFar'], back: ['backNear', 'backFar'], belly: 60, legs: { backFar: 0, frontFar: 0.25, backNear: 0.5, frontNear: 0.75 } },
  tuxedo: { faces: 1, front: ['frontNear', 'frontFar'], back: ['backNear', 'backFar'], belly: 84, legs: { backFar: 0.1, frontFar: 0.35, backNear: 0.6, frontNear: 0.85 } },
  siamese: { faces: -1, front: ['frontNear', 'frontFar'], back: ['backNear', 'backFar'], belly: 72, legs: { backFar: 0, frontFar: 0.25, backNear: 0.5, frontNear: 0.75 } },
  ragdoll: { faces: -1, front: ['frontA', 'frontB'], back: ['backNear', 'backFar'], belly: 58, legs: { backFar: 0.05, frontB: 0.3, backNear: 0.55, frontA: 0.8 } },
};
const YARN = ['#e07a5f', '#81b29a', '#e9b949', '#7aa6d6', '#c38bc9'];

type Spec = { cat: string; act: Act; dir: 1 | -1; x: number; seed: number; yarn: string };

// one roll of the dice per page load
const LOAD = Math.random();
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) / 4294967296; };
const roll = (s: string) => { const v = hash(s) + LOAD; return v - Math.floor(v); };
const shuffle = <T,>(a: T[], key: string) => [...a].sort((p, q) => roll(key + String(p)) - roll(key + String(q)));

// dev: ?cardcats=all puts a cat on every card (the acts in turn), for looking at them
const FORCE = import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).get('cardcats') === 'all';

const ACTS: Act[] = ['nap', 'pounce', 'groom', 'stroll'];
const CAST: Record<string, Spec> = (() => {
  const work = shuffle(projects.map(p => `work-${p.meta.slug}`), 'w');
  const tools = shuffle(TOOLS.map(t => `tool-${t.slug}`), 't');
  const about = shuffle(['about-bio', 'about-offline'], 'a');
  const cards = [work[0], tools[0], about[0], roll('extra') < 0.5 ? work[1] : tools[1]];
  const acts = shuffle(ACTS, 'acts');
  // grooming reads best on a cat whose paw stands out against its chest: the siamese or the ragdoll
  const groomer = roll('groomer') < 0.5 ? 'siamese' : 'ragdoll';
  const rest = shuffle(Object.keys(WALKERS).filter(c => c !== groomer), 'cats');
  const cats = acts.map(a => (a === 'groom' ? groomer : rest.shift()!));
  const spec = (id: string, i: number): Spec => ({
    cat: cats[i % 4], act: acts[i % 4],
    dir: roll(id + 'dir') < 0.5 ? 1 : -1,
    // off to one side of the edge, never the middle, where headings above cards sit centred
    x: roll(id + 'side') < 0.5 ? 16 + roll(id + 'x') * 18 : 66 + roll(id + 'x') * 18,
    seed: roll(id + 'seed') * 10, yarn: YARN[Math.floor(roll(id + 'yarn') * YARN.length)],
  });
  if (FORCE) {
    const all = [...work, ...tools, ...about];
    return Object.fromEntries(all.map((id, i) => [id, spec(id, i)]));
  }
  return Object.fromEntries(cards.map((id, i) => [id, spec(id, i)]));
})();

const TAU = Math.PI * 2;
const frac = (v: number) => v - Math.floor(v);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, t: number) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
/** rises over [a, a+r], falls over [b, b+r] */
const env = (t: number, a: number, b: number, r: number) => smooth(a, a + r, t) * (1 - smooth(b, b + r, t));
const twitch = (t: number, seed: number, every = 3.4) => { const x = frac((t + seed * 2.1) / (every + (seed % 1.7))); return x < 0.06 ? Math.sin((Math.PI * x) / 0.06) : 0; };
const NS = 'http://www.w3.org/2000/svg';

export function CardCat({ id, size = 'lg', tone = 'light', demo }: { id: string; size?: 'lg' | 'sm' | 'xl'; tone?: 'light' | 'dark'; demo?: { cat: string; act: Act } }) {
  // demo: the /__cats page shows one cat and act, large
  const spec = demo ? { cat: demo.cat, act: demo.act, dir: 1 as const, x: 30, seed: 1.3, yarn: YARN[0] } : CAST[id] ?? null;
  const reduce = !!useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const behind = useRef<SVGGElement>(null), cat = useRef<SVGGElement>(null), extra = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!spec) return;
    const el = box.current!;
    let alive = true, built = false, stop = () => {}, draw: ((t: number) => void) | null = null;
    const uid = `cc${Math.floor(hash(id) * 1e8).toString(36)}`;
    const height = size === 'xl' ? 150 : size === 'lg' ? 50 : 30;
    const w = WALKERS[spec.cat];
    const s = spec.seed, f = w.faces;

    const make = async () => {
      const txt = await fetchArt(spec.cat);
      if (!alive || built) return;
      built = true;
      const front = build(spec.cat, txt, cat.current!, `${uid}f`);
      const S = height / front.vh;
      const len = front.vw * S;
      let back: Actor | null = null;
      const behindParts = new Set([...w.back, 'tail', 'tailTip']);
      if (spec.act === 'nap' || spec.act === 'pounce') {
        // draped over the edge, the far half goes behind the card: one copy keeps the hind legs and tail, clipped to above the edge
        back = build(spec.cat, txt, behind.current!, `${uid}b`);
        for (const [part, gs] of front.r.groups) if (behindParts.has(part)) gs.forEach(g => (g.style.display = 'none'));
        for (const [part, gs] of back.r.groups) if (!behindParts.has(part)) gs.forEach(g => (g.style.display = 'none'));
      }

      // the yarn (pounce): a thread over the edge to a ball hanging in front of the card
      const g = extra.current!;
      const k = height / 50; // everything around the cat scales with it
      const R = 5.5 * Math.max(k, 0.66), L = 14 * Math.max(k, 0.64);
      const thread = document.createElementNS(NS, 'path');
      const ball = document.createElementNS(NS, 'g');
      if (spec.act === 'pounce') {
        thread.setAttribute('fill', 'none'); thread.setAttribute('stroke', spec.yarn); thread.setAttribute('stroke-width', (0.9 * Math.max(k, 0.8)).toFixed(2)); thread.setAttribute('stroke-linecap', 'round');
        ball.innerHTML = `<circle r="${R}" fill="${spec.yarn}"/><g fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="${(R * 0.16).toFixed(2)}" stroke-linecap="round"><path d="M${-R * 0.75} ${-R * 0.2}Q0 ${-R * 0.95} ${R * 0.75} ${-R * 0.2}"/><path d="M${-R * 0.8} ${R * 0.2}Q0 ${-R * 0.45} ${R * 0.8} ${R * 0.2}"/><path d="M${-R * 0.3} ${-R * 0.85}Q${R * 0.45} 0 ${-R * 0.1} ${R * 0.9}"/></g>`;
        g.appendChild(thread); g.appendChild(ball);
      }
      // the ball hangs just ahead of the near front paw, at paw height, so a forward swat meets it
      const sxDir = spec.dir * f;
      const paw = RIGS[spec.cat].parts.find(q => q.name === w.front[0])!.pivot;
      const legLen = (front.vh - paw[1]) * S;
      const yarnX = (paw[0] - front.vw / 2) * S * sxDir + spec.dir * legLen * 0.55;
      const hang = Math.max(L, legLen * 0.85) + (paw[1] - w.belly) * S;
      const setYarn = (theta: number) => {
        const bx = yarnX + hang * Math.sin(theta), by = hang * Math.cos(theta);
        thread.setAttribute('d', `M${(yarnX - spec.dir * 6).toFixed(1)} -0.4L${yarnX.toFixed(1)} 0L${bx.toFixed(1)} ${by.toFixed(1)}`);
        ball.setAttribute('transform', `translate(${bx.toFixed(1)} ${(by + R * 0.8).toFixed(1)}) rotate(${(theta * 140).toFixed(1)})`);
      };
      // z, z, z (nap)
      const zs: SVGTextElement[] = [];
      if (spec.act === 'nap') for (let i = 0; i < 3; i++) {
        const z = document.createElementNS(NS, 'text');
        z.textContent = 'z'; z.setAttribute('font-size', ((8 + i) * Math.max(k, 0.75)).toFixed(1)); z.setAttribute('font-weight', '600');
        z.setAttribute('fill', 'currentColor'); g.appendChild(z); zs.push(z);
      }
      const head = RIGS[spec.cat].parts.find(p => p.name === 'head')!.pivot;
      const pivotY = RIGS[spec.cat].pivot[1];

      // a walk cycle for any speed 0..1 at gait phase p (cycles), shared by the stroll and the pounce
      const gait = (p: Pose, phase: number, speed: number) => {
        for (const [leg, o] of Object.entries(w.legs)) {
          const a = TAU * (phase + o);
          p[leg] = { r: -f * 17 * speed * Math.sin(a), y: -1.6 * speed * Math.max(0, Math.cos(a)) };
        }
        return -0.9 * speed * (0.5 - 0.5 * Math.cos(2 * TAU * phase));
      };

      draw = (t: number) => {
        const p: Pose = { eyes: { sy: blink(t, s) }, earL: { r: -9 * twitch(t, s) }, earR: { r: 9 * twitch(t, s + 1.1) } };
        let sx = spec.dir * f, x = 0;

        if (spec.act === 'nap') {
          // melted flat: squashed onto the edge about the belly line, the head end tipped down
          const breathe = Math.sin(TAU * t / 3.8 + s);
          const sy = 0.8 + 0.035 * breathe;
          p.body = { sx: 1.06, sy, y: (w.belly - pivotY) * (1 - sy), r: f * 5 };
          p.head = { r: f * 24 + 1.5 * Math.sin(0.4 * t + s), y: 3 };
          p.eyes = { sy: 0.08 };
          // front paws dangle over the edge; now and then a dreaming paddle
          w.front.forEach((leg, i) => { p[leg] = { r: -f * (9 - i * 13) + 3 * Math.sin(0.9 * t + s + i) - f * 18 * twitch(t, s + i * 0.4, 6.2) }; });
          w.back.forEach((leg, i) => { p[leg] = { r: f * (14 + i * 6) + 2 * Math.sin(0.8 * t + s + i) }; });
          p.tail = { r: 6 * Math.sin(0.5 * t + s) };
          p.tailTip = { r: 14 * Math.sin(0.7 * t + s + 0.8) + 18 * twitch(t, s + 2, 4.6) };
          place(front, 0, 0, sx, S, w.belly);
          pose(front.r, p);
          if (back) { place(back, 0, 0, sx, S, w.belly); pose(back.r, p); }
          const hx = (head[0] - front.vw / 2) * S * sx, hy = (head[1] - w.belly) * S;
          zs.forEach((z, i) => {
            const u = frac(t / 3.2 + i / 3 + s);
            z.setAttribute('x', (hx + spec.dir * (2 + u * 10 + i * 2) * k).toFixed(1));
            z.setAttribute('y', (hy - (8 + u * 16) * k).toFixed(1));
            z.setAttribute('opacity', (Math.sin(Math.PI * u) * 0.7).toFixed(2));
          });
          return;
        }

        if (spec.act === 'pounce') {
          // lying over the edge, wide awake, eyes on the yarn below: stare -> wiggle -> swat -> watch it swing
          const P = 4.4, u = frac((t + s) / P) * P;
          const stare = env(u, 0.1, 3.1, 0.5);
          const wiggle = env(u, 1.6, 2.35, 0.15);
          const swat = env(u, 2.35, 2.62, 0.1);
          const hit = 2.48, d = u >= hit ? u - hit : u - hit + P;
          const theta = spec.dir * 0.9 * Math.exp(-0.95 * d) * Math.sin(4.4 * d) + 0.04 * Math.sin(1.3 * t);
          const quick = Math.sin(TAU * 7 * t);
          const sy = 0.9 + 0.02 * Math.sin(TAU * t / 2.6 + s);
          p.body = { sx: 1.03, sy, y: (w.belly - pivotY) * (1 - sy), r: f * (3 + 2.2 * wiggle * quick), x: f * 2.5 * swat };
          // the near paw hangs, then swings forward into the ball; the other grips the edge
          p[w.front[0]] = { r: -f * (4 + 4 * stare + 50 * swat) + 2 * Math.sin(1.1 * t), y: -1.5 * swat };
          p[w.front[1]] = { r: f * (10 + 4 * wiggle * quick) };
          w.back.forEach((leg, i) => { p[leg] = { r: f * (12 + i * 6) + 6 * wiggle * quick * (i ? -1 : 1) }; });
          p.head = { r: f * (18 + 10 * stare - 4 * swat) + 14 * theta * spec.dir * f };
          p.eyes = { sy: stare > 0.4 ? 1 : blink(t, s) };
          p.earL = { r: -12 * stare - 9 * twitch(t, s) };
          p.earR = { r: 12 * stare };
          p.tail = { r: 6 * Math.sin(1.2 * t + s) + 10 * wiggle * Math.sin(TAU * 2.5 * t) };
          p.tailTip = { r: 14 * Math.sin(1.6 * t + s - 0.9) + 24 * stare * Math.sin(TAU * 1.7 * t) };
          place(front, 0, 0, sx, S, w.belly);
          pose(front.r, p);
          if (back) { place(back, 0, 0, sx, S, w.belly); pose(back.r, p); }
          setYarn(theta);
          return;
        }

        if (spec.act === 'groom') {
          // lift a paw to the mouth, lick in little bobs, wipe it over the face, put it down
          const P = 6.2, u = frac((t + s) / P) * P;
          const up = env(u, 0.4, 4.4, 0.45);
          const lick = env(u, 0.9, 2.6, 0.2);
          const wipe = env(u, 2.7, 4.2, 0.2);
          const bob = Math.sin(TAU * 3.2 * t);
          p.body = { r: -f * 5 * up, y: 1 * up, sy: 1 + 0.012 * Math.sin(TAU * t / 2.8 + s) };
          // the paw comes up and in toward the chin; the head bows to meet it
          p[w.front[0]] = { r: -f * (96 * up + 14 * wipe * Math.sin(TAU * 1.4 * t)), y: -11 * up, x: f * 2 * up };
          p[w.front[1]] = { r: f * 5 * up };
          p.head = { r: f * (34 * up + 6 * lick * bob - 12 * wipe + 9 * wipe * Math.sin(TAU * 1.4 * t)), y: 2 * up };
          p.eyes = { sy: Math.min(blink(t, s), 1 - 0.75 * lick) };
          p.tail = { r: 4 * Math.sin(0.8 * t + s) };
          p.tailTip = { r: 10 * Math.sin(1.1 * t + s - 0.8) };
          place(front, 0, 0, sx, S);
          pose(front.r, p);
          return;
        }

        // stroll: along the edge and back, stopping at each end to look about
        const W = el.parentElement!.clientWidth;
        const a = len / 2 + 10 * k, b = Math.max(a + 20, W - len / 2 - 10 * k);
        const v = 20 * k, T = (b - a) / v, rest = 2.2, turn = 0.35;
        const C = 2 * (T + rest + turn), u = frac((t + s * 3) / C) * C;
        const ease = (k: number) => (k < 0.12 ? (k * k) / (2 * 0.12 * 0.88) : k > 0.88 ? 1 - ((1 - k) * (1 - k)) / (2 * 0.12 * 0.88) : (k - 0.06) / 0.88);
        let speed = 0, dist = 0, face = 1, squash = 1;
        if (u < T) { const k = u / T; x = a + (b - a) * ease(k); speed = Math.min(1, k / 0.12, (1 - k) / 0.12); dist = x - a; face = 1; }
        else if (u < T + rest) { x = b; dist = b - a; face = 1; }
        else if (u < T + rest + turn) { x = b; dist = b - a; const k = (u - T - rest) / turn; face = k < 0.5 ? 1 : -1; squash = Math.abs(Math.cos(Math.PI * k)); }
        else if (u < 2 * T + rest + turn) { const k = (u - T - rest - turn) / T; x = b - (b - a) * ease(k); speed = Math.min(1, k / 0.12, (1 - k) / 0.12); dist = (b - a) + (b - x); face = -1; }
        else if (u < 2 * T + 2 * rest + turn) { x = a; dist = 2 * (b - a); face = -1; }
        else { x = a; dist = 2 * (b - a); const k = (u - 2 * T - 2 * rest - turn) / turn; face = k < 0.5 ? -1 : 1; squash = Math.abs(Math.cos(Math.PI * k)); }
        sx = face * f * Math.max(0.06, squash);
        const phase = dist / (len * 0.55);
        const bobY = gait(p, phase, speed);
        const still = 1 - speed;
        p.body = { y: bobY, sy: 1 + 0.012 * Math.sin(TAU * t / 2.8 + s) };
        p.head = { r: f * (1.6 * speed * Math.sin(2 * TAU * phase + 1) + still * 9 * Math.sin(0.9 * t + s)) };
        p.tail = { r: 6 * Math.sin(TAU * 0.55 * t + s) };
        p.tailTip = { r: 11 * Math.sin(TAU * 0.55 * t + s - 0.9) };
        place(front, x, 0, sx, S);
        pose(front.r, p);
      };
      // dev: ?catT=2 holds every card cat at that second
      const hold = import.meta.env.DEV ? parseFloat(new URLSearchParams(location.search).get('catT') ?? '') : NaN;
      if (Number.isFinite(hold)) { draw(hold); draw = null; return; }
      draw(reduce ? 3 : performance.now() / 1000);
    };

    // build when near, animate only while on screen
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) make().then(() => { if (alive && draw && !reduce) { stop(); stop = onTick(draw); } });
      else { stop(); stop = () => {}; }
    }, { rootMargin: '200px 0px' });
    io.observe(el.parentElement ?? el);
    return () => {
      alive = false; stop(); io.disconnect();
      [behind.current, cat.current, extra.current].forEach(l => { while (l?.firstChild) l.removeChild(l.firstChild); });
    };
  }, [spec, size, reduce, id]);

  if (!spec) return null;
  const clipId = `cc-above-${id}`;
  return (
    <div ref={box} aria-hidden data-cat-act={spec.act} className={`pointer-events-none absolute top-0 z-10 h-0 w-0 ${tone === 'dark' ? 'text-white/55' : 'text-ink/45'}`}
      style={{ left: spec.act === 'stroll' ? 0 : `${spec.x}%` }}>
      <svg width="1" height="1" overflow="visible" className="absolute left-0 top-0 overflow-visible">
        <defs><clipPath id={clipId}><rect x="-2000" y="-400" width="4000" height="400" /></clipPath></defs>
        <g clipPath={`url(#${clipId})`}><g ref={behind} /></g>
        <g ref={extra} />
        <g ref={cat} />
      </svg>
    </div>
  );
}
