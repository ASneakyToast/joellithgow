/**
 * Turbulence fragment shader
 * Billowy cloud-like patterns with high contrast swirls
 */

import {
  baseUniformDeclarations,
  fbmUniformDeclarations,
  turbulenceUniformDeclarations
} from '../../uniforms';
import {
  commonNoiseFunctions,
  sharedMainUtilities,
  animationDirection
} from '../../common.glsl';

/** Turbulence function - Absolute value FBM for billowy clouds */
const turbulence2D = `
float turbulence2D(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  vec2 pos = p;

  for (int i = 0; i < 8; i++) {
    if (i >= uOctaves) break;
    // Apply sharpness multiplier to abs value
    value += amplitude * abs(simplex2D(pos)) * uSharpness;
    pos *= uLacunarity;
    amplitude *= uGain;
  }

  return value;
}
`;

export const turbulenceFragmentShader = `
${baseUniformDeclarations}
${fbmUniformDeclarations}
${turbulenceUniformDeclarations}

varying vec2 vUv;

${commonNoiseFunctions}
${turbulence2D}
${sharedMainUtilities}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * uNoiseScale;

  ${animationDirection}

  // Turbulence with direction
  float n = turbulence2D(p + timeOffset2D);

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
