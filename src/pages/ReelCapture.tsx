import { useParams } from 'react-router-dom';
import { PreviewPlayer } from '../previews/PreviewPlayer';
import { bySlug } from '../content/projects';

/**
 * Dev-only: a project's reel, alone and full-frame, so it can be recorded
 * to video for the hero orbit (see scripts in the session notes). Not routed
 * in production builds.
 */
export default function ReelCapture() {
  const p = bySlug(useParams().slug);
  if (!p) return null;
  const scenes = p.preview();
  // total length, for the recording script
  (window as unknown as { __reelMs: number }).__reelMs = scenes.reduce((t, s) => t + s.duration, 0);
  return (
    <div className="reel-capture fixed inset-0 bg-black">
      <style>{'nav{display:none!important}.reel-capture .preview-progress{display:none!important}.reel-capture .preview-frame{width:100vw;height:100vh;aspect-ratio:auto;border-radius:0}'}</style>
      <PreviewPlayer scenes={scenes} accent={p.meta.accent} bare loop={false} className="h-full w-full" />
    </div>
  );
}
