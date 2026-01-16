/**
 * Perlin noise fragment shader
 * Classic gradient noise with smooth, organic variations
 */

import {
  baseUniformDeclarations,
  fbmUniformDeclarations,
  perlinSimplexUniformDeclarations
} from '../../uniforms';
import {
  commonNoiseFunctions,
  fbm,
  sharedMainUtilities,
  animationDirection
} from '../../common.glsl';

export const perlinFragmentShader = `
${baseUniformDeclarations}
${fbmUniformDeclarations}
${perlinSimplexUniformDeclarations}

varying vec2 vUv;

${commonNoiseFunctions}
${fbm}
${sharedMainUtilities}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * uNoiseScale;

  ${animationDirection}

  // Perlin FBM with time scaling
  vec2 perlinOffset = uAnimated ? timeOffset2D * vec2(uTimeScaleX, uTimeScaleY) : vec2(0.0);
  float n = fbm(p + perlinOffset);
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
