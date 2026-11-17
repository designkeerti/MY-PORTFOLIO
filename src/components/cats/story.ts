import type { Pose } from './rig';

/**
 * The quote card's story, as functions of time. One loop (LOOP seconds) ends where it began,
 * so it plays forever without a seam:
 *   0    the back row sits; the snowshoe sleeps at the front; two bowls stand empty
 *   1.8  kibble pours into the bowls; ears perk, heads turn, the snowshoe wakes
 *   3.6  four cats walk in; two pass their bowl and turn round to share it
 *   ~7   they eat, heads down, chewing; the others watch and slow-blink
 *   13.5 the bowls empty; the walkers turn and leave
 *   21   the snowshoe lays its head down again
 * Everything is in stage units (a 1000 x 340 stage) and drawing units for the poses.
 */

export const LOOP = 24;
export const K = 1.6; // stage units per drawing unit, the same for every cat
export const FRONT = 330, BACK = 268, BACK_SCALE = 0.82;
export const BOWLS = [260, 740];
const WALK_SPEED = 150; // stage units a second
const STRIDE = 78;      // stage units per full gait cycle

// ---- small helpers --------------------------------------------------------------------
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, t: number) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
/** 0 before a, rises to 1 by a+r, holds, falls back to 0 between b and b+r */
const env = (t: number, a: number, b: number, r = 0.5) => smooth(a, a + r, t) * (1 - smooth(b, b + r, t));
const frac = (v: number) => v - Math.floor(v);
const TAU = Math.PI * 2;

/** a quick blink every few seconds, out of step from cat to cat */
export function blink(t: number, seed: number) {
  const x = frac((t + seed * 1.7) / (3.1 + (seed % 1.3)));
  return x < 0.045 ? 1 - 0.92 * Math.sin((Math.PI * x) / 0.045) : 1;
}
/** a slow blink (the cat kind): eyes close softly and stay a beat */
const slowBlink = (t: number, at: number) => 1 - 0.9 * env(t, at, at + 0.45, 0.3);
/** an ear flick now and then */
function twitch(t: number, seed: number) {
  const x = frac((t + seed * 2.3) / (2.6 + (seed % 1.9)));
  return x < 0.07 ? Math.sin((Math.PI * x) / 0.07) : 0;
}

// ---- walkers --------------------------------------------------------------------------
export type Walker = {
  name: string;
  /** which way the drawing itself faces: 1 right, -1 left */
  faces: 1 | -1;
  from: number; stop: number; bowl: number;
  enter: number; leave: number; exitTo: number;
  seed: number;
  /** gait phase offsets per leg, 0..1 (a cat walks back-left, front-left, back-right, front-right) */
  legs: Record<string, number>;
};

export const WALKERS: Walker[] = [
  { name: 'tabby', faces: 1, from: -280, stop: 154, bowl: BOWLS[0], enter: 3.6, leave: 15.8, exitTo: -300, seed: 0.3,
    legs: { backFar: 0, frontFar: 0.25, backNear: 0.5, frontNear: 0.75 } },
  { name: 'siamese', faces: -1, from: 1280, stop: 846, bowl: BOWLS[1], enter: 3.9, leave: 16.4, exitTo: 1300, seed: 1.1,
    legs: { backFar: 0, frontFar: 0.25, backNear: 0.5, frontNear: 0.75 } },
  { name: 'tuxedo', faces: 1, from: -280, stop: 342, bowl: BOWLS[0], enter: 4.6, leave: 16.9, exitTo: -300, seed: 2.2,
    legs: { backFar: 0.1, frontFar: 0.35, backNear: 0.6, frontNear: 0.85 } },
  { name: 'ragdoll', faces: -1, from: 1280, stop: 641, bowl: BOWLS[1], enter: 5.0, leave: 17.3, exitTo: 1300, seed: 3.4,
    legs: { backFar: 0.05, frontB: 0.3, backNear: 0.55, frontA: 0.8 } },
];

const TURN = 0.32;

type WalkerState = { x: number; sx: number; speed: number; phase: number; eat: number; on: boolean };

