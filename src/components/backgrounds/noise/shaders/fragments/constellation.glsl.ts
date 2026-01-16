/**
 * Constellation fragment shader
 * Sparse dots (stars) connected by thin lines - star map / network style
 */

import {
  baseUniformDeclarations,
  constellationUniformDeclarations
} from '../uniforms';
import {
  geometricPrimitives,
  noiseForUtilities,
  sharedMainUtilities,
  animationDirection
} from '../common.glsl';

/** Star position generator with drift animation */
const starPosition = `
vec2 getStarPosition(int index, float time) {
  vec2 seed = vec2(float(index) * 127.1, float(index) * 311.7);
  vec2 base = hash2DVec(seed);

  // Slow orbit-like drift animation
  float phase = hash2D(seed) * 6.28;
  float orbitSpeed = 0.5 + hash2D(seed + vec2(1.0, 0.0)) * 0.5;
  vec2 drift = vec2(
    sin(time * uDriftSpeed * uSpeed * orbitSpeed + phase),
    cos(time * uDriftSpeed * uSpeed * orbitSpeed * 0.7 + phase)
  ) * 0.04;

  return base + drift;
}
`;

/** Constellation pattern function */
const constellationPattern = `
float constellation(vec2 uv) {
  float result = 0.0;

  // First pass: draw stars
  for (int i = 0; i < 30; i++) {
    if (i >= uStarCount) break;

    vec2 starPos = getStarPosition(i, uTime);

    // Twinkle effect
    float twinklePhase = float(i) * 1.618 + uTime * 2.0;
    float twinkle = 1.0 + sin(twinklePhase) * uTwinkleIntensity;

    // Draw star point
    float dist = length(uv - starPos);
    float starSize = uPointSize * twinkle;

    // Star core
    float star = 1.0 - smoothstep(0.0, starSize, dist);

    // Soft glow around star
    float glow = exp(-dist * 40.0 / starSize) * 0.4;

    result = max(result, star + glow);
  }

  // Second pass: draw connections between nearby stars
  for (int i = 0; i < 30; i++) {
    if (i >= uStarCount) break;

    vec2 starA = getStarPosition(i, uTime);

    for (int j = i + 1; j < 30; j++) {
      if (j >= uStarCount) break;

      vec2 starB = getStarPosition(j, uTime);

      // Distance between stars
      float starDist = length(starA - starB);

      // Only connect nearby stars
      if (starDist < uConnectionDistance) {
        // Distance from current pixel to line
        float lineDist = sdfLine(uv, starA, starB);

        // Fade line based on star distance
        float fade = 1.0 - pow(starDist / uConnectionDistance, uLineFalloff);

        // Draw line with soft edges
        float line = (1.0 - smoothstep(0.0, uLineThickness, lineDist)) * fade * 0.4;

        result = max(result, line);
      }
    }
  }

  return clamp(result, 0.0, 1.0);
}
`;

export const constellationFragmentShader = `
${baseUniformDeclarations}
${constellationUniformDeclarations}

varying vec2 vUv;

${noiseForUtilities}
${geometricPrimitives}
${sharedMainUtilities}
${starPosition}
${constellationPattern}

void main() {
  vec2 uv = vUv;

  ${animationDirection}

  // Apply subtle global drift to UV
  vec2 driftedUv = uv + timeOffset2D * 0.05;

  // Generate constellation pattern
  float n = constellation(driftedUv);

  // Apply gradient color - stars shift color slightly
  float colorIndex = uv.x * 0.3 + uv.y * 0.3 + sin(uTime * 0.1) * 0.2;
  vec3 color = getGradientColor(fract(colorIndex));
  color = applyColorShift(color);

  // Calculate alpha with intensity and edge fade
  float alpha = n * uIntensity;
  alpha *= getEdgeFade(uv);
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
}
`;
