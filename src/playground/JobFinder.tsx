import { useEffect, useMemo, useRef, useState } from 'react';
import { Panel, Button, Segmented, useCopy } from './ui';
import { fileText, readProfile, type Profile } from './jobs/resume';
import { gather, SOURCE_SITES, type Job } from './jobs/sources';
import { rank, referralSearches, shortlist, skillMatch, type Scored, type Where } from './jobs/rank';
import { BOARDS } from './jobs/boards';

/**
 * Upload a resume, get jobs that fit. The resume is read in the browser and an open model
 * (Llama 3.3 on Cloudflare) turns it into a profile you can edit; then 60-odd company boards
 * and three remote job sites are searched from the browser, the right kind of role kept, and
 * the rest ranked by meaning. Each job opens to what it asks for, what's missing, and who to
 * ask for a referral, with a note to send them.
 */

type Stage = 'start' | 'reading' | 'profile' | 'searching' | 'ranking' | 'results';
type Match = { fit: string; requirements: string[]; gaps: string[]; note: string };

const ago = (t?: number) => {
  if (!t) return '';
  const d = Math.floor((Date.now() - t) / 864e5);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 30 ? `${d}d ago` : d < 365 ? `${Math.floor(d / 30)}mo ago` : '';
};
const fitLabel = (s: number) => (s >= 0.72 ? 'Strong fit' : s >= 0.52 ? 'Good fit' : 'Worth a look');
const fmt = (n: number) => n.toLocaleString('en');

