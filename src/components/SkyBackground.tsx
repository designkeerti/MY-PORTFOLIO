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
    const uRes = U('u_res'), uTime = U('u_time'), uDusk = U('u_dusk'), uScroll = U('u_sc'), uOct = U('u_octaves');

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
      // the farthest layer of the hero parallax: overscaled so its edges never show at full travel
      style={{ zIndex: -1, scale: '1.08', translate: 'calc(var(--px, 0) * -36px) calc(var(--py, 0) * -24px)', background: 'linear-gradient(180deg, #2185c2 0%, #8ccbe6 60%, #e6f3f9 100%)' }}
    />
  );
}
