/**
 * The job finder's backend. The browser fetches most job boards itself; this does the rest:
 *   GET  /api/jobs/himalayas?q=&page=  Himalayas' search (it doesn't allow browser requests)
 *   POST /api/profile  {text}          a resume's text into a profile, by an open model
 *   POST /api/rank     {query, docs}   how close each posting is to the profile, by meaning
 *   POST /api/match    {profile, job}  why it fits, what it asks for, the gaps, a referral note
 * The models run on Cloudflare Workers AI. Nothing is stored: a resume is read and forgotten.
 */

const LLM = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const EMBED = '@cf/baai/bge-base-en-v1.5';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});
const clip = (s, n) => String(s ?? '').slice(0, n);

const PROFILE = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    titles: { type: 'array', items: { type: 'string' } },
    seniority: { type: 'string', enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'principal', 'executive'] },
    years: { type: 'number' },
    skills: { type: 'array', items: { type: 'string' } },
    locations: { type: 'array', items: { type: 'string' } },
    remote: { type: 'boolean' },
    companies: { type: 'array', items: { type: 'string' } },
    schools: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['headline', 'titles', 'seniority', 'years', 'skills', 'locations', 'remote', 'companies', 'schools', 'summary'],
};

const MATCH = {
  type: 'object',
  properties: {
    fit: { type: 'string' },
    requirements: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
    note: { type: 'string' },
  },
  required: ['fit', 'requirements', 'gaps', 'note'],
};

/** the model's JSON, whether it comes back parsed or as text */
function parsed(out) {
  const r = out?.response ?? out;
  if (r && typeof r === 'object') return r;
  const t = String(r ?? '');
  const m = t.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : null;
}

async function ask(env, system, user, schema, maxTokens) {
  const out = await env.AI.run(LLM, {
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    response_format: { type: 'json_schema', json_schema: schema },
    max_tokens: maxTokens,
    temperature: 0.2,
  });
  return parsed(out);
}

export async function api(request, env, url) {
  const path = url.pathname;

  if (path === '/api/jobs/himalayas' && request.method === 'GET') {
    const q = clip(url.searchParams.get('q'), 80);
    const page = Math.max(1, Math.min(5, Number(url.searchParams.get('page')) || 1));
    // Himalayas limits keyless requests from Cloudflare's shared addresses: a free key
    // (HIMALAYAS_KEY, a secret) lifts that; without one, a refusal is retried once and never cached
    const go = () => fetch(`https://himalayas.app/jobs/api/search?q=${encodeURIComponent(q)}&page=${page}`, {
      headers: { 'user-agent': 'Mozilla/5.0 (job finder; keerti-portfolio)', ...(env.HIMALAYAS_KEY ? { authorization: `Bearer ${env.HIMALAYAS_KEY}` } : {}) },
      cf: { cacheTtlByStatus: { '200-299': 3600, '400-599': 0 }, cacheEverything: true },
    });
    let r = await go();
    if (r.status === 429) { await new Promise(res => setTimeout(res, 1200)); r = await go(); }
    // passed straight through: no parsing, so it costs the worker next to nothing
    return new Response(r.body, { status: r.status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=1800' } });
  }

  if (request.method !== 'POST' || !['/api/profile', '/api/rank', '/api/match'].includes(path)) return json({ error: 'Not found' }, 404);
  if (!env.AI) return json({ error: 'The AI part is not set up here.' }, 503);
  if (env.AI_LIMIT) {
    const { success } = await env.AI_LIMIT.limit({ key: `${path}:${request.headers.get('cf-connecting-ip') ?? 'local'}` });
    if (!success) return json({ error: 'That was a lot at once. Give it a minute and try again.' }, 429);
  }
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'Bad request' }, 400);

  try {
    if (path === '/api/profile') {
      const text = clip(body.text, 24000).trim();
      if (text.length < 80) return json({ error: 'That doesn’t look like a resume: there is almost no text in it.' }, 400);
      const profile = await ask(env,
        'You read resumes and return a profile as JSON, to search job boards with. '
        + 'titles: 2 to 4 job titles this person should search for next, as they appear on job boards (e.g. "Senior Product Designer"), the closest fit first. '
        + 'skills: up to 20 concrete skills, methods and tools, each 1 to 3 words, as the resume names them. '
        + 'seniority and years: from the work history (years of full-time work, a number). '
        + 'locations: cities or countries they are based in or say they want; remote: true unless they say they want on-site only. '
        + 'companies: past and present employers. schools: universities and colleges. '
        + 'headline: one line, like "Product designer, 6 years, fintech and mobility". summary: two plain sentences about their strengths. '
        + 'Never include the person’s name, email, phone or address. Use only what the resume says.',
        text, PROFILE, 1400);
      if (!profile) return json({ error: 'Couldn’t read that resume. Try another file.' }, 502);
      return json({ profile });
    }

    if (path === '/api/rank') {
      const query = clip(body.query, 2000);
      const docs = (Array.isArray(body.docs) ? body.docs : []).slice(0, 300).map(d => clip(d, 1200));
      if (!query || !docs.length) return json({ scores: [] });
      // bge reads a short query better with its retrieval instruction in front
      const texts = [`Represent this sentence for searching relevant passages: ${query}`, ...docs];
      const vecs = [];
      for (let i = 0; i < texts.length; i += 100) {
        const out = await env.AI.run(EMBED, { text: texts.slice(i, i + 100) });
        vecs.push(...out.data);
      }
      const norm = v => Math.sqrt(v.reduce((a, x) => a + x * x, 0)) || 1;
      const q = vecs[0], nq = norm(q);
      const scores = vecs.slice(1).map(v => +(v.reduce((a, x, k) => a + x * q[k], 0) / (nq * norm(v))).toFixed(4));
      return json({ scores });
    }

    // match
    const p = body.profile ?? {}, j = body.job ?? {};
    const result = await ask(env,
      'You help a job seeker judge one job posting against their profile. Return JSON. '
      + 'Write to the job seeker as "you". Only state what the posting and the profile actually say; never claim the posting asks for something it does not. '
      + 'fit: 2 or 3 sentences on where they match, naming specific overlaps between the posting and the profile; honest, no hype. '
      + 'requirements: the posting’s 4 to 6 most important requirements, each a short phrase. '
      + 'gaps: requirements the profile does not show, each a short phrase (empty if none). '
      + 'note: a short LinkedIn message (under 80 words) asking someone at the company for a referral or a quick chat about this role: '
      + 'friendly; name the role and one specific, relevant thing from their background in a sentence; no flattery, never say you are impressed or excited, no placeholders except [Name] for the recipient, signed off without a name.',
      `PROFILE\n${clip(JSON.stringify(p), 3000)}\n\nJOB\nTitle: ${clip(j.title, 200)}\nCompany: ${clip(j.company, 120)}\nLocation: ${clip(j.location, 120)}\n\n${clip(j.description, 7000)}`,
      MATCH, 900);
    if (!result) return json({ error: 'Couldn’t read that posting.' }, 502);
    return json(result);
  } catch (e) {
    return json({ error: 'The model is busy right now. Try again in a moment.', detail: String(e?.message ?? e).slice(0, 200) }, 502);
  }
}
