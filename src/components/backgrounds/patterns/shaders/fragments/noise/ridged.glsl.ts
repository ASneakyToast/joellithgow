/**
 * Ridged Multifractal fragment shader
 * Sharp ridge patterns like mountain ranges or lightning
 */

import {
  baseUniformDeclarations,
  fbmUniformDeclarations,
  ridgedUniformDeclarations
} from '../../uniforms';
import {
  commonNoiseFunctions,
  sharedMainUtilities,
  animationDirection
} from '../../common.glsl';

/** Ridged Multifractal function */
const ridged2D = `
float ridged2D(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float prev = 1.0;
  vec2 pos = p;

  for (int i = 0; i < 8; i++) {
    if (i >= uOctaves) break;
    float n = 1.0 - abs(simplex2D(pos));
    // Apply ridge sharpness as power
    n = pow(n, uRidgeSharpness);
    n *= prev; // Weight by previous octave
    value += amplitude * n;
    prev = n;
    pos *= uLacunarity;
    amplitude *= uGain;
  }

  return value;
}
`;

export const ridgedFragmentShader = `
${baseUniformDeclarations}
${fbmUniformDeclarations}
${ridgedUniformDeclarations}

varying vec2 vUv;

${commonNoiseFunctions}
${ridged2D}
${sharedMainUtilities}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * uNoiseScale;

  ${animationDirection}

  // Ridged with time scale and direction
  vec2 ridgeOffset = uAnimated ? timeOffset2D * uRidgeTimeScale : vec2(0.0);
  float n = ridged2D(p + ridgeOffset);

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
