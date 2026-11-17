import { BOARDS, type Board } from './boards';

/**
 * Where the jobs come from: company boards (Greenhouse, Lever, Ashby), the job searches of
 * Workable and SmartRecruiters (each covering thousands of companies), remote job boards, the
 * monthly Hacker News hiring thread, and Adzuna where it's set up. Most are fetched from the
 * visitor's browser; the ones that don't allow that go through /api, passed through unread.
 * Every job keeps a link to its original posting, and each board is credited by name, as
 * their terms ask.
 */

export type Source = 'Greenhouse' | 'Lever' | 'Ashby' | 'Workable' | 'SmartRecruiters' | 'Remotive' | 'Jobicy' | 'Himalayas' | 'RemoteOK' | 'Hacker News' | 'Adzuna';
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
  Workable: 'https://jobs.workable.com', SmartRecruiters: 'https://jobs.smartrecruiters.com', RemoteOK: 'https://remoteok.com',
  'Hacker News': 'https://news.ycombinator.com', Adzuna: 'https://www.adzuna.com',
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
async function workable(q: string, where = ''): Promise<Job[]> {
  const d = await get<{ jobs?: any[] }>(`/api/jobs/workable?q=${encodeURIComponent(q)}&where=${encodeURIComponent(where)}`);
  return (d.jobs ?? []).map(j => {
    const location = [j.location?.city, j.location?.countryName].filter(Boolean).join(', ') || (j.locations ?? []).filter((l: string) => l !== 'TELECOMMUTE').join(', ');
    const remote = j.workplace === 'remote' || (j.locations ?? []).includes('TELECOMMUTE');
    return {
      id: `wk-${j.id}`, title: j.title, company: j.company?.title ?? '', location: remote ? `Remote${location ? ` (${location})` : ''}` : location, remote,
      url: j.url, posted: time(j.created), source: 'Workable', text: plain(`${j.description ?? ''} ${j.requirementsSection ?? ''}`),
    } satisfies Job;
  });
}

async function smartrecruiters(q: string): Promise<Job[]> {
  const d = await get<{ content?: any[] }>(`/api/jobs/smartrecruiters?q=${encodeURIComponent(q)}`);
  return (d.content ?? []).map(j => ({
    id: `sr-${j.id}`, title: j.name, company: j.company?.name ?? '', location: j.location?.remote ? `Remote (${j.shortLocation})` : j.shortLocation ?? '',
    remote: !!j.location?.remote, url: j.applyUrl, posted: time(j.releasedDate), source: 'SmartRecruiters', text: '',
    more: () => get<{ jobAd?: { sections?: Record<string, { text?: string }> } }>(j.actions.details)
      .then(x => plain(Object.values(x.jobAd?.sections ?? {}).map(v => v.text ?? '').join(' '))),
  } satisfies Job));
}

async function remoteok(): Promise<Job[]> {
  const d = await get<any[]>('https://remoteok.com/api');
  // the first entry is their terms, not a job
  return d.filter(j => j.id && j.position).map(j => ({
    id: `ro-${j.id}`, title: plain(j.position), company: plain(j.company ?? ''), location: j.location ? `Remote (${plain(j.location)})` : 'Remote, anywhere',
    remote: true, url: j.url, posted: time(j.date), source: 'RemoteOK', text: plain(j.description ?? ''),
  }));
}

