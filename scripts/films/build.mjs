/**
 * Builds a narrated case-study film: voice, frames, captions, chapters.
 *
 *   npx vite --port 5173 &            (the dev server; /__film/:slug is dev-only)
 *   node scripts/films/build.mjs cbs  (or several slugs)
 *
 * Needs ffmpeg, Playwright's Chromium, and a Python with the edge-tts package
 * (FILM_PYTHON=/path/to/python). Writes public/films/{slug}.mp4, .vtt, .jpg, .json.
 *
 * How it stays in sync: each beat's narration is generated first and its length sets the
 * beat's length. The page then runs on Playwright's fake clock and is screenshotted one
 * frame at a time, with every web animation (CSS and framer-motion's WAAPI ones) stepped
 * to the same clock, so a slow machine makes a slow render, never a drifting film.
 */
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Playwright may be installed globally (CommonJS resolution finds it; ESM does not)
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const OUT = path.join(ROOT, 'public/films');
const WORK = process.env.FILM_WORK || path.join(ROOT, 'node_modules/.cache/films');
const PY = process.env.FILM_PYTHON || 'python3';
const URL_ = process.env.FILM_URL || 'http://localhost:5173';
const FPS = 30, SCALE = Number(process.env.FILM_SCALE || 1.5); // 1280×720 stage → 1920×1080