/** where a walker is and what it is doing at time t */
export function walkerState(w: Walker, t: number): WalkerState {
  const d1 = Math.sign(w.stop - w.from);
  const t1 = Math.abs(w.stop - w.from) / WALK_SPEED;          // time to walk in
  const arrive = w.enter + t1;
  const toBowl = Math.sign(w.bowl - w.stop);                  // the way it faces to eat
  const turnIn = toBowl !== d1;
  const settled = arrive + (turnIn ? TURN : 0);
  const d3 = Math.sign(w.exitTo - w.stop);
  const turnOut = d3 !== toBowl;
  const go = w.leave + (turnOut ? TURN : 0);
  const t3 = Math.abs(w.exitTo - w.stop) / WALK_SPEED;

  // position: eased walk in, rest, eased walk out (the gait phase follows the distance, so feet never slide)
  const ease = (u: number) => (u < 0.18 ? (u * u) / (2 * 0.18 * 0.82) : u > 0.82 ? 1 - ((1 - u) * (1 - u)) / (2 * 0.18 * 0.82) : (u - 0.09) / 0.82);
  let x: number, speed = 0, travelled = 0;
  if (t < w.enter) x = w.from;
  else if (t < arrive) { const u = (t - w.enter) / t1; x = w.from + (w.stop - w.from) * ease(u); travelled = Math.abs(x - w.from); speed = u > 0.06 && u < 0.94 ? 1 : Math.min(u, 1 - u) / 0.06; }
  else if (t < go) { x = w.stop; travelled = Math.abs(w.stop - w.from); }
  else if (t < go + t3) { const u = (t - go) / t3; x = w.stop + (w.exitTo - w.stop) * ease(u); travelled = Math.abs(w.stop - w.from) + Math.abs(x - w.stop); speed = u > 0.06 && u < 0.94 ? 1 : Math.min(u, 1 - u) / 0.06; }
  else { x = w.exitTo; travelled = Math.abs(w.stop - w.from) + Math.abs(w.exitTo - w.stop); }

  // facing on screen (1 right, -1 left), and the turns as a squash through zero
  let face = d1, squash = 1;
  if (turnIn && t >= arrive) { const u = clamp01((t - arrive) / TURN); face = u < 0.5 ? d1 : toBowl; squash = Math.abs(Math.cos(Math.PI * u)); }
  if (t >= arrive + (turnIn ? TURN : 0)) face = toBowl;
  if (turnOut && t >= w.leave) { const u = clamp01((t - w.leave) / TURN); face = u < 0.5 ? toBowl : d3; squash = Math.abs(Math.cos(Math.PI * u)); }
  if (t >= go) face = d3;
  const sx = face * w.faces * Math.max(0.06, squash);

  const eat = env(t, settled + 0.25, w.leave - 0.45, 0.45);
  return { x, sx, speed: clamp01(speed), phase: travelled / STRIDE, eat, on: t > w.enter - 0.1 && t < go + t3 + 0.1 };
}

/** a walker's pose: gait while moving, head down and chewing at the bowl, tail always going */
export function walkerPose(w: Walker, s: WalkerState, t: number): Pose {
  const f = w.faces, p = s.phase, A = 17 * s.speed;
  const pose: Pose = {};
  for (const [leg, o] of Object.entries(w.legs)) {
    const a = TAU * (p + o);
    // forward is the way the drawing faces: for a right-facing drawing that is a negative turn
    pose[leg] = { r: -f * A * Math.sin(a), y: -1.6 * s.speed * Math.max(0, Math.cos(a)) };
  }
  const bob = -0.9 * s.speed * (0.5 - 0.5 * Math.cos(2 * TAU * p));
  const breathe = 1 + 0.012 * Math.sin(TAU * t / 2.9 + w.seed);
  pose.body = { y: bob, sy: breathe, r: f * 3.5 * s.eat };
  const chew = Math.sin(TAU * 2.3 * t + w.seed) * 3.5;
  pose.head = { r: f * (1.6 * s.speed * Math.sin(2 * TAU * p + 1) + s.eat * (31 + chew) + (1 - s.eat) * (1 - s.speed) * 2 * Math.sin(0.7 * t + w.seed)) };
  // tail: an S-curve that travels from base to tip; lazier and wider while eating
  const tf = 1.1 + 0.6 * s.speed;
  pose.tail = { r: (6 + 4 * s.eat) * Math.sin(TAU * 0.5 * tf * t + w.seed) };
  pose.tailTip = { r: (10 + 6 * s.eat) * Math.sin(TAU * 0.5 * tf * t + w.seed - 0.9) };
  pose.eyes = { sy: s.eat > 0.5 ? Math.min(blink(t, w.seed), 0.55 + 0.45 * (1 - s.eat)) : blink(t, w.seed) };
  const tw = twitch(t, w.seed);
  pose.earL = { r: -10 * tw };
  pose.earR = { r: 10 * twitch(t, w.seed + 0.8) };
  return pose;
}

// ---- sitters and the sleeper ----------------------------------------------------------
export type Sitter = {
  name: string; x: number; faces: 1 | -1; seed: number;
  /** which way its head tilts to look at the food */
  look: 1 | -1;
};

