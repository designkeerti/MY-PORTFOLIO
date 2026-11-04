import { useEffect, useRef } from 'react';
import { SKY_GLSL, skyTime, duskAmount, skyScroll, getClear, onClear, getBack, onBack } from './sky/sky';

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
uniform float u_clear;   // 0 sky .. 1 burned through to charred black
uniform float u_back;    // 0 .. 1: the sky rolls back in over the burn, from the top
${SKY_GLSL}

// charred black: soot with a fibrous texture, faint warm mottling and grain
vec3 charred(vec2 p, vec2 frag) {
  float fibre = fbm(p * 6.0 + 5.0) - 0.5;
  float mottle = fbm(p * 2.0 + 11.0) - 0.5;
  float grain = hash(frag) - 0.5;
  vec3 c = vec3(0.052, 0.047, 0.043) + fibre * 0.02 + grain * 0.026;
  c += vec3(0.022, 0.012, 0.004) * mottle;       // a little warmth left in the ash
  return max(c, 0.0);
}

// round glowing specks left in the ash, each pulsing slowly
float embers(vec2 p, float t) {
  vec2 q = p * 26.0;
  vec2 id = floor(q), f = fract(q) - 0.5;
  float h = hash(id + 9.1);
  if (h < 0.9) return 0.0;
  vec2 o = vec2(hash(id + 3.3) - 0.5, hash(id + 5.9) - 0.5) * 0.5;
  return smoothstep(0.16, 0.0, length(f - o)) * (0.45 + 0.55 * sin(t * 2.5 + h * 40.0));
}