const run = (cmd, args, input) => new Promise((res, rej) => {
  const p = spawn(cmd, args, { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
  if (input) { p.stdin.write(input); p.stdin.end(); }
  p.on('close', c => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
});
const dur = f => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());
const ts = s => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = (s % 60).toFixed(3).padStart(6, '0'); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${x}`; };

/** split a long caption at the comma nearest its middle */
function cues(text, t0, t1) {
  if (text.length <= 84) return [[t0, t1, text]];
  const mid = text.length / 2; let best = -1;
  for (let i = 0; i < text.length; i++) if (/[,:;]/.test(text[i]) && text[i + 1] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  if (best < 0) { best = text.lastIndexOf(' ', mid); if (best < 0) return [[t0, t1, text]]; }
  const a = text.slice(0, best + 1).trim(), b = text.slice(best + 1).trim();
  const tm = t0 + (t1 - t0) * (a.length / (a.length + b.length));
  return [...cues(a, t0, tm), ...cues(b, tm, t1)];
}

async function build(slug) {
  const work = path.join(WORK, slug);
  fs.mkdirSync(work, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // 1. the script
  let page = await browser.newPage();
  await page.goto(`${URL_}/__film/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__filmBeats);
  const beats = await page.evaluate(() => window.__filmBeats);
  await page.close();
  console.log(`${slug}: ${beats.length} beats`);

  // 2. the voice
  await run(PY, [path.join(ROOT, 'scripts/films/tts.py'), work], JSON.stringify(beats.map(b => b.spoken || b.say)));

  // 3. the timing: a breath before each line, a longer one before a new chapter
  let t = 0;
  const timing = { beats: [], total: 0 };
  const audio = [];
  beats.forEach((b, i) => {
    const pre = i === 0 ? 0.9 : 0.3;
    const next = beats[i + 1];
    const post = !next ? 2.2 : next.chapter ? 0.85 : 0.45;
    const len = dur(path.join(work, `b${i}.mp3`));
    const marks = JSON.parse(fs.readFileSync(path.join(work, `b${i}.json`), 'utf8'));
    const d = pre + len + post;
    timing.beats.push({ start: +t.toFixed(3), dur: +d.toFixed(3), marks: marks.map(m => +(pre + m.t).toFixed(3)) });
    audio.push({ file: path.join(work, `b${i}.mp3`), at: t + pre, len, marks, say: b.say });
    t += d;
  });
  timing.total = +t.toFixed(3);
  console.log(`${slug}: ${t.toFixed(1)}s`);

  // 4. the picture
  page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: SCALE });
  await page.clock.install({ time: 0 });
  await page.addInitScript(tm => {
    window.__filmTiming = tm;
    // framer-motion hands opacity to the browser's own animation clock when it can, and that
    // clock cannot be faked; without element.animate it animates in JS, on the fake clock
    delete Element.prototype.animate;
  }, timing);
  await page.goto(`${URL_}/__film/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__filmReady === true, null, { timeout: 60000 });
  const now0 = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now0 + 50);
  await page.evaluate(() => {
    // every web animation follows the fake clock: pause it, then set its time each frame
    const seen = new WeakMap();
    window.__syncAnims = () => {
      const now = performance.now();
      const docs = [document, ...[...document.querySelectorAll('iframe')].map(f => { try { return f.contentDocument; } catch { return null; } }).filter(Boolean)];
      for (const d of docs) for (const a of d.getAnimations()) {
        if (a.playState === 'finished' || a.playState === 'idle') continue;
        if (!seen.has(a)) { seen.set(a, now - (a.currentTime ?? 0)); a.pause(); }
        const local = now - seen.get(a);
        const end = a.effect?.getComputedTiming().endTime ?? Infinity;
        if (local >= end && end !== Infinity) a.finish(); else a.currentTime = local;
      }
      const seeks = [...document.querySelectorAll('video')].filter(v => v.seeking).map(v => new Promise(r => v.addEventListener('seeked', r, { once: true })));
      return Promise.all(seeks);
    };
    // let React and framer-motion finish the work a tick queued (MessageChannel is not faked)
    window.__settle = () => new Promise(r => { const c = new MessageChannel(); c.port1.onmessage = () => { const c2 = new MessageChannel(); c2.port1.onmessage = r; c2.port2.postMessage(0); }; c.port2.postMessage(0); });
    window.__filmGo();
  });

  if (process.env.FILM_STORYBOARD) {
    // one frame from the middle of each beat, to check layouts without a full render
    let at = 0;
    for (const [i, b] of timing.beats.entries()) {
      const target = (b.start + Math.min(b.dur - 0.4, 5)) * 1000;
      while (at < target) { await page.clock.runFor(100); at += 100; await page.evaluate(() => window.__settle()); await page.evaluate(() => window.__syncAnims()); }
      await page.screenshot({ path: path.join(work, `sb-${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 80 });
    }
    await browser.close();
    console.log(`${slug}: storyboard in ${work}`);
    return;
  }

  const silent = path.join(work, 'picture.mp4');
  const W = Math.round(1280 * SCALE), H = Math.round(720 * SCALE);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-vf', `scale=${W}:${H}`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.ceil(Math.min(timing.total, Number(process.env.FILM_SECONDS || Infinity)) * FPS);
  const started = Date.now();
  for (let f = 0; f < frames; f++) {
    await page.clock.runFor(1000 / FPS);
    await page.evaluate(() => window.__settle());
    await page.evaluate(() => window.__syncAnims());
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % (FPS * 10) === 0) console.log(`  frame ${f}/${frames} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();

  // 5. the soundtrack: every line placed at its moment
  const voice = path.join(work, 'voice.m4a');
  const inputs = audio.flatMap(a => ['-i', a.file]);
  const filt = audio.map((a, i) => `[${i}:a]adelay=${Math.round(a.at * 1000)}:all=1[a${i}]`).join(';')
    + ';' + audio.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${audio.length}:normalize=0,apad=whole_dur=${timing.total},loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
  await run('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', filt, '-map', '[out]', '-t', String(timing.total), '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', voice]);

  // 6. the film
  const mp4 = path.join(OUT, `${slug}.mp4`);
  await run('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-i', voice, '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', process.env.FILM_CRF || '24', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', '-shortest', mp4]);
  await run('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(Math.min(2.6, timing.beats[0].dur - 0.2)), '-i', mp4, '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '4', path.join(OUT, `${slug}.jpg`)]);

  // 7. captions and chapters
  let vtt = 'WEBVTT\n\n';
  for (const a of audio) {
    const sents = a.say.match(/[^.!?]+[.!?]+[”"’]?|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) ?? [a.say];
    const useSay = sents.length === a.marks.length;
    a.marks.forEach((m, k) => {
      const s0 = a.at + m.t, s1 = a.at + (a.marks[k + 1]?.t ?? a.len);
      for (const [c0, c1, text] of cues(useSay ? sents[k] : m.text, s0, Math.max(s0 + 0.8, s1 - 0.05))) vtt += `${ts(c0)} --> ${ts(c1)}\n${text}\n\n`;
    });
  }
  fs.writeFileSync(path.join(OUT, `${slug}.vtt`), vtt);
  const chapters = beats.map((b, i) => b.chapter ? { t: timing.beats[i].start, label: b.chapter } : null).filter(Boolean);
  fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify({ duration: timing.total, chapters }, null, 1));
  console.log(`${slug}: done, ${(fs.statSync(mp4).size / 1e6).toFixed(1)} MB`);
}

for (const slug of process.argv.slice(2)) await build(slug);