export const SITTERS: Sitter[] = [
  { name: 'calico', x: 118, faces: 1, seed: 0.7, look: 1 },
  { name: 'ginger', x: 332, faces: 1, seed: 1.9, look: -1 },
  { name: 'grey', x: 668, faces: -1, seed: 2.6, look: 1 },
  { name: 'abyssinian', x: 880, faces: -1, seed: 3.8, look: -1 },
];
export const SLEEPER = { name: 'snowshoe', x: 492, seed: 4.4, scale: 0.95 };

/** how interested the room is: food arrives at 1.8, the bowls are empty by ~15.5 */
const interest = (t: number) => env(t, 1.8, 15.6, 0.7);
const perk = (t: number) => env(t, 1.9, 2.5, 0.2);

export function sitterPose(c: Sitter, t: number): Pose {
  const a = interest(t), k = perk(t);
  const sway = Math.sin(0.55 * t + c.seed);
  const pose: Pose = {
    body: { sy: 1 + 0.014 * Math.sin(TAU * t / 3.1 + c.seed) },
    // a curious tilt toward the food, a little looking about, a nod each time a cat arrives
    head: { r: c.look * 9 * a + 2.4 * sway + 3 * env(t, 6.6 + c.seed * 0.4, 6.9 + c.seed * 0.4, 0.2) * c.look },
    // the slow blink comes once, while the others are eating
    eyes: { sy: Math.min(blink(t, c.seed), slowBlink(t, 9 + c.seed * 0.9)) },
    earL: { r: -12 * k - 9 * twitch(t, c.seed) },
    earR: { r: 12 * k + 9 * twitch(t, c.seed + 1.3) },
    tail: { r: 5 * Math.sin(0.9 * t + c.seed) },
    tailTip: { r: (9 + 9 * a) * Math.sin((1.3 + 1.1 * a) * t + c.seed + 0.7) },
  };
  return pose;
}

export function sleeperPose(t: number, seed: number): Pose {
  const awake = env(t, 2.2, 21.2, 0.8);
  // eyes open with a couple of slow blinks on waking, close again at the end
  const open = smooth(2.5, 3.1, t) * (1 - smooth(21.6, 22.3, t));
  const eyes = 0.08 + 0.92 * open * blink(t, seed) * slowBlink(t, 3.4) * slowBlink(t, 12.5);
  const look = Math.sin(0.45 * t + seed);
  return {
    body: { sy: 1 + (0.03 - 0.015 * awake) * Math.sin(TAU * t / (3.8 - 1 * awake)) },
    head: { r: -6 * (1 - awake) + awake * 7 * look, y: 3 * (1 - awake) },
    eyes: { sy: eyes },
    earL: { r: -10 * perk(t) - 8 * twitch(t, seed) },
    earR: { r: 10 * perk(t) + 8 * twitch(t, seed + 0.6) },
    tailTip: { r: (6 + 8 * awake) * Math.sin((0.7 + 0.8 * awake) * t + seed) },
  };
}

// ---- kibble ---------------------------------------------------------------------------
const PIECES = 15;
/** each bowl's heap: where every piece comes to rest, relative to the bowl's rim centre */
export const HEAP = Array.from({ length: PIECES }, (_, i) => {
  const row = i < 6 ? 0 : i < 11 ? 1 : i < 14 ? 2 : 3;
  const n = [6, 5, 3, 1][row], j = i - [0, 6, 11, 14][row];
  return { x: (j - (n - 1) / 2) * 13 + (row % 2 ? 3 : -2), y: -6 - row * 9, r: 6.2 - row * 0.4 };
});

/** a piece of kibble at time t: falling in, resting, then eaten away (last in, first eaten) */
export function kibble(bowl: number, i: number, t: number) {
  const pour = 1.8 + bowl * 0.5;
  const drop = pour + i * 0.06;
  const rest = HEAP[i];
  const fall = 0.42;
  const eatenAt = 13.4 + bowl * 0.4 + (PIECES - 1 - i) * 0.13;
  if (t < drop || t > eatenAt + 0.15) return null;
  if (t < drop + fall) {
    const u = (t - drop) / fall;
    return { x: rest.x * (0.4 + 0.6 * u), y: rest.y - 260 * (1 - u * u), r: rest.r, o: 1 };
  }
  const bounce = Math.max(0, Math.sin(Math.PI * clamp01((t - drop - fall) / 0.18))) * 4;
  const gone = clamp01((t - eatenAt) / 0.15);
  return { x: rest.x, y: rest.y - bounce, r: rest.r * (1 - gone), o: 1 - gone };
}
