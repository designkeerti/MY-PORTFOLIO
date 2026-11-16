import type { Job } from './sources';
import type { Profile } from './resume';
import { SKILLS, skillsIn } from './skills';

/**
 * Sorting thousands of openings down to the few worth a look, in two passes. First a cheap
 * one in the browser: does the title name the same job, is the place right. Then the
 * survivors are ranked by meaning against the profile (an open embedding model, /api/rank),
 * so "led usability studies" finds "user research" without sharing a word.
 */

export type Where = 'anywhere' | 'remote' | 'near';
export type Scored = { job: Job; score: number; title: number; meaning?: number };

const LEVEL = /\b(senior|sr|staff|lead|principal|junior|jr|associate|intern(ship)?|head of|director of|vp of|i{1,3}|iv|mid|level \d)\b/g;
const STOP = new Set(['of', 'and', 'the', 'for', 'to', 'in', 'at', 'a', 'an', 'with', 'on', '&', '-', '/']);
// words that name the same thing in a title (ux, ui and the like are all product design)
const SAME: Record<string, string> = {
  developer: 'engineer', dev: 'engineer', swe: 'engineer', designer: 'design',
  ux: 'product', ui: 'product', interaction: 'product', experience: 'product', user: 'product',
};
const words = (s: string) => s.toLowerCase().replace(LEVEL, ' ').replace(/[^a-z0-9+#.]+/g, ' ').split(' ').filter(w => w && !STOP.has(w)).map(w => SAME[w] ?? w);

/**
 * How well a job's title names one of the titles asked for. The kind of role must match
 * (designer, engineer), and so must its qualifier when both have one: an "Instructional
 * Designer" isn't a "Product Designer", though a plain "Designer" might be.
 */
export function titleFit(title: string, targets: string[]) {
  const words0 = words(title);
  const have = new Set(words0);
  let best = 0;
  for (const t of targets) {
    const want = [...new Set(words(t))];
    if (!want.length) continue;
    const head = want[want.length - 1];
    if (!have.has(head)) continue;
    const wantQ = want.filter(w => w !== head), haveQ = words0.filter(w => w !== head);
    if (wantQ.length && haveQ.length && !wantQ.some(q => have.has(q))) continue;
    best = Math.max(best, want.filter(w => have.has(w)).length / want.length, wantQ.length && !haveQ.length ? 0.6 : 0);
  }
  return best;
}

const lower = (xs: string[]) => xs.map(x => x.toLowerCase().trim()).filter(Boolean);
// cities known by two names
const ALSO: Record<string, string> = {
  bengaluru: 'bangalore', bangalore: 'bengaluru', gurugram: 'gurgaon', gurgaon: 'gurugram', mumbai: 'bombay', chennai: 'madras',
  'new delhi': 'delhi', delhi: 'new delhi', kolkata: 'calcutta', 'new york': 'nyc', 'san francisco': 'sf bay area',
};
/** places named in a location string that the person is in or wants */
const placeHit = (loc: string, places: string[]) => {
  const l = loc.toLowerCase();
  return places.some(p => l.includes(p) || (ALSO[p] !== undefined && l.includes(ALSO[p])));
};
/** a remote job they could take: no region named, or one they're in */
function remoteOpen(loc: string, places: string[]) {
  const l = loc.toLowerCase();
  if (/anywhere|worldwide|global/.test(l)) return true;
  const named = l.replace(/remote|\(|\)|,|-/g, ' ').trim();
  return !named || placeHit(l, places);
}

export function placeFit(job: Job, where: Where, places: string[]) {
  if (where === 'anywhere') return true;
  if (where === 'remote') return job.remote;
  const ps = lower(places);
  if (!ps.length) return true;
  return placeHit(job.location, ps) || (job.remote && remoteOpen(job.location, ps));
}

/** seniority that is clearly off (an intern role for a senior, a director role for a junior) */
function levelOff(title: string, seniority: string) {
  const t = title.toLowerCase();
  if (['senior', 'lead', 'principal', 'executive'].includes(seniority)) return /\b(intern|internship|junior|jr|graduate|trainee|apprentice)\b/.test(t);
  if (['intern', 'junior'].includes(seniority)) return /\b(staff|principal|director|head of|vp|chief)\b/.test(t);
  return false;
}

export function shortlist(jobs: Job[], p: Profile, where: Where, places: string[], max = 250): Scored[] {
  return jobs
    .filter(j => placeFit(j, where, places) && !levelOff(j.title, p.seniority))
    .map(job => ({ job, title: titleFit(job.title, p.titles), score: 0 }))
    .filter(s => s.title >= 0.5)
    .sort((a, b) => b.title - a.title || (b.job.posted ?? 0) - (a.job.posted ?? 0))
    .slice(0, max);
}

/** `seen` keeps the model's scores, so a change of filter only asks about new jobs */
export async function rank(list: Scored[], p: Profile, seen: Map<string, number>): Promise<{ list: Scored[]; byMeaning: boolean }> {
  const query = `${p.titles.join(', ')}. ${p.headline}. Skills: ${p.skills.join(', ')}`;
  const ask = list.filter(s => !seen.has(s.job.id));
  let ok = !ask.length && seen.size > 0;
  if (ask.length) {
    const docs = ask.map(({ job: j }) => `${j.title} at ${j.company}. ${j.location}. ${j.text.slice(0, 700)}`);
    try {
      const r = await fetch('/api/rank', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, docs }) });
      if (r.ok) { const scores: number[] = (await r.json()).scores; ask.forEach((s, i) => seen.set(s.job.id, scores[i])); ok = true; }
    } catch { /* falls back to titles */ }
  }
  const out = list.map(s => {
    const m = seen.get(s.job.id);
    const skill = s.job.text ? skillMatch(s.job.text, p.skills).have.length / Math.max(4, Math.min(10, p.skills.length)) : 0.4;
    // bge's similarities for related text sit around .5 to .8
    const meaning = m === undefined ? undefined : Math.max(0, Math.min(1, (m - 0.5) / 0.26));
    const score = meaning === undefined ? 0.75 * s.title + 0.25 * Math.min(1, skill) : 0.5 * meaning + 0.35 * s.title + 0.15 * Math.min(1, skill);
    return { ...s, meaning, score };
  });
  return { list: out.sort((a, b) => b.score - a.score), byMeaning: ok };
}

