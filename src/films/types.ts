/**
 * A case-study film: narrated beats, each with something to look at. The narration is
 * generated to audio (scripts/films), its length sets each beat's length, and the
 * visuals are recorded frame by frame from /__film/:slug, so voice and picture line up.
 */

export type Visual =
  /** the opening card, on the sky */
  | { kind: 'title'; kicker: string; title: string }
  /** one big line */
  | { kind: 'statement'; text: string; kicker?: string }
  /** a framed image with a slow push-in; `dark` puts it on the project's dark ground */
  | { kind: 'image'; src: string; caption?: string; dark?: boolean; fit?: 'contain' | 'cover' }
  /** a tall page scrolling inside a browser frame */
  | { kind: 'scroll'; src: string; to?: number }
  /** phone screenshots in a row */
  | { kind: 'phones'; srcs: string[]; dark?: boolean }
  /** images in a grid */
  | { kind: 'grid'; srcs: string[]; captions?: string[]; dark?: boolean }
  /** big numbers; each lands with its sentence */
  | { kind: 'stats'; items: { n: string; l: string }[]; lead?: number }
  /** a titled list; each item lands with its sentence */
  | { kind: 'points'; title: string; items: string[]; lead?: number }
  /** cards; each lands with its sentence */
  | { kind: 'cards'; items: { kicker: string; title: string; text?: string }[]; lead?: number }
  /** steps in a row with arrows between, staggered across the beat */
  | { kind: 'flow'; title?: string; items: string[] }
  /** a looping clip in a frame */
  | { kind: 'clip'; src: string }
  /** one of the project's reel scenes, framed */
  | { kind: 'scene'; id: string }
  /** the closing card */
  | { kind: 'end'; line: string };

export type Beat = {
  /** what the narrator says (also the captions) */
  say: string;
  /** how to pronounce it, when the spelling trips the voice */
  spoken?: string;
  show: Visual;
  /** starts a new chapter in the player */
  chapter?: string;
};

export type Film = { slug: string; beats: Beat[] };

/** Written by the build script: when each beat starts and its sentence marks, in seconds. */
export type FilmTiming = { beats: { start: number; dur: number; marks: number[] }[]; total: number };
