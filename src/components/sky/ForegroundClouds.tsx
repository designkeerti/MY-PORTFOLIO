import { useEffect, useRef } from 'react';
import { SKY_GLSL, skyTime, duskAmount, skyScroll } from './sky';

/**
 * The same near clouds as the sky, drawn in front of things: a bank that
 * thickens towards the bottom of this element, so whatever sits behind it
 * (the portrait) rises out of the clouds. The pointer parts the clouds
 * where it passes, and they drift back.
 *
 * Positioned by the parent (absolute); it lines its clouds up with the
 * background sky using its own place in the viewport.
 */

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform vec2 u_rect;     // canvas top-left in the viewport, css px
uniform vec2 u_view;     // viewport, css px
uniform float u_dpr;     // canvas px per css px
uniform float u_time;
uniform float u_dusk;
uniform float u_sc;
uniform float u_octaves;
uniform vec2 u_mouse;    // viewport uv, y up
uniform float u_part;    // 0..1, how much the pointer is parting the clouds
${SKY_GLSL}
void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 luv = frag / u_res;                                   // local, y up
  vec2 css = vec2(frag.x, u_res.y - frag.y) / u_dpr;
  vec2 vuv = vec2((u_rect.x + css.x) / u_view.x, 1.0 - (u_rect.y + css.y) / u_view.y);
  float vasp = u_view.x / u_view.y;

  // thicker towards the bottom of this layer, thin at its top
  float down = 1.0 - luv.y;
  float extra = mix(-0.5, 0.45, smoothstep(0.05, 0.45, down)) + 0.65 * smoothstep(0.42, 0.78, down);
  // the pointer parts them
  vec2 dv = vec2((vuv.x - u_mouse.x) * vasp, vuv.y - u_mouse.y);
  extra -= u_part * 0.55 * exp(-dot(dv, dv) / 0.02);

  vec4 c = skyNearClouds(vuv, vasp, u_sc, extra);
  c *= smoothstep(1.0, 0.7, luv.y);                          // nothing at the very top edge
  gl_FragColor = c;
}`;
const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

export function ForegroundClouds({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;
    const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const small = window.matchMedia('(max-width: 767px)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gl.uniform1f(U('u_octaves'), small ? 5 : 6);
    // same softness as the background sky (rendered at reduced resolution too)
    const SCALE = small ? 0.35 : 0.5;

    let mouse: [number, number] = [0.5, 0.2], partT = 0, part = 0;
    const onMove = (e: PointerEvent) => { mouse = [e.clientX / innerWidth, 1 - e.clientY / innerHeight]; partT = 1; };
    const onLeave = () => { partT = 0; };
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    function fit() {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.round(r.width * SCALE));
      canvas.height = Math.max(2, Math.round(r.height * SCALE));
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform2f(U('u_res'), canvas.width, canvas.height);
      gl!.uniform1f(U('u_dpr'), SCALE);
    }
    let raf = 0, last = 0, visible = true;
    function draw() {
      const r = canvas.getBoundingClientRect();
      part += (partT - part) * 0.06;
      partT *= 0.985;                        // the parting slowly closes when the pointer rests
      gl!.uniform2f(U('u_rect'), r.left, r.top);
      gl!.uniform2f(U('u_view'), innerWidth, innerHeight);
      gl!.uniform1f(U('u_time'), skyTime(reduce));
      gl!.uniform1f(U('u_dusk'), duskAmount());
      gl!.uniform1f(U('u_sc'), skyScroll());
      gl!.uniform2f(U('u_mouse'), mouse[0], mouse[1]);
      gl!.uniform1f(U('u_part'), part);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    function loop(now: number) {
      if (visible && !document.hidden && now - last > 33) { last = now; draw(); }
      raf = requestAnimationFrame(loop);
    }
    const ro = new ResizeObserver(() => { fit(); draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); });
    io.observe(canvas);
    const onScroll = () => { if (reduce) draw(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    fit(); draw();
    if (!reduce) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);
  return <canvas ref={ref} aria-hidden className={className} style={{ pointerEvents: 'none' }} />;
}
