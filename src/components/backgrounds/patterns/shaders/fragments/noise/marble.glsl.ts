/**
 * Marble fragment shader
 * Flowing veins like natural stone or wood grain
 */

import {
  baseUniformDeclarations,
  fbmUniformDeclarations,
  marbleUniformDeclarations
} from '../../uniforms';
import {
  commonNoiseFunctions,
  fbm,
  sharedMainUtilities,
  animationDirection
} from '../../common.glsl';

/** Marble function */
const marble2D = `
float marble2D(vec2 p) {
  float timeOffset = uAnimated ? uTime * 0.1 * uSpeed : 0.0;

  // Get layered noise using FBM with uniform params
  float n = fbm(p + timeOffset);

  // Create flowing lines distorted by noise - parameterized frequency and influence
  float lines = sin(p.x * uLineFrequency + n * uNoiseInfluence + p.y * 2.0);
  lines = lines * 0.5 + 0.5; // Normalize to 0-1

  // Add secondary detail
  float detail = sin(p.y * (uLineFrequency * 1.5) + n * (uNoiseInfluence * 0.67) - p.x * 1.5 + timeOffset);
  detail = detail * 0.5 + 0.5;

  // Parameterized detail blend
  return mix(lines, detail, uDetailBlend);
}
`;

export const marbleFragmentShader = `
${baseUniformDeclarations}
${fbmUniformDeclarations}
${marbleUniformDeclarations}

varying vec2 vUv;

${commonNoiseFunctions}
${fbm}
${marble2D}
${sharedMainUtilities}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * uNoiseScale;

  ${animationDirection}

  // Marble with directional drift
  float n = marble2D(p + timeOffset2D * 0.5);

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
