import { BOARDS, type Board } from './boards';

/**
 * Where the jobs come from, all fetched from the visitor's browser except Himalayas (through
 * /api, it doesn't allow browser requests). Every job keeps a link to its original posting,
 * and the remote boards are credited by name, as their terms ask.
 */

export type Source = 'Greenhouse' | 'Lever' | 'Ashby' | 'Remotive' | 'Jobicy' | 'Himalayas';
export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  posted?: number;
  source: Source;
  /** the posting as plain text; a Greenhouse job loads it when it's needed (`more`) */
  text: string;
  more?: () => Promise<string>;
};

export const SOURCE_SITES: Record<Source, string> = {
  Greenhouse: 'https://www.greenhouse.com', Lever: 'https://www.lever.co', Ashby: 'https://www.ashbyhq.com',
  Remotive: 'https://remotive.com', Jobicy: 'https://jobicy.com', Himalayas: 'https://himalayas.app',
};

const REMOTE = /remote|anywhere|worldwide|distributed|work from home/i;

/** HTML (or HTML written as escaped text, as Greenhouse sends it) into plain text */
export function plain(html: string) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let text = doc.body.textContent ?? '';
  if (/<\/?[a-z][\s\S]*>/i.test(text)) text = new DOMParser().parseFromString(text, 'text/html').body.textContent ?? '';
  return text.replace(/\s+/g, ' ').trim();
}

async function get<T>(url: string, ms = 15000): Promise<T> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error(`${r.status}`);
    return await r.json() as T;
  } finally { clearTimeout(t); }
}
const time = (v: unknown) => { const n = typeof v === 'number' ? (v < 1e12 ? v * 1000 : v) : Date.parse(String(v)); return Number.isFinite(n) ? n : undefined; };

/* eslint-disable @typescript-eslint/no-explicit-any */
async function board(b: Board): Promise<Job[]> {
  if (b.ats === 'greenhouse') {
    const d = await get<{ jobs: any[] }>(`https://boards-api.greenhouse.io/v1/boards/${b.slug}/jobs`);
    return d.jobs.map(j => {
      const location = j.location?.name ?? '';
      return {
        id: `gh-${b.slug}-${j.id}`, title: j.title, company: b.name, location, remote: REMOTE.test(location), url: j.absolute_url,
        posted: time(j.updated_at), source: 'Greenhouse', text: '',
        more: () => get<{ content: string }>(`https://boards-api.greenhouse.io/v1/boards/${b.slug}/jobs/${j.id}`).then(x => plain(x.content)),
      } satisfies Job;
    });
  }
  if (b.ats === 'lever') {
    const d = await get<any[]>(`https://api.lever.co/v0/postings/${b.slug}?mode=json`);
    return d.map(j => {
      const location = j.categories?.location ?? (j.categories?.allLocations ?? []).join(', ');
      const lists = (j.lists ?? []).map((l: any) => `${l.text}: ${plain(l.content)}`).join(' ');
      return {
        id: `lv-${b.slug}-${j.id}`, title: j.text, company: b.name, location, remote: j.workplaceType === 'remote' || REMOTE.test(location),
        url: j.hostedUrl, posted: time(j.createdAt), source: 'Lever', text: `${j.descriptionPlain ?? ''} ${lists} ${j.additionalPlain ?? ''}`.trim(),
      } satisfies Job;
    });
  }
  const d = await get<{ jobs: any[] }>(`https://api.ashbyhq.com/posting-api/job-board/${b.slug}`);
  return d.jobs.filter(j => j.isListed !== false).map(j => {
    const location = [j.location, ...(j.secondaryLocations ?? []).map((l: any) => l.location)].filter(Boolean).join(', ');
    return {
      id: `ab-${b.slug}-${j.id}`, title: j.title, company: b.name, location, remote: !!j.isRemote || REMOTE.test(location),
      url: j.jobUrl, posted: time(j.publishedAt), source: 'Ashby', text: j.descriptionPlain ?? plain(j.descriptionHtml ?? ''),
    } satisfies Job;
  });
}

async function remotive(q: string): Promise<Job[]> {
  const d = await get<{ jobs: any[] }>(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}`);
  return d.jobs.map(j => ({
    id: `rm-${j.id}`, title: j.title, company: j.company_name, location: j.candidate_required_location || 'Remote', remote: true,
    url: j.url, posted: time(j.publication_date), source: 'Remotive', text: plain(j.description),
  }));
}

async function jobicy(q: string): Promise<Job[]> {
  const d = await get<{ jobs?: any[] }>(`https://jobicy.com/api/v2/remote-jobs?count=50&tag=${encodeURIComponent(q)}`);
  return (d.jobs ?? []).map(j => ({
    id: `jc-${j.id}`, title: plain(j.jobTitle), company: plain(j.companyName), location: j.jobGeo || 'Remote', remote: true,
    url: j.url, posted: time(j.pubDate), source: 'Jobicy', text: plain(j.jobDescription || j.jobExcerpt || ''),
  }));
}

/** "Remote (India)"; a long list of countries stays whole for matching but reads short */
const remoteIn = (places: string[]) => !places.length ? 'Remote, anywhere'
  : places.length <= 4 ? `Remote (${places.join(', ')})` : `Remote (${places.length} countries)\u200b${places.join(', ')}`;

async function himalayas(q: string, page: number): Promise<Job[]> {
  const d = await get<{ jobs?: any[] }>(`/api/jobs/himalayas?q=${encodeURIComponent(q)}&page=${page}`);
  return (d.jobs ?? []).map(j => ({
    id: `hm-${j.guid ?? j.applicationLink}`, title: j.title, company: j.companyName,
    location: remoteIn(j.locationRestrictions ?? []), remote: true,
    url: j.applicationLink ?? j.guid, posted: time(j.pubDate), source: 'Himalayas', text: plain(j.description || j.excerpt || ''),
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Every source at once; `onPart` hears each as it lands (so the count can climb). Searches
 * the remote boards for each title; the company boards are fetched whole.
 */
export async function gather(titles: string[], onPart: (jobs: Job[], done: number, total: number) => void) {
  const qs = [...new Set(titles.map(t => t.trim()).filter(Boolean))].slice(0, 3);
  const tasks: (() => Promise<Job[]>)[] = [
    ...BOARDS.map(b => () => board(b)),
    ...qs.flatMap(q => [() => remotive(q), () => jobicy(q), () => himalayas(q, 1), () => himalayas(q, 2)]),
  ];
  let done = 0;
  const seen = new Set<string>();
  const all: Job[] = [];
  await Promise.all(tasks.map(async task => {
    let jobs: Job[] = [];
    try { jobs = await task(); } catch { /* one board down doesn't stop the rest */ }
    const fresh = jobs.filter(j => {
      if (!j.title || !j.url) return false;
      const key = `${j.company}|${j.title}|${j.location}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    all.push(...fresh);
    onPart(fresh, ++done, tasks.length);
  }));
  return all;
}