export function JobFinder() {
  const [stage, setStage] = useState<Stage>('start');
  const [error, setError] = useState('');
  const [paste, setPaste] = useState('');
  const [pasting, setPasting] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rough, setRough] = useState(false);
  const [where, setWhere] = useState<Where>('anywhere');
  const [places, setPlaces] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0, found: 0 });
  const [all, setAll] = useState<Job[]>([]);
  const [results, setResults] = useState<Scored[]>([]);
  const [byMeaning, setByMeaning] = useState(true);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [shown, setShown] = useState(20);
  const [sort, setSort] = useState<'fit' | 'new'>('fit');
  const [open, setOpen] = useState<string | null>(null);
  const seen = useRef(new Map<string, number>());
  const resultsRef = useRef<HTMLDivElement>(null);

  const placeList = useMemo(() => places.split(',').map(s => s.trim()).filter(Boolean), [places]);
  // the latest choice of place, for a search that was started before it changed
  const now = useRef({ where, placeList });
  now.current = { where, placeList };

  const read = async (get: () => Promise<string>) => {
    setError(''); setStage('reading');
    try {
      const text = (await get()).trim();
      if (text.length < 80) throw new Error('There is almost no text in that file. If it’s a scan, paste the text instead.');
      const r = await readProfile(text);
      setProfile(r.profile); setRough(r.rough);
      setPlaces(r.profile.locations.join(', '));
      setWhere(r.profile.locations.length ? 'near' : 'anywhere');
      setStage('profile');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t read that file.');
      setStage('start');
    }
  };

  const rerank = async (jobs: Job[], p: Profile) => {
    setStage('ranking');
    const { where: w, placeList: ps } = now.current;
    let list = shortlist(jobs.map(j => (texts[j.id] ? { ...j, text: texts[j.id] } : j)), p, w, ps);
    // company boards list titles only: read the shortlisted postings first, so they're ranked
    // on what they say, like the rest
    const missing = list.filter(s => !s.job.text && s.job.more).slice(0, 80);
    const got: Record<string, string> = {};
    for (let i = 0; i < missing.length; i += 10) {
      await Promise.all(missing.slice(i, i + 10).map(s => s.job.more!().then(t => { got[s.job.id] = t; }, () => {})));
    }
    if (missing.length) {
      list = list.map(s => (got[s.job.id] ? { ...s, job: { ...s.job, text: got[s.job.id] } } : s));
      setTexts(prev => ({ ...prev, ...got }));
    }
    const r = await rank(list, p, seen.current);
    setResults(r.list); setByMeaning(r.byMeaning); setShown(20); setOpen(null);
    setStage('results');
  };

  const search = async () => {
    if (!profile) return;
    setError(''); setStage('searching'); seen.current.clear();
    setProgress({ done: 0, total: 0, found: 0 });
    let found = 0;
    const at = { near: now.current.where === 'near', places: now.current.placeList };
    const jobs = await gather(profile.titles, at, (part, done, total) => { found += part.length; setProgress({ done, total, found }); });
    setAll(jobs);
    await rerank(jobs, profile);
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  // a change of place re-sorts what was found (no new search)
  const firstPlace = useRef(true);
  useEffect(() => {
    if (firstPlace.current) { firstPlace.current = false; return; }
    if (stage !== 'results' || !profile) return;
    const t = setTimeout(() => rerank(all, profile), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [where, places]);

  const sorted = useMemo(() => sort === 'fit' ? results : [...results].sort((a, b) => (b.job.posted ?? 0) - (a.job.posted ?? 0)), [results, sort]);
  const visible = sorted.slice(0, shown);

  // postings that come without their text (Greenhouse) load it once they're on screen
  useEffect(() => {
    const need = visible.filter(s => !s.job.text && !texts[s.job.id] && s.job.more);
    if (!need.length) return;
    let live = true;
    (async () => {
      for (let i = 0; i < need.length && live; i += 4) {
        const got = await Promise.all(need.slice(i, i + 4).map(s => s.job.more!().then(t => [s.job.id, t] as const).catch(() => [s.job.id, ' '] as const)));
        if (live) setTexts(prev => ({ ...prev, ...Object.fromEntries(got) }));
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.map(v => v.job.id).join()]);

  const busy = stage === 'reading' || stage === 'searching' || stage === 'ranking';

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-4 md:gap-5 md:px-6">
      <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-5">
        {/* the resume and the profile read from it */}
        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Panel className="flex flex-col gap-4 p-5">
            {!profile || stage === 'reading' ? (
              <>
                <div>
                  <p className="pg-label">Your resume</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink/60">Drop it in and get jobs that fit, what each one asks for, and who to ask for a referral.</p>
                </div>
                {!pasting ? (
                  <label onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) read(() => fileText(f)); }}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-ink/15 bg-white/70 px-4 py-9 text-center transition-colors hover:border-ink/35 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
                    <svg viewBox="0 0 24 24" className="h-8 w-8 text-ink/50" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M12 18v-6M9.5 14.5 12 12l2.5 2.5" /></svg>
                    <span className="text-[15px] font-medium">{stage === 'reading' ? 'Reading your resume…' : 'Choose a PDF, or drop it here'}</span>
                    <span className="text-[12.5px] text-ink/45">PDF or plain text</span>
                    <input type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" className="sr-only" disabled={busy}
                      onChange={e => { const f = e.target.files?.[0]; if (f) read(() => fileText(f)); e.target.value = ''; }} />
                  </label>
                ) : (
                  <div className="flex flex-col gap-2">
                    <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={9} placeholder="Paste your resume’s text"
                      className="w-full resize-y rounded-[14px] border border-ink/14 bg-white px-3.5 py-3 text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink/35 focus:border-ink/35" />
                    <Button onClick={() => read(async () => paste)}>{stage === 'reading' ? 'Reading…' : 'Read it'}</Button>
                  </div>
                )}
                <button type="button" onClick={() => setPasting(!pasting)} className="self-start text-[13px] font-medium text-ink/55 underline decoration-ink/20 underline-offset-4 hover:text-ink">
                  {pasting ? 'Upload a file instead' : 'Or paste the text'}
                </button>
              </>
            ) : (
              <ProfileEditor profile={profile} rough={rough} onChange={setProfile} where={where} setWhere={setWhere} places={places} setPlaces={setPlaces}
                onSearch={search} busy={busy} searched={stage === 'results'}
                onReset={() => { setProfile(null); setResults([]); setAll([]); setStage('start'); }} />
            )}
            {error && <p className="rounded-[12px] bg-[#fdecec] px-3 py-2 text-[13.5px] text-[#9b1c1c]">{error}</p>}
            <p className="text-[12px] leading-relaxed text-ink/45">
              Your resume is read by an open model (Llama 3.3, on Cloudflare) to pick out your roles and skills, and is not stored.
              Job boards are searched from your browser.
            </p>
          </Panel>
        </div>

        {/* the jobs */}
        <div ref={resultsRef} className="flex min-w-0 scroll-mt-24 flex-col gap-3">
          {(stage === 'start' || stage === 'reading' || stage === 'profile') && !results.length && <Intro />}
          {(stage === 'searching' || stage === 'ranking') && (
            <Panel className="flex flex-col gap-3 p-5">
              <p className="text-[16px] font-semibold">{stage === 'searching' ? 'Searching job boards…' : 'Ranking them by how well they fit…'}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-ink/8">
                <div className="h-full rounded-full bg-ink transition-[width] duration-300" style={{ width: stage === 'ranking' ? '100%' : `${progress.total ? (progress.done / progress.total) * 100 : 4}%` }} />
              </div>
              <p className="text-[13.5px] tabular-nums text-ink/55">{progress.done} of {progress.total || '…'} sources checked · {fmt(progress.found)} openings found</p>
            </Panel>
          )}
          {stage === 'results' && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3 px-1">
                <div>
                  <p className="text-[20px] font-semibold tracking-[-0.01em]">{results.length ? `${fmt(results.length)} jobs that fit` : 'Nothing close enough yet'}</p>
                  <p className="mt-0.5 text-[13px] text-ink/50">
                    From {fmt(all.length)} openings{byMeaning ? ', ranked by meaning against your profile' : ', ranked by title (the ranking model was busy)'}.
                  </p>
                </div>
                <Segmented value={sort} onChange={setSort} options={[{ value: 'fit', label: 'Best fit' }, { value: 'new', label: 'Newest' }]} />
              </div>
              {!results.length && (
                <Panel className="p-5 text-[14.5px] leading-relaxed text-ink/65">
                  Try another place (or Anywhere), or add a broader title to your profile, like “Designer” or “Software Engineer”, and search again.
                </Panel>
              )}
              {visible.map(s => (
                <JobCard key={s.job.id} s={s} profile={profile!} text={texts[s.job.id] ?? s.job.text}
                  open={open === s.job.id} onToggle={() => setOpen(open === s.job.id ? null : s.job.id)} />
              ))}
              {shown < sorted.length && <Button variant="ghost" onClick={() => setShown(n => n + 20)} className="self-center">Show more</Button>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Intro() {
  const steps = [
    ['Reads your resume', 'An open model picks out the roles you fit, your skills, where you are and where you’ve worked. You can edit all of it.'],
    ['Searches the boards', `${BOARDS.length} company job boards (Stripe, Figma, Airbnb, Linear, Spotify, Zomato, Groww…), Workable’s and SmartRecruiters’ job searches across thousands of companies, the Hacker News hiring thread, and the remote job boards Remotive, RemoteOK, Jobicy and Himalayas.`],
    ['Ranks by meaning', 'Not just matching words: “led usability studies” counts for a role that asks for user research.'],
    ['Finds you a way in', 'For each job: what it asks for, what you’re missing, the people to ask for a referral on LinkedIn, and a note to send them.'],
  ];
  return (
    <Panel className="grid gap-px overflow-hidden p-0 sm:grid-cols-2">
      {steps.map(([t, d], i) => (
        <div key={t} className="flex flex-col gap-1.5 bg-white/40 p-5">
          <span className="font-mono text-[12px] text-ink/40">0{i + 1}</span>
          <p className="text-[16px] font-semibold tracking-[-0.01em]">{t}</p>
          <p className="text-[14px] leading-relaxed text-ink/60">{d}</p>
        </div>
      ))}
    </Panel>
  );
}

function Chips({ items, onRemove, onAdd, placeholder }: { items: string[]; onRemove: (i: number) => void; onAdd: (v: string) => void; placeholder: string }) {
  const [v, setV] = useState('');
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <span key={t + i} className="inline-flex items-center gap-1 rounded-full border border-ink/12 bg-white py-1 pl-3 pr-1 text-[13px] font-medium text-ink/80">
          {t}
          <button type="button" onClick={() => onRemove(i)} aria-label={`Remove ${t}`} className="flex h-5 w-5 items-center justify-center rounded-full text-ink/40 hover:bg-ink/8 hover:text-ink">×</button>
        </span>
      ))}
      <input value={v} onChange={e => setV(e.target.value)} placeholder={placeholder}
        onKeyDown={e => { if (e.key === 'Enter' && v.trim()) { e.preventDefault(); onAdd(v.trim()); setV(''); } }}
        onBlur={() => { if (v.trim()) { onAdd(v.trim()); setV(''); } }}
        className="min-w-[120px] flex-1 rounded-full border border-dashed border-ink/20 bg-transparent px-3 py-1 text-[13px] outline-none placeholder:text-ink/35 focus:border-ink/40" />
    </div>
  );
}

function ProfileEditor({ profile: p, rough, onChange, where, setWhere, places, setPlaces, onSearch, onReset, busy, searched }: {
  profile: Profile; rough: boolean; onChange: (p: Profile) => void; where: Where; setWhere: (w: Where) => void; places: string; setPlaces: (s: string) => void;
  onSearch: () => void; onReset: () => void; busy: boolean; searched: boolean;
}) {
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => onChange({ ...p, [k]: v });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="pg-label">Your profile</p>
          <p className="mt-1.5 text-[17px] font-semibold leading-snug tracking-[-0.01em]">{p.headline}</p>
          {p.summary && <p className="mt-1 text-[13.5px] leading-relaxed text-ink/55">{p.summary}</p>}
        </div>
        <button type="button" onClick={onReset} className="shrink-0 pt-0.5 text-[13px] font-medium text-ink/50 underline decoration-ink/20 underline-offset-4 hover:text-ink">New resume</button>
      </div>
      {rough && <p className="rounded-[12px] bg-[#fff6e0] px-3 py-2 text-[13px] leading-relaxed text-[#7a5300]">The model was busy, so this was read more roughly. Check the titles and skills below.</p>}
      <div className="flex flex-col gap-2">
        <p className="pg-label">Roles to search</p>
        <Chips items={p.titles} placeholder="Add a role" onRemove={i => set('titles', p.titles.filter((_, k) => k !== i))} onAdd={v => set('titles', [...p.titles, v])} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="pg-label">Skills</p>
        <Chips items={p.skills} placeholder="Add a skill" onRemove={i => set('skills', p.skills.filter((_, k) => k !== i))} onAdd={v => set('skills', [...p.skills, v])} />
      </div>
      <div className="flex flex-col gap-2">
        <Segmented label="Where" value={where} onChange={setWhere}
          options={[{ value: 'near', label: 'Near me + remote' }, { value: 'remote', label: 'Remote only' }, { value: 'anywhere', label: 'Anywhere' }]} />
        {where === 'near' && (
          <input value={places} onChange={e => setPlaces(e.target.value)} placeholder="Cities or countries, e.g. Bengaluru, India"
            className="rounded-[14px] border border-ink/14 bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-ink/35 focus:border-ink/35" />
        )}
      </div>
      <Button onClick={onSearch} className={busy || !p.titles.length ? 'pointer-events-none opacity-50' : ''}>{busy ? 'Searching…' : searched ? 'Search again' : 'Find jobs'}</Button>
    </div>
  );
}

