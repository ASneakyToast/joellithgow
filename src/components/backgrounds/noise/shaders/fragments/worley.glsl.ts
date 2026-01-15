/**
 * Worley noise fragment shader
 * Cellular patterns based on distance to random points
 */

import {
  baseUniformDeclarations,
  worleyUniformDeclarations
} from '../uniforms';
import {
  commonNoiseFunctions,
  sharedMainUtilities,
  animationDirection
} from '../common.glsl';

/** Worley noise function (parameterized) */
const worley2D = `
float worley2D(vec2 p) {
  vec2 scaledP = p * uCellScale;
  vec2 i = floor(scaledP);
  vec2 f = fract(scaledP);

  float minDist = 1.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = vec2(
        hash2D(i + neighbor),
        hash2D(i + neighbor + vec2(31.0, 17.0))
      );

      if (uAnimated) {
        point = 0.5 + 0.5 * sin(uTime * uCellAnimSpeed * uSpeed + 6.2831 * point);
      }

      vec2 diff = neighbor + point - f;
      float dist = length(diff);
      minDist = min(minDist, dist);
    }
  }

  // Invert based on uniform
  return uInvert ? 1.0 - minDist : minDist;
}
`;

export const worleyFragmentShader = `
${baseUniformDeclarations}
${worleyUniformDeclarations}

varying vec2 vUv;

${commonNoiseFunctions}
${worley2D}
${sharedMainUtilities}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * uNoiseScale;

  ${animationDirection}

  // Worley with directional drift
  float n = worley2D(p + timeOffset2D * 0.3);

  // Apply gradient color
  vec3 color = getGradientColor(n);
  color = applyColorShift(color);

  // Calculate alpha with soft edges
  float alpha = n * uIntensity;
  alpha *= getEdgeFade(uv);

  // Add subtle texture variation
  alpha += getMicroTexture(uv) * uIntensity;
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
}
`;
