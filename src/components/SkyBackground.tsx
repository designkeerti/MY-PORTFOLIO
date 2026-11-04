import { useEffect, useRef } from 'react';

/**
 * A live sky behind the home page: a blue gradient with soft, sunlit clouds
 * drifting in two layers, plus a little film grain so it reads as a picture
 * rather than a render. As you scroll past the hero, the sky turns to dusk
 * and then night, so the darker sections below sit on a night sky.
 *
 * One fragment shader, rendered at reduced resolution (the clouds are soft,
 * so it upscales cleanly). Pauses when the tab is hidden; with reduced motion
 * the clouds stand still and only the scroll colour changes.
 */

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_dusk;    // 0 day, 0.5 dusk, 1 night
uniform float u_scroll;  // px scrolled, for a little parallax
uniform float u_octaves;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 7; i++) {
    if (float(i) >= u_octaves) break;
    v += a * noise(p); p = m * p; a *= 0.5;
  }
  return v;
}
// Warp field for billowy, cauliflower-like cloud shapes.
vec2 warp(vec2 p) { return vec2(fbm(p), fbm(p + vec2(5.2, 1.3))); }
void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;                       // 0..1, y up
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float sc = u_scroll / u_res.y;

  // --- sky gradient: day -> dusk -> night ---
  vec3 dayTop = vec3(0.13, 0.52, 0.76), dayLow = vec3(0.72, 0.87, 0.94);
  vec3 duskTop = vec3(0.17, 0.18, 0.36), duskLow = vec3(0.93, 0.62, 0.48);
  vec3 nightTop = vec3(0.047, 0.043, 0.075), nightLow = vec3(0.075, 0.066, 0.11);
  float d1 = smoothstep(0.0, 0.5, u_dusk), d2 = smoothstep(0.5, 1.0, u_dusk);
  vec3 top = mix(mix(dayTop, duskTop, d1), nightTop, d2);
  vec3 low = mix(mix(dayLow, duskLow, d1), nightLow, d2);
  float g = smoothstep(0.0, 1.0, uv.y);
  vec3 col = mix(low, top, pow(g, 0.85));

  // --- clouds: cumulus piled up from the bottom and sides, open sky above ---
  vec2 sunDir = normalize(vec2(-0.45, 0.9));
  vec3 lit = mix(mix(vec3(1.0, 0.995, 0.985), vec3(1.0, 0.80, 0.68), d1), vec3(0.17, 0.16, 0.23), d2);
  vec3 shade = mix(mix(vec3(0.60, 0.69, 0.79), vec3(0.45, 0.35, 0.50), d1), vec3(0.06, 0.055, 0.09), d2);

  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    float scale = mix(2.6, 1.25, fl);                 // far layer: smaller clouds; near layer: big bank
    float speed = mix(0.005, 0.011, fl);
    vec2 cp = p * scale + vec2(u_time * speed, -sc * mix(0.3, 0.6, fl)) + fl * 17.0;
    vec2 q = warp(cp);
    float dens = fbm(cp + 1.7 * q);
    // pile the clouds up from the bottom (and a little in from the sides)
    float rise = mix(0.18, 0.42, fl);
    dens += (rise - uv.y) * mix(0.35, 0.55, fl);
    dens += 0.10 * smoothstep(0.3, 0.0, min(uv.x, 1.0 - uv.x)) * fl;
    float cover = 0.5;
    float a = smoothstep(cover, cover + mix(0.10, 0.05, fl), dens);
    if (a <= 0.001) continue;
    // sunlight: density a step towards the sun (same warp, cheap); thinner that way = lit edge
    float ahead = fbm(cp + sunDir * 0.06 + 1.7 * q) + (rise - (uv.y + sunDir.y * 0.06 / scale)) * mix(0.35, 0.55, fl);
    float light = clamp(0.62 + (dens - ahead) * 7.0, 0.0, 1.0);
    // deeper inside the cloud is a touch greyer: gives the puffs volume
    float depth = smoothstep(cover, cover + 0.35, dens);
    vec3 c = mix(shade, lit, light);
    c = mix(c, shade, depth * 0.35 * (1.0 - light));
    c = mix(c, low, 0.22 * (1.0 - fl));               // the far layer sits in the haze
    col = mix(col, c, a * mix(0.85, 1.0, fl));
  }

  // soft vignette and film grain: a picture, not a render
  float vig = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(aspect, 1.0)));
  col *= mix(0.9, 1.0, vig);
  col += (hash(frag + fract(u_time) * 100.0) - 0.5) * 0.035;

  gl_FragColor = vec4(col, 1.0);
}`;

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

export function SkyBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return; // the CSS gradient on the canvas stays as the fallback

    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U('u_res'), uTime = U('u_time'), uDusk = U('u_dusk'), uScroll = U('u_scroll'), uOct = U('u_octaves');

    const small = window.matchMedia('(max-width: 767px)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Render below screen resolution: clouds are soft, so this upscales cleanly and keeps it cheap.
    const SCALE = small ? 0.35 : 0.5;
    gl.uniform1f(uOct, small ? 5 : 6);

    function resize() {
      const w = Math.max(2, Math.round(window.innerWidth * SCALE));
      const h = Math.max(2, Math.round(window.innerHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl!.viewport(0, 0, w, h); }
      gl!.uniform2f(uRes, w, h);
    }

    // Dusk follows the scroll: day over the hero, night by the time the work arrives.
    function dusk() {
      const hero = document.querySelector('.hero-poster') as HTMLElement | null;
      const hh = hero ? hero.offsetHeight : window.innerHeight;
      const t = (window.scrollY - hh * 0.4) / (hh * 0.6);
      return Math.min(1, Math.max(0, t));
    }

    let raf = 0, last = 0, running = true;
    const start = performance.now() - 40_000; // start mid-drift, not at the noise origin
    function draw(now: number) {
      gl!.uniform1f(uTime, reduce ? 40 : (now - start) / 1000);
      gl!.uniform1f(uDusk, dusk());
      gl!.uniform1f(uScroll, window.scrollY * SCALE);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    function loop(now: number) {
      if (!running) return;
      // ~30fps is plenty for clouds this slow, and halves the cost
      if (now - last > 33) { last = now; draw(now); }
      raf = requestAnimationFrame(loop);
    }

    resize();
    draw(performance.now());
    const onScroll = () => { if (reduce) draw(performance.now()); };
    const onResize = () => { resize(); draw(performance.now()); };
    const onVis = () => {
      running = !document.hidden && !reduce;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(loop);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
      // behind everything: above the page background, below all content
      style={{ zIndex: -1, background: 'linear-gradient(180deg, #2185c2 0%, #8ccbe6 60%, #e6f3f9 100%)' }}
    />
  );
}
