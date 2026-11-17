import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT, hydrate, type State } from './model';

/** State with undo and redo. Edits to the same control in quick succession count as one step. */
export function useHistory(initial: () => State) {
  const [st, setSt] = useState(initial);
  const cur = useRef(st);
  const past = useRef<State[]>([]), future = useRef<State[]>([]);
  const last = useRef({ key: '', at: 0 });
  const [, bump] = useState(0);

  const edit = useCallback((fn: (s: State) => State, key = '') => {
    const prev = cur.current, next = fn(prev);
    if (next === prev) return;
    const now = Date.now();
    if (!(key && key === last.current.key && now - last.current.at < 900)) {
      past.current.push(prev);
      if (past.current.length > 120) past.current.shift();
    }
    last.current = { key, at: now };
    future.current = [];
    cur.current = next; setSt(next);
  }, []);
  const undo = useCallback(() => {
    const p = past.current.pop(); if (!p) return;
    future.current.push(cur.current); cur.current = p; last.current = { key: '', at: 0 }; setSt(p); bump(x => x + 1);
  }, []);
  const redo = useCallback(() => {
    const f = future.current.pop(); if (!f) return;
    past.current.push(cur.current); cur.current = f; last.current = { key: '', at: 0 }; setSt(f); bump(x => x + 1);
  }, []);
  return { st, edit, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}

const KEY = 'pg-tokens-v1';
export function loadSaved(): State {
  try { const raw = localStorage.getItem(KEY); if (raw) return hydrate(JSON.parse(raw)); } catch { /* private window */ }
  return DEFAULT;
}
export function useAutosave(st: State) {
  useEffect(() => {
    const t = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* full or blocked */ } }, 400);
    return () => clearTimeout(t);
  }, [st]);
}

/* a whole system in the link: JSON, deflated, base64url */
const b64 = (u8: Uint8Array) => btoa(String.fromCharCode(...u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([data as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}
export async function encodeState(st: State) {
  const raw = new TextEncoder().encode(JSON.stringify(st));
  try { return 'z' + b64(await pipe(raw, new CompressionStream('deflate-raw'))); } catch { return 'j' + b64(raw); }
}
export async function decodeState(s: string): Promise<State | null> {
  try {
    const bytes = unb64(s.slice(1));
    const raw = s[0] === 'z' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes;
    return hydrate(JSON.parse(new TextDecoder().decode(raw)));
  } catch { return null; }
}

/**
 * What just changed: for a moment after a token moves, `deltas[name]` holds where it came
 * from and where it is now (a burst of changes keeps its first `from`). Wholesale swaps,
 * like a preset, are left alone: a hundred chips at once say nothing.
 */
export function useDeltas(now: Record<string, string>, hold = 1800) {
  const prev = useRef(now);
  const [live, setLive] = useState<Record<string, { from: string; to: string; at: number }>>({});
  useEffect(() => {
    const p = prev.current; prev.current = now;
    const t = Date.now();
    const changed = Object.keys(now).filter(k => p[k] !== undefined && p[k] !== now[k]);
    if (!changed.length || changed.length > 60) return;
    setLive(l => {
      const next = { ...l };
      for (const k of changed) next[k] = { from: l[k] && t - l[k].at < hold ? l[k].from : p[k], to: now[k], at: t };
      return next;
    });
  }, [now, hold]);
  useEffect(() => {
    const id = setInterval(() => setLive(l => {
      const t = Date.now(), keep = Object.entries(l).filter(([, v]) => t - v.at < hold && v.from !== v.to);
      return keep.length === Object.keys(l).length ? l : Object.fromEntries(keep);
    }), 500);
    return () => clearInterval(id);
  }, [hold]);
  return live;
}
