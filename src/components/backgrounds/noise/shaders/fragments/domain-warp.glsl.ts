/**
 * Domain Warp fragment shader
 * Fluid distortion effect by warping coordinate space
 */

import {
  baseUniformDeclarations,
  domainWarpUniformDeclarations
} from '../uniforms';
import {
  commonNoiseFunctions,
  sharedMainUtilities,
  animationDirection
} from '../common.glsl';

/** Domain Warp function */
const domainWarp2D = `
float domainWarp2D(vec2 p) {
  float timeOffset = uAnimated ? uTime * 0.1 * uSpeed : 0.0;

  // First warp layer (always present)
  vec2 q = vec2(
    simplex2D(p + vec2(0.0, 0.0) + timeOffset),
    simplex2D(p + vec2(5.2, 1.3) + timeOffset * 0.7)
  );

  // Apply warp strength to first layer
  vec2 warped = p + uWarpStrength * q;

  // Second warp layer (if layers >= 2)
  if (uWarpLayers >= 2) {
    vec2 r = vec2(
      simplex2D(warped + vec2(1.7, 9.2) + timeOffset * 0.5),
      simplex2D(warped + vec2(8.3, 2.8) + timeOffset * 0.3)
    );
    warped = p + uWarpStrength * r;

    // Third warp layer (if layers >= 3)
    if (uWarpLayers >= 3) {
      vec2 s = vec2(
        simplex2D(warped + vec2(3.2, 7.1) + timeOffset * 0.2),
        simplex2D(warped + vec2(6.5, 4.9) + timeOffset * 0.15)
      );
      warped = p + uWarpStrength * s;
    }
  }

  return simplex2D(warped);
}
`;

export const domainWarpFragmentShader = `
${baseUniformDeclarations}
${domainWarpUniformDeclarations}

varying vec2 vUv;

${commonNoiseFunctions}
${domainWarp2D}
${sharedMainUtilities}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * uNoiseScale;

  ${animationDirection}

  // Domain warp with directional drift
  float n = domainWarp2D(p + timeOffset2D * 0.5);
  n = n * 0.5 + 0.5;

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