function JobCard({ s, profile, text, open, onToggle }: { s: Scored; profile: Profile; text: string; open: boolean; onToggle: () => void }) {
  const j = s.job;
  const { have, lack } = useMemo(() => (text.trim() ? skillMatch(text, profile.skills) : { have: [], lack: [] }), [text, profile.skills]);
  const pct = Math.round(s.score * 100);
  return (
    <Panel className="flex flex-col gap-3 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-ink text-[15px] font-semibold text-white">{j.company.trim()[0]?.toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <a href={j.url} target="_blank" rel="noreferrer" className="text-[16.5px] font-semibold leading-snug tracking-[-0.01em] hover:underline">{j.title}</a>
          <p className="mt-0.5 text-[13.5px] text-ink/55">
            {j.company} · {j.location.split('\u200b')[0] || 'Location not given'}{j.posted && ago(j.posted) ? ` · ${ago(j.posted)}` : ''}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-right text-[12px] font-semibold tabular-nums text-ink shadow-[0_2px_10px_-6px_rgba(15,30,55,0.4)]" title="How closely this matches your profile">
          {pct}% <span className="font-medium text-ink/50">· {fitLabel(s.score)}</span>
        </span>
      </div>
      {(have.length > 0 || lack.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {have.slice(0, 6).map(h => <span key={h} className="rounded-full bg-ink/[0.07] px-2.5 py-0.5 text-[12px] font-medium text-ink/75">✓ {h}</span>)}
          {lack.map(h => <span key={h} className="rounded-full border border-dashed border-ink/25 px-2.5 py-0.5 text-[12px] font-medium text-ink/50">{h}</span>)}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onToggle} aria-expanded={open}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${open ? 'bg-ink text-white' : 'border border-ink/15 bg-white text-ink hover:border-ink/35'}`}>
          {open ? 'Close' : 'Why it fits · who to ask'}
        </button>
        <a href={j.url} target="_blank" rel="noreferrer" className="rounded-full border border-ink/15 bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink hover:border-ink/35">View posting ↗</a>
        <a href={SOURCE_SITES[j.source]} target="_blank" rel="noreferrer" className="ml-auto text-[12px] text-ink/40 hover:text-ink">via {j.source}</a>
      </div>
      {open && <Detail job={j} text={text} profile={profile} />}
    </Panel>
  );
}

function Detail({ job, text, profile }: { job: Job; text: string; profile: Profile }) {
  const [m, setM] = useState<Match | null>(null);
  const [err, setErr] = useState('');
  const [body, setBody] = useState(text);
  const copy = useCopy();
  const people = useMemo(() => referralSearches(job, profile), [job, profile]);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const t = body.trim() ? body : job.more ? await job.more() : '';
        if (!live) return;
        setBody(t);
        const r = await fetch('/api/match', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ profile, job: { title: job.title, company: job.company, location: job.location, description: t } }),
        });
        const d = await r.json();
        if (!live) return;
        if (!r.ok) throw new Error(d.error);
        setM(d);
      } catch (e) {
        if (live) setErr(e instanceof Error && e.message ? e.message : 'Couldn’t read this one. The posting has everything.');
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.id]);

  return (
    <div className="grid gap-4 border-t border-ink/10 pt-4 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-3">
        <p className="pg-label">Why it fits</p>
        {m ? (
          <>
            <p className="text-[14.5px] leading-relaxed text-ink/80">{m.fit}</p>
            {m.requirements.length > 0 && (
              <div>
                <p className="mb-1.5 text-[12.5px] font-semibold text-ink/55">What it asks for</p>
                <ul className="flex flex-col gap-1 text-[13.5px] leading-snug text-ink/75">
                  {m.requirements.map(r => <li key={r} className="flex gap-2"><span className="text-ink/35">–</span>{r}</li>)}
                </ul>
              </div>
            )}
            {m.gaps.length > 0 && (
              <div>
                <p className="mb-1.5 text-[12.5px] font-semibold text-ink/55">Worth addressing</p>
                <ul className="flex flex-col gap-1 text-[13.5px] leading-snug text-ink/75">
                  {m.gaps.map(r => <li key={r} className="flex gap-2"><span className="text-ink/35">–</span>{r}</li>)}
                </ul>
              </div>
            )}
          </>
        ) : err ? <p className="text-[14px] text-ink/60">{err}</p> : <Skeleton />}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <p className="pg-label">Ask for a referral</p>
        <div className="flex flex-col gap-1">
          {people.map(p => (
            <a key={p.url} href={p.url} target="_blank" rel="noreferrer"
              className="group flex items-center justify-between gap-3 rounded-[12px] px-3 py-2 transition-colors hover:bg-white">
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium text-ink">{p.label}</span>
                <span className="block text-[12px] text-ink/45">{p.note}</span>
              </span>
              <span className="shrink-0 text-[12px] font-medium text-[#0a66c2] group-hover:underline">LinkedIn ↗</span>
            </a>
          ))}
        </div>
        {m?.note && (
          <div className="rounded-[14px] bg-white p-3.5">
            <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink/80">{m.note}</p>
            <button type="button" onClick={() => copy(m.note, 'Note')} className="mt-2 text-[12.5px] font-semibold text-ink/60 hover:text-ink">Copy the note</button>
          </div>
        )}
      </div>
    </div>
  );
}

const Skeleton = () => (
  <div className="flex animate-pulse flex-col gap-2" aria-label="Reading the posting">
    {[92, 100, 76, 60].map((w, i) => <span key={i} className="h-3 rounded-full bg-ink/10" style={{ width: `${w}%` }} />)}
  </div>
);
