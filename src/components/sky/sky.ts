/**
 * The sky scene, shared. The full-screen background (SkyBackground) and the
 * portrait (CloudPortrait) both draw from this exact code, clock and scroll
 * mapping, so wherever they meet the clouds, light and colour are the same
 * picture: the portrait's cloud is part of the sky, not an object on it.
 */

/** Shared clock: both canvases read the same time, so their clouds drift together. */
export const skyTime = (reduce: boolean) => (reduce ? 40 : performance.now() / 1000 + 40);

/** 0 = day, 0.5 = dusk, 1 = night. Day over the hero, night by the time the work arrives. */
export function duskAmount() {
  const hero = document.querySelector('.hero-poster') as HTMLElement | null;
  const hh = hero ? hero.offsetHeight : window.innerHeight;
  const t = (window.scrollY - hh * 0.4) / (hh * 0.6);
  return Math.min(1, Math.max(0, t));
}

/** Scroll as a fraction of the viewport height: drives the clouds' parallax. */
export const skyScroll = () => window.scrollY / Math.max(1, window.innerHeight);

/**
 * GLSL shared by both shaders. Expects uniforms u_time, u_dusk, u_octaves.
 * skyScene(uv, asp, sc, extra, nearDens): the sky colour at viewport point uv
 * (0..1, y up; asp = viewport width / height; sc = skyScroll()). `extra` adds
 * density to the near cloud layer at this point (the portrait uses it to
 * gather a cloud); nearDens returns that layer's density there.
 */
export const SKY_GLSL = `
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
vec2 warp(vec2 p) { return vec2(fbm(p), fbm(p + vec2(5.2, 1.3))); }

vec3 skyLow() {
  float d1 = smoothstep(0.0, 0.5, u_dusk), d2 = smoothstep(0.5, 1.0, u_dusk);
  return mix(mix(vec3(0.72, 0.87, 0.94), vec3(0.93, 0.62, 0.48), d1), vec3(0.075, 0.066, 0.11), d2);
}

// cloud colours: sunlit and shadowed, following the time of day
vec3 skyLit() {
  float d1 = smoothstep(0.0, 0.5, u_dusk), d2 = smoothstep(0.5, 1.0, u_dusk);
  return mix(mix(vec3(1.0, 0.995, 0.985), vec3(1.0, 0.80, 0.68), d1), vec3(0.17, 0.16, 0.23), d2);
}
vec3 skyShade() {
  float d1 = smoothstep(0.0, 0.5, u_dusk), d2 = smoothstep(0.5, 1.0, u_dusk);
  return mix(mix(vec3(0.60, 0.69, 0.79), vec3(0.45, 0.35, 0.50), d1), vec3(0.06, 0.055, 0.09), d2);
}

vec3 skyScene(vec2 uv, float asp, float sc, float extra, out float nearDens) {
  vec2 p = vec2(uv.x * asp, uv.y);
  nearDens = 0.0;

  // sky gradient: day -> dusk -> night
  float d1 = smoothstep(0.0, 0.5, u_dusk), d2 = smoothstep(0.5, 1.0, u_dusk);
  vec3 top = mix(mix(vec3(0.13, 0.52, 0.76), vec3(0.17, 0.18, 0.36), d1), vec3(0.047, 0.043, 0.075), d2);
  vec3 low = skyLow();
  vec3 col = mix(low, top, pow(smoothstep(0.0, 1.0, uv.y), 0.85));

  // cumulus piled up from the bottom and sides, open sky above, lit from the top left
  vec2 sunDir = normalize(vec2(-0.45, 0.9));
  vec3 lit = skyLit();
  vec3 shade = skyShade();

  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    float scale = mix(2.6, 1.25, fl);
    float speed = mix(0.005, 0.011, fl);
    vec2 cp = p * scale + vec2(u_time * speed, -sc * mix(0.3, 0.6, fl)) + fl * 17.0;
    vec2 q = warp(cp);
    float rise = mix(0.18, 0.42, fl);
    float shape = (rise - uv.y) * mix(0.35, 0.55, fl) + 0.10 * smoothstep(0.3, 0.0, min(uv.x, 1.0 - uv.x)) * fl + extra * fl;
    float dens = fbm(cp + 1.7 * q) + shape;
    if (L == 1) nearDens = dens;
    float cover = 0.5;
    float a = smoothstep(cover, cover + mix(0.10, 0.05, fl), dens);
    if (a <= 0.001) continue;
    float ahead = fbm(cp + sunDir * 0.06 + 1.7 * q) + shape - sunDir.y * 0.06 / scale * mix(0.35, 0.55, fl);
    float light = clamp(0.62 + (dens - ahead) * 7.0, 0.0, 1.0);
    float depth = smoothstep(cover, cover + 0.35, dens);
    vec3 c = mix(shade, lit, light);
    c = mix(c, shade, depth * 0.35 * (1.0 - light));
    c = mix(c, low, 0.22 * (1.0 - fl));
    col = mix(col, c, a * mix(0.85, 1.0, fl));
  }
  return col;
}

// Just the near cloud layer, premultiplied (rgb * a, a): for a layer of the
// same clouds drawn in front of things. Identical maths to skyScene's near layer.
vec4 skyNearClouds(vec2 uv, float asp, float sc, float extra, out float dens) {
  vec2 p = vec2(uv.x * asp, uv.y);
  vec2 sunDir = normalize(vec2(-0.45, 0.9));
  float scale = 1.25;
  vec2 cp = p * scale + vec2(u_time * 0.011, -sc * 0.6) + 17.0;
  vec2 q = warp(cp);
  float shape = (0.42 - uv.y) * 0.55 + 0.10 * smoothstep(0.3, 0.0, min(uv.x, 1.0 - uv.x)) + extra;
  dens = fbm(cp + 1.7 * q) + shape;
  float a = smoothstep(0.5, 0.55, dens);
  if (a <= 0.001) return vec4(0.0);
  float ahead = fbm(cp + sunDir * 0.06 + 1.7 * q) + shape - sunDir.y * 0.06 / scale * 0.55;
  float light = clamp(0.62 + (dens - ahead) * 7.0, 0.0, 1.0);
  float depth = smoothstep(0.5, 0.85, dens);
  vec3 c = mix(skyShade(), skyLit(), light);
  c = mix(c, skyShade(), depth * 0.35 * (1.0 - light));
  return vec4(c * a, a);
}

// soft vignette and film grain: a picture, not a render
vec3 skyFinish(vec3 col, vec2 uv, float asp, vec2 frag) {
  float vig = smoothstep(1.25, 0.35, length((uv - 0.5) * vec2(asp, 1.0)));
  col *= mix(0.9, 1.0, vig);
  return col + (hash(frag + fract(u_time) * 100.0) - 0.5) * 0.035;
}
`;
