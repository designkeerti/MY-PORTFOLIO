import { useEffect, useRef } from 'react';
import { SKY_GLSL, skyTime, duskAmount, skyScroll } from '../sky/sky';

/**
 * The portrait, placed in the sky: the person (the photo's own transparency),
 * graded with the scene (a breath of the sky's haze, the same film grain, and
 * dimming as the sky turns to dusk), fading softly into the open sky at its
 * base. Drawn with the shared sky code so the grade matches the background.
 */

const FRAG = `
precision highp float;
uniform sampler2D u_img;
uniform vec2 u_res;      // canvas px
uniform vec2 u_rect;     // canvas top-left in the viewport, css px
uniform vec2 u_view;     // viewport, css px
uniform float u_dpr;     // canvas px per css px
uniform float u_time;
uniform float u_dusk;
uniform float u_sc;
uniform float u_octaves;
uniform float u_show;    // 0..1 intro
${SKY_GLSL}
void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 luv = frag / u_res;
  vec4 ph = texture2D(u_img, vec2(luv.x, 1.0 - luv.y));      // straight alpha
  if (ph.a <= 0.002) { gl_FragColor = vec4(0.0); return; }

  // where this pixel is in the viewport, so the clouds line up with the background exactly
  vec2 css = vec2(frag.x, u_res.y - frag.y) / u_dpr;
  vec2 vuv = vec2((u_rect.x + css.x) / u_view.x, 1.0 - (u_rect.y + css.y) / u_view.y);
  float vasp = u_view.x / u_view.y;

  // the photo, graded into the scene: a breath of the sky's haze, deeper in shadow
  vec3 col = mix(ph.rgb, skyLow(), 0.06);

  // the light follows the sky: the photo dims as the sky turns to dusk and night
  col *= mix(1.0, 0.42, smoothstep(0.15, 0.9, u_dusk));

  col = skyFinish(col, vuv, vasp, frag);
  // rises into place on load
  // no cloud bank below: the photo fades softly into the open sky at its base
  float a = ph.a * u_show * smoothstep(0.0, 0.3, luv.y);
  // the crop cuts the shoulders at the frame's sides: soften those edges into the sky too
  float sides = smoothstep(0.0, 0.14, luv.x) * smoothstep(1.0, 0.86, luv.x);
  a *= mix(1.0, sides, smoothstep(0.62, 0.3, luv.y));
  gl_FragColor = vec4(col * a, a);
}`;
const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

export function PortraitInSky({ src, alt, className, shown }: { src: string; alt: string; className?: string; shown: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const showRef = useRef(shown);
  showRef.current = shown;

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    const fallback = () => {
      // no WebGL: show the photo as a plain image instead
      const img = document.createElement('img');
      img.src = src; img.alt = alt; img.className = 'h-full w-full object-contain object-bottom';
      canvas.replaceWith(img);
    };
    if (!gl) { fallback(); return; }
    const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { fallback(); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // same cloud detail as the background sky
    gl.uniform1f(U('u_octaves'), window.matchMedia('(max-width: 767px)').matches ? 5 : 6);

    let ready = false, show = reduce ? 1 : 0;
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    img.onload = () => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true; fit(); draw();
    };

    function fit() {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.round(r.width * dpr));
      canvas.height = Math.max(2, Math.round(r.height * dpr));
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform2f(U('u_res'), canvas.width, canvas.height);
      gl!.uniform1f(U('u_dpr'), canvas.width / Math.max(1, r.width));
    }
    function draw() {
      if (!ready) return;
      const r = canvas.getBoundingClientRect();
      gl!.uniform2f(U('u_rect'), r.left, r.top);
      gl!.uniform2f(U('u_view'), innerWidth, innerHeight);
      gl!.uniform1f(U('u_time'), skyTime(reduce));
      gl!.uniform1f(U('u_dusk'), duskAmount());
      gl!.uniform1f(U('u_sc'), skyScroll());
      gl!.uniform1f(U('u_show'), show);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    let raf = 0, last = 0, visible = true, showStart = 0;
    function loop(now: number) {
      // fade in over ~0.8s of real time, however fast the device draws
      if (showRef.current && show < 1) { if (!showStart) showStart = now; show = Math.min(1, (now - showStart) / 800); }
      // ~30fps, like the sky, so the two stay in step
      if (visible && !document.hidden && now - last > 33) { last = now; draw(); }
      raf = requestAnimationFrame(loop);
    }
    const ro = new ResizeObserver(() => { fit(); draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); });
    io.observe(canvas);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return <canvas ref={ref} role="img" aria-label={alt} className={className} />;
}
