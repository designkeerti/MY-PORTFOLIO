import { useEffect, useRef, useState } from 'react';
import { Panel, Slider, Button, useToast } from './ui';

/**
 * A live, animated gradient: four colours mixed by domain-warped noise, with film grain.
 * Everything is a uniform, so the sliders are instant; the exports bake the current values in.
 */

const FRAG = `precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform float u_scale;
uniform float u_warp;
uniform float u_grain;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y) * u_scale;
  float t = u_time;
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.10)), fbm(p + vec2(5.2, 1.3) - t * 0.08));
  vec2 r = vec2(fbm(p + u_warp * q + vec2(1.7, 9.2) + t * 0.12), fbm(p + u_warp * q + vec2(8.3, 2.8) - t * 0.10));
  float f = fbm(p + u_warp * r);
  vec3 col = mix(u_c0, u_c1, clamp(f * f * 2.2, 0.0, 1.0));
  col = mix(col, u_c2, clamp(length(q) * 0.9 - 0.15, 0.0, 1.0));
  col = mix(col, u_c3, clamp(r.x * r.x * 1.4, 0.0, 1.0) * 0.85);
  col += (hash(gl_FragCoord.xy + fract(t * 7.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(col, 1.0);
}`;
const VERT = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }';

type Settings = { colors: [string, string, string, string]; speed: number; scale: number; warp: number; grain: number };
const PRESETS: { name: string; s: Settings }[] = [
  { name: 'Sky', s: { colors: ['#1f78bd', '#8fcbef', '#f7f6f2', '#2c8bc6'], speed: 0.6, scale: 1.6, warp: 1.6, grain: 0.04 } },
  { name: 'Dusk', s: { colors: ['#1b1d4a', '#6a3d8f', '#f08a5d', '#ffd27a'], speed: 0.5, scale: 1.4, warp: 2.0, grain: 0.05 } },
  { name: 'Aurora', s: { colors: ['#06141b', '#11998e', '#38ef7d', '#8e7cc3'], speed: 0.7, scale: 1.8, warp: 2.4, grain: 0.04 } },
  { name: 'Ember', s: { colors: ['#120c0a', '#ff6a2a', '#ffb36b', '#4a1208'], speed: 0.8, scale: 2.0, warp: 1.8, grain: 0.06 } },
  { name: 'Mint', s: { colors: ['#0b3d3a', '#3fb8af', '#e8fff6', '#9be7c4'], speed: 0.45, scale: 1.3, warp: 1.4, grain: 0.03 } },
  { name: 'Mono', s: { colors: ['#0f0f10', '#3a3a3d', '#f2f2f2', '#9d9da3'], speed: 0.5, scale: 1.7, warp: 2.2, grain: 0.07 } },
];

const rgb = (hex: string) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const vec = (hex: string) => rgb(hex).map(v => v.toFixed(3)).join(', ');