let thread: Promise<number | null> | null = null;
/** the month's "Ask HN: Who is hiring?" thread, where each top comment is one company's post */
async function hackerNews(q: string): Promise<Job[]> {
  thread ??= get<{ hits: any[] }>('https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&hitsPerPage=6')
    .then(d => Number(d.hits.find(h => /who is hiring/i.test(h.title))?.objectID) || null).catch(() => (thread = null));
  const id = await thread;
  if (!id) return [];
  const d = await get<{ hits: any[] }>(`https://hn.algolia.com/api/v1/search?tags=comment,story_${id}&query=${encodeURIComponent(q)}&hitsPerPage=100`);
  return d.hits.filter(h => h.parent_id === id && h.comment_text).map(h => {
    // "Company | Role | Place | REMOTE | ..." on the first line, by custom
    const first = plain(String(h.comment_text).split(/<p>/i)[0]);
    const parts = first.split('|').map(p => p.trim()).filter(Boolean);
    const role = parts.find(p => /design|engineer|developer|manager|research|scientist|analyst|lead|writer|market/i.test(p)) ?? q;
    const place = parts.find(p => p !== role && p !== parts[0] && /remote|onsite|on-site|hybrid|[a-z]+, [a-z]+|london|york|francisco|berlin|india|bangalore|bengaluru/i.test(p)) ?? '';
    return {
      id: `hn-${h.objectID}`, title: role.slice(0, 120), company: (parts[0] ?? 'A company').slice(0, 60), location: place.slice(0, 80),
      remote: /remote/i.test(first), url: `https://news.ycombinator.com/item?id=${h.objectID}`, posted: time(h.created_at_i),
      source: 'Hacker News', text: plain(h.comment_text),
    } satisfies Job;
  });
}

const COUNTRY: [RegExp, string][] = [
  [/india|bengaluru|bangalore|mumbai|delhi|gurgaon|gurugram|noida|pune|hyderabad|chennai|kolkata|ahmedabad/i, 'in'],
  [/united kingdom|\buk\b|england|london|manchester/i, 'gb'], [/united states|\busa?\b|new york|san francisco|seattle|austin|boston/i, 'us'],
  [/canada|toronto|vancouver/i, 'ca'], [/australia|sydney|melbourne/i, 'au'], [/germany|berlin|munich/i, 'de'], [/france|paris/i, 'fr'],
  [/netherlands|amsterdam/i, 'nl'], [/singapore/i, 'sg'], [/spain|madrid|barcelona/i, 'es'], [/italy|milan|rome/i, 'it'], [/poland|warsaw/i, 'pl'],
  [/brazil|são paulo|sao paulo/i, 'br'], [/mexico/i, 'mx'], [/switzerland|zurich/i, 'ch'], [/austria|vienna/i, 'at'], [/belgium|brussels/i, 'be'],
  [/new zealand|auckland/i, 'nz'], [/south africa|cape town|johannesburg/i, 'za'],
];
const countryOf = (places: string[]) => COUNTRY.find(([re]) => places.some(p => re.test(p)))?.[1];

async function adzuna(q: string, country: string): Promise<Job[]> {
  const d = await get<{ results?: any[] }>(`/api/jobs/adzuna?q=${encodeURIComponent(q)}&country=${country}`);
  return (d.results ?? []).map(j => ({
    id: `az-${j.id}`, title: plain(j.title), company: plain(j.company?.display_name ?? ''), location: plain(j.location?.display_name ?? ''),
    remote: REMOTE.test(`${j.title} ${j.location?.display_name ?? ''}`), url: j.redirect_url, posted: time(j.created), source: 'Adzuna',
    text: plain(j.description ?? ''),
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Every source at once; `onPart` hears each as it lands (so the count can climb). The job
 * searches run once for each title (and for the person's place, where they take one); the
 * company boards and RemoteOK are fetched whole.
 */
export async function gather(titles: string[], at: { near: boolean; places: string[] }, onPart: (jobs: Job[], done: number, total: number) => void) {
  const qs = [...new Set(titles.map(t => t.trim()).filter(Boolean))].slice(0, 3);
  const place = at.near ? at.places[0] ?? '' : '';
  const country = at.near ? countryOf(at.places) : undefined;
  const tasks: (() => Promise<Job[]>)[] = [
    ...BOARDS.map(b => () => board(b)),
    () => remoteok(),
    // Himalayas turns away bursts from Cloudflare's shared addresses: one search, the best title
    ...qs.slice(0, 1).map(q => () => himalayas(q, 1)),
    ...qs.flatMap(q => [
      () => remotive(q), () => jobicy(q),
      () => workable(q), ...(place ? [() => workable(q, place)] : []),
      () => smartrecruiters(q), () => hackerNews(q),
      ...(country ? [() => adzuna(q, country)] : []),
    ]),
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
