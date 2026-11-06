/**
 * Everything is served from static assets, except that the case-study films need byte
 * ranges: Safari will not play a video whose server ignores `Range`, and the static asset
 * handler answers with the whole file. So /films/* runs through here first, and a ranged
 * request gets a 206 with just the bytes asked for.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const range = request.headers.get('Range');
    if (!url.pathname.startsWith('/films/')) return env.ASSETS.fetch(request);

    const res = await env.ASSETS.fetch(new Request(url.toString()));
    const headers = new Headers(res.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=86400');
    if (res.status !== 200) return new Response(res.body, { status: res.status, headers });
    // the asset response carries no length, so take the file (a few MB) and slice it natively
    const buf = await res.arrayBuffer();
    const size = buf.byteLength;
    headers.set('Content-Length', String(size));
    const head = request.method === 'HEAD';

    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!m || (m[1] === '' && m[2] === '')) return new Response(head ? null : buf, { status: 200, headers });
    let start, end;
    if (m[1] === '') { start = Math.max(0, size - Number(m[2])); end = size - 1; }   // the last N bytes
    else { start = Number(m[1]); end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1); }
    if (start >= size || start > end) {
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' } });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    return new Response(head ? null : buf.slice(start, end + 1), { status: 206, headers });
  },
};