// sparks: small embers drifting up on the heat
float sparks(vec2 p, float t) {
  vec2 q = p * vec2(16.0, 9.0) + vec2(sin(p.y * 6.0 + t) * 0.4, -t * 2.2);
  vec2 id = floor(q), f = fract(q) - 0.5;
  float h = hash(id);
  if (h < 0.86) return 0.0;
  vec2 o = vec2(hash(id + 1.3) - 0.5, hash(id + 2.7) - 0.5) * 0.6;
  return smoothstep(0.11, 0.0, length(f - o)) * (0.55 + 0.45 * sin(t * 11.0 + h * 50.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float nd;
  float c = u_clear;
  float T = u_time;
  // the sky itself (needed when nothing has burned, and when it rolls back in)
  vec3 skyCol = vec3(0.0);
  if (c <= 0.0 || u_back > 0.0) skyCol = skyFinish(skyScene(uv, asp, u_sc, 0.0, nd), uv, asp, gl_FragCoord.xy);
  if (c <= 0.0) { gl_FragColor = vec4(skyCol, 1.0); return; }

  // The burn rises from the bottom with a ragged, slowly licking front.
  float field = uv.y * 0.62 + abs(uv.x - 0.5) * 0.14
              + (fbm(p * 3.0 + 3.0) - 0.5) * 0.46
              + (fbm(p * 9.0 + vec2(0.0, -T * 0.7)) - 0.5) * 0.07;
  float t = c * 1.5 - 0.22;
  float f = field - t;                       // > 0: still sky, < 0: burned

  vec3 col;
  if (f > 0.0) {
    // ahead of the front: heat shimmer, scorching, and smoke rising off it
    float heat = smoothstep(0.22, 0.0, f);
    vec2 wob = vec2(fbm(p * 7.0 + vec2(0.0, -T * 2.0)), fbm(p * 7.0 + vec2(4.0, -T * 2.0))) - 0.5;
    vec3 sky = skyFinish(skyScene(uv + wob * 0.03 * heat, asp, u_sc, 0.0, nd), uv, asp, gl_FragCoord.xy);
    col = mix(sky, sky * vec3(0.66, 0.48, 0.34), smoothstep(0.09, 0.0, f) * 0.8);
    float smoke = fbm(p * vec2(2.5, 3.5) + vec2(T * 0.05, -T * 0.5)) * smoothstep(0.35, 0.02, f);
    col = mix(col, vec3(0.16, 0.14, 0.13), smoothstep(0.25, 0.75, smoke) * 0.55);
    col += vec3(1.0, 0.42, 0.1) * exp(-f * 55.0) * 0.55;       // glow thrown ahead of the flames
  } else {
    float d = -f;                                             // depth into the burn
    col = charred(p, gl_FragCoord.xy);
    // the flame line: white-hot core -> orange -> deep red, flickering
    float flick = 0.8 + 0.2 * sin(T * 13.0 + field * 55.0) * sin(T * 7.0 + p.x * 9.0);
    col += vec3(1.0, 0.92, 0.65) * exp(-d * 180.0) * 1.2 * flick;
    col += vec3(1.0, 0.45, 0.08) * exp(-d * 45.0) * 0.95 * flick;
    col += vec3(0.55, 0.07, 0.02) * exp(-d * 14.0) * 0.6;
    // the last embers, glowing out in the ash
    col += vec3(1.0, 0.36, 0.06) * embers(p, T) * exp(-d * 7.0) * 0.9;
  }
  // sparks drifting up just above (and a little inside) the front
  col += vec3(1.0, 0.62, 0.22) * sparks(p, T) * smoothstep(0.32, 0.0, abs(f + 0.03)) * 1.3;

  // The return: clouds roll up from the bottom over the ash, a soft billowing edge, no fire.
  if (u_back > 0.0) {
    float bn = fbm(p * 2.4 + vec2(T * 0.04, 0.0));
    float bf = uv.y * 0.72 + (bn - 0.5) * 0.5 + (fbm(p * 7.0) - 0.5) * 0.06;   // rises from the bottom, with the section
    float bt = u_back * 1.5 - 0.26;
    float reveal = smoothstep(bt + 0.05, bt - 0.05, bf);
    col = mix(col, skyCol, reveal);
    // a bank of cloud along the advancing edge
    float edge = 1.0 - smoothstep(0.0, 0.14, abs(bf - bt));
    vec3 puff = mix(skyShade(), skyLit(), clamp(0.55 + (bn - 0.5) * 1.6, 0.0, 1.0));
    col = mix(col, puff, edge * smoothstep(0.35, 0.75, bn + 0.25) * (1.0 - smoothstep(0.85, 1.0, u_back)));
  }
  gl_FragColor = vec4(col, 1.0);
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
    let uDusk: WebGLUniformLocation | null = null, uScroll: WebGLUniformLocation | null = null, uClear: WebGLUniformLocation | null = null, uBack: WebGLUniformLocation | null = null;
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
      uRes = U('u_res'); uTime = U('u_time'); uDusk = U('u_dusk'); uScroll = U('u_sc'); uClear = U('u_clear'); uBack = U('u_back');
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
      gl!.uniform1f(uBack, getBack());
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    // Draw only while the hero is on screen: below it the sky holds its last frame (kept by
    // preserveDrawingBuffer), which frees the GPU for the work section.
    let raf = 0, last = 0, heroVisible = true;
    // (also while the sky is back, further down the page)
    const animate = () => !reduce && !document.hidden && (heroVisible || getBack() > 0) && ready;
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

    // The burn is driven by scroll: draw on every change so its front tracks the page.
    // Once burned through, the page turns dark: text flips to light, Safari's bars go black.
    const layer = canvas.parentElement!;
    // dark page while burned, unless the sky has rolled back in
    const sync = () => {
      draw(); kick();
      const burned = getClear() > 0.5 && getBack() < 0.3;
      layer.classList.toggle('burned', burned);
      document.documentElement.classList.toggle('burned', burned);
      document.querySelector('meta[name=theme-color]')?.setAttribute('content', burned ? '#0d0c0b' : '#2c8bc6');
    };
    const offClear = onClear(sync);
    const offBack = onBack(sync);

    init();
    kick();

    return () => {
      cancelAnimationFrame(raf); offClear(); offBack();
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
  // The layer has no background colour of its own (only the still sky picture): iOS
  // Safari turns a solid colour on a fixed element at the screen edge into a flat tint
  // for its bars. Without one, its glass bars show this layer through them. The
  // fallback colour lives on <html> instead (index.css).
  return (
    <div aria-hidden className="sky-layer pointer-events-none">
      <canvas ref={ref} className="absolute inset-0 block h-full w-full" />
    </div>
  );
}
