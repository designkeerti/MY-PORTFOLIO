import { createContext, useCallback, useContext, useEffect, useRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Page transitions drawn with the site's own weather.
 *
 *  - Into a case study (dark work section -> light sky page): wind and mist. Fog rolls up
 *    from the bottom on the wind and covers the screen; the page changes underneath; the
 *    fog then lifts away, bottom first, revealing the new sky.
 *  - Back home (light case study -> the dark, burned work section): the burn. A flame front
 *    rises from the bottom and leaves charred black; the page changes underneath, and the
 *    black fades into the identical black of the burned home page.
 *
 * Use <TransitionLink to="..."> (or useTransitionTo()) for internal links that should play
 * it. Modifier-clicks open in a new tab as usual; under reduced motion it just navigates.
 */

type Mode = 'fog' | 'burn';
const Ctx = createContext<(to: string) => void>(() => {});
export const useTransitionTo = () => useContext(Ctx);

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_p;      // progress of the current phase, 0..1
uniform float u_mode;   // 0 fog, 1 burn
uniform float u_out;    // 0 covering, 1 revealing
uniform float u_alpha;  // overall opacity (the burn fades out)

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
float fbm(vec2 p) { float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; } return v; }

vec3 charred(vec2 p, vec2 frag) {
  vec3 c = vec3(0.052, 0.047, 0.043) + (fbm(p * 6.0 + 5.0) - 0.5) * 0.02 + (hash(frag) - 0.5) * 0.026;
  return max(c + vec3(0.022, 0.012, 0.004) * (fbm(p * 2.0 + 11.0) - 0.5), 0.0);
}
float sparks(vec2 p, float t) {
  vec2 q = p * vec2(16.0, 9.0) + vec2(sin(p.y * 6.0 + t) * 0.4, -t * 2.2);
  vec2 id = floor(q), f = fract(q) - 0.5; float h = hash(id);
  if (h < 0.86) return 0.0;
  vec2 o = vec2(hash(id + 1.3) - 0.5, hash(id + 2.7) - 0.5) * 0.6;
  return smoothstep(0.11, 0.0, length(f - o)) * (0.55 + 0.45 * sin(t * 11.0 + h * 50.0));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;
  vec2 p = vec2(uv.x * u_res.x / u_res.y, uv.y);
  float T = u_time;
  vec4 outc = vec4(0.0);

  if (u_mode < 0.5) {
    // wind and mist: billowing fog, drifting sideways on the wind
    float n = fbm(p * vec2(1.8, 1.4) + vec2(-T * 0.35 - u_p * 2.5, -T * 0.08));
    float w = fbm(p * vec2(4.0, 3.0) + vec2(-T * 0.7 - u_p * 4.0, 1.7));
    float field = uv.y * 0.8 + (n - 0.5) * 0.6 + (w - 0.5) * 0.15;
    float t = u_p * 1.8 - 0.36;
    float edge = smoothstep(t + 0.16, t - 0.14, field);          // 1 where the front has passed
    float fog = u_out < 0.5 ? edge : 1.0 - edge;                 // covering: rises; revealing: lifts away from the bottom
    vec3 col = mix(vec3(0.86, 0.91, 0.95), vec3(0.985, 0.985, 0.98), smoothstep(0.3, 0.85, n + w * 0.4));
    outc = vec4(col * fog, fog);
  } else {
    // the burn: a flame front rising from the bottom, charred black behind it
    float field = uv.y * 0.62 + abs(uv.x - 0.5) * 0.14 + (fbm(p * 3.0 + 3.0) - 0.5) * 0.46 + (fbm(p * 9.0 + vec2(0.0, -T * 0.7)) - 0.5) * 0.07;
    float t = u_p * 1.5 - 0.22;
    float f = field - t;
    if (f > 0.0) {
      // ahead of the front: scorch and a glow on the old page
      float sc = smoothstep(0.09, 0.0, f) * 0.75;
      vec3 glow = vec3(1.0, 0.42, 0.1) * exp(-f * 55.0) * 0.55;
      float a = clamp(sc + length(glow) * 0.6, 0.0, 1.0);
      outc = vec4(vec3(0.24, 0.13, 0.06) * sc + glow, a);
    } else {
      float d = -f;
      vec3 col = charred(p, frag);
      float flick = 0.8 + 0.2 * sin(T * 13.0 + field * 55.0) * sin(T * 7.0 + p.x * 9.0);
      col += vec3(1.0, 0.92, 0.65) * exp(-d * 180.0) * 1.2 * flick;
      col += vec3(1.0, 0.45, 0.08) * exp(-d * 45.0) * 0.95 * flick;
      col += vec3(0.55, 0.07, 0.02) * exp(-d * 14.0) * 0.6;
      outc = vec4(col, 1.0);
    }
    vec3 sp = vec3(1.0, 0.62, 0.22) * sparks(p, T) * smoothstep(0.32, 0.0, abs(f + 0.03)) * 1.3;
    outc.rgb += sp; outc.a = max(outc.a, min(1.0, length(sp)));
  }
  gl_FragColor = outc * u_alpha;
}`;

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const busy = useRef(false);
  const glRef = useRef<{ gl: WebGLRenderingContext; U: (n: string) => WebGLUniformLocation | null } | null>(null);

  // lazily set up the overlay's WebGL the first time it's needed
  const ensureGL = useCallback(() => {
    if (glRef.current) return glRef.current;
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    glRef.current = { gl, U: (n: string) => gl.getUniformLocation(prog, n) };
    return glRef.current;
  }, []);

  const go = useCallback((to: string) => {
    if (busy.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const g = reduce ? null : ensureGL();
    if (!g) { navigate(to); return; }
    busy.current = true;
    // into the light pages (case studies, the playground) the mist; back to the dark home, the burn
    const mode: Mode = to.startsWith('/work/') || to.startsWith('/playground') ? 'fog' : 'burn';
    const { gl, U } = g;
    const canvas = canvasRef.current!;
    const scale = 0.6;
    // sized from its own box: on iOS it bleeds past both bars (see .transition-canvas in index.css)
    canvas.width = Math.round((canvas.clientWidth || innerWidth) * scale); canvas.height = Math.round((canvas.clientHeight || innerHeight) * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U('u_res'), canvas.width, canvas.height);
    gl.uniform1f(U('u_mode'), mode === 'fog' ? 0 : 1);
    canvas.style.visibility = 'visible';
    canvas.style.pointerEvents = 'auto';
    const t0 = performance.now();
    const draw = (p: number, out: number, alpha: number) => {
      gl.uniform1f(U('u_time'), (performance.now() - t0) / 1000);
      gl.uniform1f(U('u_p'), p); gl.uniform1f(U('u_out'), out); gl.uniform1f(U('u_alpha'), alpha);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const phase = (ms: number, fn: (k: number) => void) => new Promise<void>(res => {
      const s = performance.now();
      const step = (now: number) => { const k = Math.min(1, (now - s) / ms); fn(ease(k)); if (k < 1) requestAnimationFrame(step); else res(); };
      requestAnimationFrame(step);
    });
    const hold = (ms: number) => phase(ms, () => draw(1, 0, 1));
    (async () => {
      await phase(mode === 'fog' ? 900 : 1000, k => draw(k, 0, 1));         // cover
      navigate(to);
      await hold(380);                                                          // let the new page settle underneath
      if (mode === 'fog') await phase(950, k => draw(k, 1, 1));               // the mist lifts
      else await phase(550, k => draw(1, 0, 1 - k));                           // black fades into the burned page
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      canvas.style.visibility = 'hidden';
      canvas.style.pointerEvents = 'none';
      busy.current = false;
    })();
  }, [ensureGL, navigate]);

  useEffect(() => () => { glRef.current?.gl.getExtension('WEBGL_lose_context')?.loseContext(); }, []);

  return (
    <Ctx.Provider value={go}>
      {children}
      {/* in a composited anchor, so iOS Safari doesn't clip it to the space between its bars */}
      <div aria-hidden className="layer-anchor transition-anchor">
        <canvas ref={canvasRef} className="transition-canvas" style={{ visibility: 'hidden', pointerEvents: 'none' }} />
      </div>
    </Ctx.Provider>
  );
}

/** An internal link that plays the page transition. */
export function TransitionLink({ to, onClick, children, ...rest }: { to: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const go = useTransitionTo();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(to);
  };
  return <a href={to} onClick={handle} {...rest}>{children}</a>;
}