export function ShaderStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [s, setS] = useState<Settings>(PRESETS[0].s);
  const [preset, setPreset] = useState('Sky');
  const [playing, setPlaying] = useState(true);
  const live = useRef({ s, playing });
  live.current = { s, playing };
  const drawNow = useRef<() => void>(() => {});
  const toast = useToast();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: true });
    if (!gl) return;
    const sh = (t: number, src: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = { res: U('u_res'), time: U('u_time'), c: [0, 1, 2, 3].map(i => U('u_c' + i)), scale: U('u_scale'), warp: U('u_warp'), grain: U('u_grain') };

    let t = 0, last = performance.now(), raf = 0, onScreen = true;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    };
    const draw = () => {
      const { s } = live.current;
      fit();
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, t);
      s.colors.forEach((c, i) => gl.uniform3fv(u.c[i], rgb(c)));
      gl.uniform1f(u.scale, s.scale); gl.uniform1f(u.warp, s.warp); gl.uniform1f(u.grain, s.grain);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    drawNow.current = draw;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (live.current.playing) t += dt * live.current.s.speed;
      if (onScreen && !document.hidden) draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; });
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); io.disconnect(); gl.getExtension('WEBGL_lose_context')?.loseContext(); };
  }, []);

  const set = (patch: Partial<Settings>) => { setS(v => ({ ...v, ...patch })); setPreset(''); };
  const setColor = (i: number, hex: string) => set({ colors: s.colors.map((c, k) => (k === i ? hex : c)) as Settings['colors'] });

  const glsl = () => `// Gradient by Keerthi Vardhan's Shader Studio\n// uniforms: u_c0 ${s.colors[0]}, u_c1 ${s.colors[1]}, u_c2 ${s.colors[2]}, u_c3 ${s.colors[3]},\n//           u_scale ${s.scale}, u_warp ${s.warp}, u_grain ${s.grain}; advance u_time by seconds x ${s.speed}\n${FRAG}`;
  const html = () => `<canvas id="gradient" style="display:block;width:100%;height:100vh"></canvas>
<script>
(() => {
  const canvas = document.getElementById('gradient');
  const gl = canvas.getContext('webgl');
  const frag = \`${FRAG}\`;
  const vert = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }';
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vert)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag)); gl.linkProgram(p); gl.useProgram(p);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(p, n);
  [[${vec(s.colors[0])}], [${vec(s.colors[1])}], [${vec(s.colors[2])}], [${vec(s.colors[3])}]].forEach((c, i) => gl.uniform3fv(U('u_c' + i), c));
  gl.uniform1f(U('u_scale'), ${s.scale}); gl.uniform1f(U('u_warp'), ${s.warp}); gl.uniform1f(U('u_grain'), ${s.grain});
  const speed = ${s.speed}, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = now => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(U('u_res'), w, h);
    gl.uniform1f(U('u_time'), still ? 0 : now / 1000 * speed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!still) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
</script>`;

  const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); toast(`${what} copied`); } catch { toast('Copy blocked by the browser'); }
  };
  const download = () => {
    drawNow.current();
    canvasRef.current?.toBlob(b => {
      if (!b) return;
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `gradient-${preset.toLowerCase() || 'custom'}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
    }, 'image/png');
  };

  return (
    <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 md:grid-cols-[minmax(0,1fr)_340px] md:gap-5 md:px-6">
      <div className="self-start overflow-hidden rounded-[24px] border border-white/80 bg-white/60 p-2 shadow-[0_30px_60px_-36px_rgba(15,30,55,0.55)] md:sticky md:top-24">
        <canvas ref={canvasRef} className="block aspect-[4/5] w-full rounded-[18px] bg-[#0e1418] sm:aspect-[16/10]" aria-label="Live gradient preview" role="img" />
      </div>
      <Panel className="flex flex-col gap-5 self-start p-5">
        <div>
          <p className="pg-label">Presets</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.name} type="button" onClick={() => { setS(p.s); setPreset(p.name); }}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${preset === p.name ? 'border-ink bg-ink text-white' : 'border-ink/12 bg-white text-ink/75 hover:border-ink/30'}`}>
                <span className="h-3 w-3 rounded-full" style={{ background: `linear-gradient(135deg, ${p.s.colors[0]}, ${p.s.colors[1]}, ${p.s.colors[2]})` }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="pg-label">Colours</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {s.colors.map((c, i) => (
              <label key={i} className="flex flex-col items-center gap-1.5">
                <span className="relative block h-11 w-full overflow-hidden rounded-[12px] border border-ink/10 shadow-inner" style={{ background: c }}>
                  <input type="color" value={c} onChange={e => setColor(i, e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`Colour ${i + 1}`} />
                </span>
                <span className="font-mono text-[11px] uppercase text-ink/55">{c}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3.5">
          <Slider label="Speed" min={0} max={2} step={0.05} value={s.speed} onChange={v => set({ speed: v })} />
          <Slider label="Scale" min={0.5} max={4} step={0.05} value={s.scale} onChange={v => set({ scale: v })} />
          <Slider label="Warp" min={0} max={4} step={0.05} value={s.warp} onChange={v => set({ warp: v })} />
          <Slider label="Grain" min={0} max={0.15} step={0.005} value={s.grain} onChange={v => set({ grain: v })} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setPlaying(p => !p)} variant="ghost">{playing ? 'Pause' : 'Play'}</Button>
          <Button onClick={download} variant="ghost">Download PNG</Button>
          <Button onClick={() => copy(glsl(), 'GLSL')} variant="ghost">Copy GLSL</Button>
          <Button onClick={() => copy(html(), 'HTML snippet')}>Copy HTML snippet</Button>
        </div>
        <p className="text-[13px] leading-relaxed text-ink/55">The HTML snippet is self-contained: paste it into any page and it runs, and it holds still for people who prefer reduced motion.</p>
      </Panel>
    </div>
  );
}
