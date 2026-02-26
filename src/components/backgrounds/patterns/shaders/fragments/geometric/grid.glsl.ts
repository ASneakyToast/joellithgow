/**
 * Geometric Grid fragment shader
 * Procedural grid lines with configurable animation types (drift, pulse, wave)
 * Adapted from GeometricGridBackground for the pattern registry system
 */

import {
  baseUniformDeclarations,
  geometricGridUniformDeclarations
} from '../../uniforms';
import {
  noiseForUtilities,
  sharedMainUtilities,
  animationDirection
} from '../../common.glsl';

export const geometricGridFragmentShader = `
${baseUniformDeclarations}
${geometricGridUniformDeclarations}

varying vec2 vUv;

${noiseForUtilities}
${sharedMainUtilities}

void main() {
  vec2 uv = vUv;
  vec2 pixelCoord = uv * uResolution;

  ${animationDirection}

  // Animation offset based on type
  vec2 offset = vec2(0.0);
  float pulse = 1.0;

  // 0 = drift, 1 = pulse, 2 = wave
  if (uAnimationType == 0) {
    // Drift animation - subtle movement
    offset = vec2(
      sin(uTime * 0.3 * uSpeed) * 20.0,
      cos(uTime * 0.2 * uSpeed) * 15.0
    );
  } else if (uAnimationType == 1) {
    // Pulse animation - breathing grid
    pulse = 0.8 + 0.4 * sin(uTime * 1.5 * uSpeed);
  } else if (uAnimationType == 2) {
    // Wave animation - undulating lines
    float wave = sin(pixelCoord.x * 0.01 + uTime * uSpeed) * 10.0;
    offset.y = wave;
  }

  // Apply offset to coordinates
  vec2 gridCoord = pixelCoord + offset;

  // Calculate grid
  vec2 grid = mod(gridCoord, uGridSize);

  // Create grid lines with adjustable width
  float lineX = step(uGridSize - uLineWidth * pulse, grid.x);
  float lineY = step(uGridSize - uLineWidth * pulse, grid.y);
  float gridLine = max(lineX, lineY);

  // Create intersection points (nodes)
  float nodeSize = uLineWidth * 2.5 * pulse;
  float nodeX = step(uGridSize - nodeSize, grid.x);
  float nodeY = step(uGridSize - nodeSize, grid.y);
  float node = nodeX * nodeY;

  // Color mixing based on position
  float colorMix = sin(uv.x * 3.14159 + uTime * 0.5 * uSpeed) * 0.5 + 0.5;
  vec3 lineColor = mix(uColorPrimary, uColorSecondary, colorMix);

  // Combine lines and nodes
  float alpha = gridLine * uIntensity * 0.6;
  alpha += node * uIntensity * 0.3;

  // Add subtle glow to lines
  float glowX = smoothstep(uGridSize - uLineWidth * 3.0, uGridSize - uLineWidth, grid.x);
  float glowY = smoothstep(uGridSize - uLineWidth * 3.0, uGridSize - uLineWidth, grid.y);
  float glow = max(glowX, glowY) * 0.15 * uIntensity;
  alpha += glow;

  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(lineColor, alpha);
}
`;
