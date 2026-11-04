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
    // Transparent, not opaque: iOS Safari can drop a canvas's drawing for a frame while
    // its toolbars animate during scroll. An opaque canvas then shows black; a transparent
    // one shows the still sky picture on the layer behind it. (The shader writes alpha 1.)
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true });
    if (!gl) return; // the still sky picture on the layer stays as the fallback

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
    const uRes = U('u_res'), uTime = U('u_time'), uDusk = U('u_dusk'), uScroll = U('u_sc'), uOct = U('u_octaves');

    const small = window.matchMedia('(max-width: 767px)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Render below screen resolution: clouds are soft, so this upscales cleanly and keeps it cheap.
    const SCALE = small ? 0.35 : 0.5;
    gl.uniform1f(uOct, small ? 5 : 6);

    // Size to the canvas's own box, which is 100lvh (the largest viewport height), so
    // phone address bars showing and hiding while scrolling never resize the sky.
    function resize() {
      // the layout box, before any parallax scale
      const w = Math.max(2, Math.round(canvas.clientWidth * SCALE));
      const h = Math.max(2, Math.round(canvas.clientHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl!.viewport(0, 0, w, h); }
      gl!.uniform2f(uRes, w, h);
    }

    let raf = 0, last = 0, running = true;
    function draw(now: number) {
      void now;
      gl!.uniform1f(uTime, skyTime(reduce));
      gl!.uniform1f(uDusk, duskAmount());
      gl!.uniform1f(uScroll, skyScroll());
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
    // only a width change (or a real height change, not the address bar) needs a re-fit
    let lastW = window.innerWidth;
    const onResize = () => { if (window.innerWidth === lastW) return; lastW = window.innerWidth; resize(); draw(performance.now()); };
    const onVis = () => {
      running = !document.hidden && !reduce;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(loop);
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
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
