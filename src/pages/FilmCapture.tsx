import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { bySlug } from '../content/projects';
import { films } from '../films/scripts';
import { FilmView } from '../films/FilmView';
import type { FilmTiming } from '../films/types';

/**
 * Dev-only: a case-study film on its own 1280×720 stage, for scripts/films/build.mjs.
 * The script reads `__filmBeats`, makes the narration, injects `__filmTiming`, then
 * steps a fake clock and screenshots every frame after calling `__filmGo()`.
 */
type W = { __filmBeats?: unknown; __filmTiming?: FilmTiming; __filmGo?: () => void; __filmReady?: boolean };

export default function FilmCapture() {
  const slug = useParams().slug ?? '';
  const p = bySlug(slug);
  const film = films[slug];
  const scenes = useMemo(() => p?.preview() ?? [], [p]);
  const w = window as unknown as W;
  const [timing] = useState<FilmTiming | undefined>(() => w.__filmTiming);
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (!film) return;
    w.__filmBeats = film.beats.map(b => ({ say: b.say, spoken: b.spoken, chapter: b.chapter }));
    w.__filmGo = () => setGo(true);
    // wait for every image the film shows, so no frame catches one half-loaded
    const srcs = new Set<string>();
    JSON.stringify(film.beats).replace(/"(\/[^"]+\.(?:png|jpe?g|webp))"/g, (_, s) => { srcs.add(s); return ''; });
    Promise.all([...srcs].map(s => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = s; })))
      .then(() => document.fonts.ready).then(() => { w.__filmReady = true; });
  }, [film, w]);

  if (!p || !film) return null;
  if (!timing) return <div style={{ padding: 40 }}>{film.beats.length} beats. Timing is injected by the build script.</div>;
  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden bg-black">
      <style>{'nav{display:none!important}'}</style>
      <FilmView film={film} timing={timing} accent={p.meta.accent} dark={p.meta.accent2 ?? '#111'} scenes={scenes} running={go} />
    </div>
  );
}
