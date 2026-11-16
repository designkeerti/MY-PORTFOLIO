import { skillsIn } from './skills';

/** What the finder knows about a person: from the model, or from the fallback below. */
export type Profile = {
  headline: string;
  titles: string[];
  seniority: string;
  years: number;
  skills: string[];
  locations: string[];
  remote: boolean;
  companies: string[];
  schools: string[];
  summary: string;
};

/** a PDF's text, read in the browser */
export async function pdfText(file: File) {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 8); i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map(it => ('str' in it ? it.str + (it.hasEOL ? '\n' : ' ') : '')).join(''));
  }
  await doc.destroy();
  return pages.join('\n').replace(/[ \t]+/g, ' ').trim();
}

export async function fileText(file: File) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return pdfText(file);
  if (file.type.startsWith('text/') || /\.(txt|md)$/i.test(file.name)) return file.text();
  throw new Error('A PDF works best (or paste the text).');
}

const ROLE = /\b((?:senior|staff|lead|principal|junior|associate)?\s*(?:product|ux|ui|visual|interaction|graphic|brand|motion|software|frontend|front-end|backend|back-end|full[- ]stack|mobile|ios|android|data|machine learning|ml|devops|site reliability|qa|test|marketing|growth|content|sales|account|customer success|operations|project|program|research)?\s*(?:designer|engineer|developer|scientist|analyst|manager|researcher|marketer|writer|lead|architect))\b/gi;

/** a profile without the model: titles from the first lines, skills from the dictionary */
export function roughProfile(text: string): Profile {
  const counts = new Map<string, number>();
  for (const m of text.slice(0, 4000).matchAll(ROLE)) {
    const t = m[1].trim().replace(/\s+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (t.split(' ').length > 1) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const titles = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 3);
  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)].map(m => +m[0]);
  return {
    headline: titles[0] ?? 'Your profile',
    titles: titles.length ? titles : ['Product Designer'],
    seniority: 'mid',
    years: years.length ? Math.max(0, Math.min(40, new Date().getFullYear() - Math.min(...years))) : 0,
    skills: skillsIn(text).slice(0, 20),
    locations: [],
    remote: true,
    companies: [],
    schools: [],
    summary: '',
  };
}

export async function readProfile(text: string): Promise<{ profile: Profile; rough: boolean }> {
  try {
    const r = await fetch('/api/profile', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
    const d = await r.json();
    if (r.ok && d.profile) return { profile: d.profile as Profile, rough: false };
  } catch { /* falls through */ }
  return { profile: roughProfile(text), rough: true };
}