/** which of their skills a posting mentions, and what else it asks for */
export function skillMatch(text: string, skills: string[]) {
  const have: string[] = [];
  for (const s of skills) {
    const known = SKILLS.find(k => k.name.toLowerCase() === s.toLowerCase());
    const re = known?.re ?? new RegExp(`(?:^|[^a-z0-9])${s.toLowerCase().replace(/[.*+?^${}()[\]\\/|]/g, '\\$&')}(?![a-z0-9])`, 'i');
    if (re.test(text)) have.push(known?.name ?? s);
  }
  const mine = new Set(have.map(h => h.toLowerCase()));
  const all = new Set(skills.map(s => s.toLowerCase()));
  const lack = skillsIn(text).filter(n => !mine.has(n.toLowerCase()) && !all.has(n.toLowerCase())).slice(0, 4);
  return { have, lack };
}

/** LinkedIn people searches that open on LinkedIn itself, for a referral */
export function referralSearches(job: Job, p: Profile) {
  const li = (q: string) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(q)}`;
  const role = (p.titles[0] ?? job.title).replace(LEVEL, '').replace(/\s+/g, ' ').trim();
  const t = job.title.toLowerCase();
  const lead = /design|ux|ui/.test(t) ? 'Design Manager' : /engineer|developer/.test(t) ? 'Engineering Manager' : /research/.test(t) ? 'Research Manager'
    : /product manager/.test(t) ? 'Director of Product' : /data|analyst|scientist/.test(t) ? 'Data Science Manager' : /market/.test(t) ? 'Marketing Manager' : 'Hiring Manager';
  return [
    { label: `${lead}s at ${job.company}`, note: 'Likely the hiring manager', url: li(`${lead} ${job.company}`) },
    { label: `${role}s at ${job.company}`, note: 'Your future teammates', url: li(`${role} ${job.company}`) },
    { label: `Recruiters at ${job.company}`, note: 'Can pass your profile on', url: li(`recruiter ${job.company}`) },
    ...p.companies.slice(0, 2).map(c => ({ label: `Ex-${c} at ${job.company}`, note: 'You share a past employer', url: li(`${job.company} ${c}`) })),
    ...p.schools.slice(0, 1).map(s => ({ label: `${s} alumni at ${job.company}`, note: 'You share a school', url: li(`${job.company} ${s}`) })),
  ];
}
