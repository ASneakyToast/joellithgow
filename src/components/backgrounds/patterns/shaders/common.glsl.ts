/**
 * Shared GLSL noise functions for all pattern components
 * These are composed into pattern-specific fragment shaders
 */

/** Permutation polynomial for hash */
export const permute = `
vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}
`;

/** 2D Simplex Noise */
export const simplex2D = `
float simplex2D(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                          dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

/** Classic Perlin fade curve */
export const fade = `
vec2 fade(vec2 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
`;

/** 2D hash function */
export const hash2D = `
float hash2D(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
`;

/** Classic Perlin 2D noise */
export const perlin2D = `
float perlin2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = fade(f);

  float a = hash2D(i);
  float b = hash2D(i + vec2(1.0, 0.0));
  float c = hash2D(i + vec2(0.0, 1.0));
  float d = hash2D(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0;
}
`;

/** Fractal Brownian Motion (requires uOctaves, uLacunarity, uGain uniforms) */
export const fbm = `
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 8; i++) {
    if (i >= uOctaves) break;
    value += amplitude * simplex2D(p * frequency);
    amplitude *= uGain;
    frequency *= uLacunarity;
  }

  return value;
}
`;

/** Animation direction calculation (shared by all patterns) */
export const animationDirection = `
// Compute animation direction from angle (convert degrees to radians)
float angleRad = uAnimationAngle * 3.14159265 / 180.0;
vec2 animDir = vec2(cos(angleRad), sin(angleRad));

// Time offset for animation as 2D vector with direction
float timeMag = uAnimated ? uTime * 0.15 * uSpeed : 0.0;
vec2 timeOffset2D = animDir * timeMag;
`;

/** 3-color gradient calculation (shared by all patterns) */
export const colorGradient = `
vec3 getGradientColor(float n) {
  vec3 color;
  if (n < 0.33) {
    color = mix(uColorPrimary, uColorSecondary, n * 3.0);
  } else if (n < 0.66) {
    color = mix(uColorSecondary, uColorTertiary, (n - 0.33) * 3.0);
  } else {
    color = mix(uColorTertiary, uColorPrimary, (n - 0.66) * 3.0);
  }
  return color;
}
`;

/** Color shift animation (shared by all patterns) */
export const colorShift = `
vec3 applyColorShift(vec3 color) {
  if (uAnimated) {
    float colorShift = sin(uTime * 0.2 * uSpeed) * 0.1;
    color = mix(color, color.gbr, colorShift + 0.1);
  }
  return color;
}
`;

/** Edge fade calculation (shared by all patterns) - disabled for edge-to-edge coverage */
export const edgeFade = `
float getEdgeFade(vec2 uv) {
  return 1.0;
}
`;

/** Micro texture variation (shared by all patterns) */
export const microTexture = `
float getMicroTexture(vec2 uv) {
  return simplex2D(uv * uResolution * 0.02) * 0.05;
}
`;

// =============================================================================
// SDF GEOMETRIC PRIMITIVES (for sparse geometric patterns)
// =============================================================================

/** Signed distance to a circle */
export const sdfCircle = `
float sdfCircle(vec2 p, float r) {
  return length(p) - r;
}
`;

/** Signed distance to a line segment */
export const sdfLine = `
float sdfLine(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
`;

/** Signed distance to an equilateral triangle */
export const sdfTriangle = `
float sdfTriangle(vec2 p, float r) {
  const float k = sqrt(3.0);
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}
`;

/** Signed distance to a regular hexagon */
export const sdfHexagon = `
float sdfHexagon(vec2 p, float r) {
  const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}
`;

/** 2D rotation matrix */
export const rotate2D = `
mat2 rotate2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}
`;

/** Pseudo-random vec2 from vec2 (for positions/offsets) */
export const hash2DVec = `
vec2 hash2DVec(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
`;

// =============================================================================
// COMPOSED EXPORTS
// =============================================================================

/** Compose all common noise functions */
export const commonNoiseFunctions = `
${permute}
${simplex2D}
${fade}
${hash2D}
${perlin2D}
`;

/** Compose shared main utilities (color gradient, edge fade, micro texture) */
export const sharedMainUtilities = `
${colorGradient}
${colorShift}
${edgeFade}
${microTexture}
`;

/** Compose geometric SDF primitives for sparse patterns */
export const geometricPrimitives = `
${hash2D}
${hash2DVec}
${rotate2D}
${sdfCircle}
${sdfLine}
${sdfTriangle}
${sdfHexagon}
`;

/** Noise dependencies required by sharedMainUtilities (for geometric patterns) */
export const noiseForUtilities = `
${permute}
${simplex2D}
`;
