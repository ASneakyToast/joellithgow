/**
 * Caustics fragment shader
 * Underwater light refraction patterns
 */

import {
  baseUniformDeclarations,
  causticsUniformDeclarations
} from '../../uniforms';
import {
  commonNoiseFunctions,
  sharedMainUtilities,
  animationDirection
} from '../../common.glsl';

/** Caustics function */
const caustics2D = `
float caustics2D(vec2 p) {
  float timeOffset = uAnimated ? uTime * 0.5 * uSpeed : 0.0;
  float c = 0.0;

  // Overlapping wave patterns - parameterized wave count
  for (int i = 0; i < 6; i++) {
    if (i >= uWaveCount) break;
    float angle = float(i) * (6.283185 / float(uWaveCount)); // Evenly distributed angles
    vec2 dir = vec2(cos(angle), sin(angle));

    // Distort with noise for organic feel
    float noiseOffset = simplex2D(p * 0.5 + float(i) * 3.0) * 2.0;

    // Use parameterized wave frequency
    float wave = sin(dot(p, dir) * uWaveFrequency + timeOffset + noiseOffset);
    wave = wave * 0.5 + 0.5; // Normalize to 0-1
    wave = pow(wave, uWaveSharpness); // Parameterized sharpness

    c = max(c, wave);
  }

  // Add detail layer with parameterized amount
  c += simplex2D(p * 4.0 + timeOffset * 0.3) * uDetailAmount;

  return clamp(c, 0.0, 1.0);
}
`;

export const causticsFragmentShader = `
${baseUniformDeclarations}
${causticsUniformDeclarations}

varying vec2 vUv;

${commonNoiseFunctions}
${caustics2D}
${sharedMainUtilities}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * uNoiseScale;

  ${animationDirection}

  // Caustics with directional drift
  float n = caustics2D(p + timeOffset2D * 0.8);

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
