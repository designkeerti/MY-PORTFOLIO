import { useEffect, useRef } from 'react';
import { SKY_GLSL, skyTime, duskAmount, skyScroll } from './sky/sky';

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
${SKY_GLSL}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  float nd;
  vec3 col = skyScene(uv, asp, u_sc, 0.0, nd);
  gl_FragColor = vec4(skyFinish(col, uv, asp, gl_FragCoord.xy), 1.0);
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
    let uDusk: WebGLUniformLocation | null = null, uScroll: WebGLUniformLocation | null = null;
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
      uRes = U('u_res'); uTime = U('u_time'); uDusk = U('u_dusk'); uScroll = U('u_sc');
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

    init();
    kick();

    return () => {
      cancelAnimationFrame(raf);
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
