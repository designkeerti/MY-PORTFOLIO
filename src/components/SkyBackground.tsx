import { useEffect, useRef } from 'react';
import { SKY_GLSL, skyTime, duskAmount, skyScroll, getClear, onClear } from './sky/sky';

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
uniform float u_dusk;
uniform float u_sc;
uniform float u_octaves;
uniform float u_clear;   // 0 sky .. 1 blown away and fogged over into paper
${SKY_GLSL}

// plain off-white paper with a soft fibre texture and fine grain
vec3 paper(vec2 p, vec2 frag) {
  vec3 base = vec3(0.965, 0.957, 0.937);
  float fibre = fbm(p * vec2(9.0, 3.5)) - 0.5;
  float mottle = fbm(p * 2.2 + 7.0) - 0.5;
  float grain = hash(frag) - 0.5;
  return base + fibre * 0.022 + mottle * 0.03 + grain * 0.025;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float nd;
  float c = u_clear;
  if (c <= 0.0) {
    gl_FragColor = vec4(skyFinish(skyScene(uv, asp, u_sc, 0.0, nd), uv, asp, gl_FragCoord.xy), 1.0);
    return;
  }

  // Wind: the sky is carried off to the right, faster and faster, with a motion streak.
  float drift = c * c * 0.9;
  float streak = 0.05 * c;
  vec3 sky = vec3(0.0);
  for (int k = 0; k < 3; k++) {
    sky += skyScene(uv - vec2(drift + float(k) * streak, 0.0), asp, u_sc, 0.0, nd);
  }
  sky = skyFinish(sky / 3.0, uv, asp, gl_FragCoord.xy);

  // Fog rolls in from the left on the same wind: soft, billowing, wider at the edge.
  float n = fbm(p * vec2(1.4, 2.6) + vec2(-u_time * 0.22 - c * 3.2, 0.0));
  float wisp = fbm(p * vec2(3.5, 6.0) + vec2(-u_time * 0.4 - c * 5.0, 1.7));
  float field = uv.x * 0.75 + (n - 0.5) * 0.65 + (wisp - 0.5) * 0.15 + (1.0 - uv.y) * 0.08;
  float t = c * 1.55 - 0.3;
  float fog = smoothstep(t + 0.16, t - 0.14, field);
  vec3 fogCol = mix(vec3(0.90, 0.93, 0.96), vec3(0.985, 0.985, 0.98), smoothstep(0.3, 0.8, n + wisp * 0.4));

  // and as it thickens it settles into plain paper
  vec3 mist = mix(fogCol, paper(p, gl_FragCoord.xy), smoothstep(0.55, 1.0, c));
  gl_FragColor = vec4(mix(sky, mist, fog), 1.0);
}`;

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

export function SkyBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const small = window.matchMedia('(max-width: 767px)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Render below screen resolution: clouds are soft, so this upscales cleanly and keeps it cheap.
    const SCALE = small ? 0.35 : 0.5;

    // Transparent, and keeping its last frame: iOS Safari can drop a canvas's drawing while
    // its toolbars animate, and kills WebGL contexts under memory pressure (e.g. the work
    // section's reels). An opaque canvas then shows black; this one shows the still sky
    // picture on the layer behind it, and is rebuilt when Safari restores the context.
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
    if (!gl) return; // the still sky picture on the layer stays as the fallback

    let uRes: WebGLUniformLocation | null = null, uTime: WebGLUniformLocation | null = null;
    let uDusk: WebGLUniformLocation | null = null, uScroll: WebGLUniformLocation | null = null, uClear: WebGLUniformLocation | null = null;
    let ready = false;
    function init() {
      const sh = (type: number, src: string) => { const s = gl!.createShader(type)!; gl!.shaderSource(s, src); gl!.compileShader(s); return s; };
      const prog = gl!.createProgram()!;
      gl!.attachShader(prog, sh(gl!.VERTEX_SHADER, VERT));
      gl!.attachShader(prog, sh(gl!.FRAGMENT_SHADER, FRAG));
      gl!.linkProgram(prog);
      if (!gl!.getProgramParameter(prog, gl!.LINK_STATUS)) { ready = false; return; }
      gl!.useProgram(prog);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer());
      gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl!.STATIC_DRAW);
      const loc = gl!.getAttribLocation(prog, 'a');
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
      const U = (n: string) => gl!.getUniformLocation(prog, n);
      uRes = U('u_res'); uTime = U('u_time'); uDusk = U('u_dusk'); uScroll = U('u_sc'); uClear = U('u_clear');
      gl!.uniform1f(U('u_octaves'), small ? 5 : 6);
      ready = true;
      fit(true);
    }

    // Size to the layer's box (100lvh: the largest viewport height, so toolbars showing and
    // hiding never resize it). Watched with a ResizeObserver, so a box that wasn't laid out
    // yet when this ran still gets the right size as soon as it is.
    function fit(force = false) {
      if (!ready) return;
      const w = Math.max(2, Math.round(canvas.clientWidth * SCALE));
      const h = Math.max(2, Math.round(canvas.clientHeight * SCALE));
      if (force || canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h; gl!.viewport(0, 0, w, h);
        gl!.uniform2f(uRes, w, h);
        draw();
      }
    }

    function draw() {
      if (!ready || gl!.isContextLost()) return;
      gl!.uniform1f(uTime, skyTime(reduce));
      gl!.uniform1f(uDusk, duskAmount());
      gl!.uniform1f(uScroll, skyScroll());
      gl!.uniform1f(uClear, getClear());
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    // Draw only while the hero is on screen: below it the sky holds its last frame (kept by
    // preserveDrawingBuffer), which frees the GPU for the work section.
    let raf = 0, last = 0, heroVisible = true;
    const animate = () => !reduce && !document.hidden && heroVisible && ready;
    function loop(now: number) {
      raf = 0;
      if (!animate()) return;
      // ~30fps is plenty for clouds this slow, and halves the cost
      if (now - last > 33) { last = now; draw(); }
      raf = requestAnimationFrame(loop);
    }
    const kick = () => { if (!raf && animate()) raf = requestAnimationFrame(loop); };

    const ro = new ResizeObserver(() => fit());
    ro.observe(canvas);
    let io: IntersectionObserver | undefined;
    const hero = document.querySelector('.hero-poster');
    if (hero) {
      // a ratio above 0, not isIntersecting: an edge merely touching the viewport counts as intersecting
      io = new IntersectionObserver(es => { heroVisible = es.some(e => e.intersectionRatio > 0); kick(); }, { threshold: [0, 0.01] });
      io.observe(hero);
    }
    const onVis = () => kick();
    const onLost = (e: Event) => {
      e.preventDefault();                      // ask the browser to restore it
      ready = false; cancelAnimationFrame(raf); raf = 0;
      canvas.style.visibility = 'hidden';      // the still sky picture shows meanwhile
    };
    const onRestored = () => { canvas.style.visibility = ''; init(); kick(); };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    document.addEventListener('visibilitychange', onVis);

    // The clear (wind + fog) is driven by scroll: draw on every change so it tracks the page.
    // Once fully cleared, the layer's own background becomes paper too (and Safari's bars follow).
    const layer = canvas.parentElement!;
    const offClear = onClear(v => {
      draw();
      const burned = v > 0.75;
      layer.classList.toggle('burned', burned);
      document.documentElement.classList.toggle('burned', burned);
      document.querySelector('meta[name=theme-color]')?.setAttribute('content', burned ? '#f6f4ef' : '#2c8bc6');
    });

    init();
    kick();

    return () => {
      cancelAnimationFrame(raf); offClear();
      document.documentElement.classList.remove('burned');
      ro.disconnect(); io?.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      document.removeEventListener('visibilitychange', onVis);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  // A fixed layer the full height of the screen (the largest viewport height, so phone
  // toolbars appearing and disappearing never resize it), behind everything. It carries a
  // still picture of the same sky, so the screen is sky even before or between frames.
  // Parallax (translate + overscale) is desktop-only, via .sky-layer in index.css.
  return (
    <div aria-hidden className="sky-layer pointer-events-none">
      <canvas ref={ref} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
