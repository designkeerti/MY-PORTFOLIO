import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PreviewPlayer, type PlayerHandle, type PlayerState } from '../previews/PreviewPlayer';
import type { Project } from '../content/types';

const firstSentence = (s: string) => s.split(/(?<=\.)\s/)[0];

/** The stage: the project's reel, a small transport, and just enough words. */
export const Stage = ({ project, index, total, onPrev, onNext }: { project: Project; index: number; total: number; onPrev: () => void; onNext: () => void }) => {
  const scenes = useMemo(() => project.preview(), [project]);
  const player = useRef<PlayerHandle>(null);
  const fill = useRef<HTMLElement>(null);
  const [st, setSt] = useState<PlayerState>({ idx: 0, count: scenes.length, paused: false });
  const onState = useCallback((s: PlayerState) => setSt(s), []);
  const onTick = useCallback((t: number) => { if (fill.current) fill.current.style.width = `${t * 100}%`; }, []);
  const { meta } = project;
  const facts = (project.facts ?? []).slice(0, 3);
  const open = project.externalLink
    ? <a href={project.externalLink} target="_blank" rel="noreferrer" className="d-btn d-btn--ink">Open case study</a>
    : <Link to={`/work/${meta.slug}`} className="d-btn d-btn--ink">Open case study</Link>;

  return (
    <div className="d-card p-3 md:p-4 flex flex-col gap-3">
      <PreviewPlayer key={meta.slug} ref={player} scenes={scenes} accent={meta.accent} chromeless onState={onState} onTick={onTick} className="!rounded-[12px]" />

      <div className="d-transport px-1">
        <button type="button" aria-label="Previous project" onClick={onPrev}><i className="ph-fill ph-skip-back text-[15px]" /></button>
        <button type="button" className="play" aria-label={st.paused ? 'Play' : 'Pause'} onClick={() => player.current?.toggle()}>
          <i className={`ph-fill ${st.paused ? 'ph-play' : 'ph-pause'} text-[15px]`} />
        </button>
        <button type="button" aria-label="Next project" onClick={onNext}><i className="ph-fill ph-skip-forward text-[15px]" /></button>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 pl-1">
          <div className="flex items-center justify-between gap-3 d-meta">
            <span className="truncate">{st.caption ?? ''}</span>
            <span className="shrink-0 tabular-nums">{st.idx + 1} / {st.count}</span>
          </div>
          <div className="flex gap-1">
            {scenes.map((s, k) => (
              <button key={s.id} type="button" aria-label={`Scene ${k + 1}`} onClick={() => player.current?.jump(k)} className="d-seg">
                {k < st.idx ? <i style={{ width: '100%' }} /> : k === st.idx ? <i ref={fill} /> : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--line)] pt-4 px-1 pb-1 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="d-meta">{index + 1} of {total} · {meta.company} · {meta.year}</div>
          <h2 className="text-[19px] md:text-[21px] font-semibold leading-[1.25] tracking-[-0.015em] text-[var(--ink)]">{meta.title}</h2>
          <p className="text-[14px] leading-[1.55] text-[var(--ink-2)] max-w-[60ch]">{firstSentence(meta.oneLiner)}</p>
          {facts.length > 0 && <div className="d-meta pt-0.5">{facts.join('  ·  ')}</div>}
        </div>
        <div className="shrink-0">{open}</div>
      </div>
    </div>
  );
};
