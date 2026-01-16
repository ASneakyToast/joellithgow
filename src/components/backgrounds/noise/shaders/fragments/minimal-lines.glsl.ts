/**
 * Minimal Lines fragment shader
 * Sparse diagonal lines, scattered dashes, and crosshatch fragments
 */

import {
  baseUniformDeclarations,
  minimalLinesUniformDeclarations
} from '../uniforms';
import {
  geometricPrimitives,
  noiseForUtilities,
  sharedMainUtilities,
  animationDirection
} from '../common.glsl';

/** Minimal lines pattern function */
const minimalLinesPattern = `
float minimalLines(vec2 uv) {
  float result = 0.0;

  // Grid scale based on density
  vec2 gridScale = vec2(uLineDensity);

  // Check surrounding cells
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 cellId = floor(uv * gridScale) + vec2(float(x), float(y));
      vec2 cellCenter = (cellId + 0.5) / gridScale;

      // Skip most cells for sparsity (only ~25% have lines)
      float skipThreshold = hash2D(cellId);
      if (skipThreshold > 0.25) continue;

      // Line position with random jitter within cell
      vec2 jitter = (hash2DVec(cellId) - 0.5) * 0.8 / gridScale.x;
      vec2 lineCenter = cellCenter + jitter;

      // Calculate line angle
      float baseAngleRad = uBaseAngle * 3.14159 / 180.0;
      float angleVar = (hash2D(cellId + vec2(1.0, 0.0)) - 0.5) * uAngleVariation * 3.14159 / 180.0;
      float angle = baseAngleRad + angleVar;

      // Drift animation - subtle floating motion
      float driftPhase = hash2D(cellId + vec2(2.0, 0.0)) * 6.28;
      lineCenter += vec2(
        sin(uTime * 0.05 * uSpeed + driftPhase),
        cos(uTime * 0.04 * uSpeed + driftPhase)
      ) * 0.01;

      // Line length with variation
      float len = uLineLength * (1.0 - uLengthVariation * 0.5 + hash2D(cellId + vec2(3.0, 0.0)) * uLengthVariation);

      // Calculate line endpoints
      vec2 dir = vec2(cos(angle), sin(angle));
      vec2 a = lineCenter - dir * len * 0.5;
      vec2 b = lineCenter + dir * len * 0.5;

      // Draw main line with soft edge
      float lineDist = sdfLine(uv, a, b);
      float line = 1.0 - smoothstep(0.0, uLineThickness, lineDist);
      result = max(result, line);

      // Optional crosshatch - perpendicular line
      if (hash2D(cellId + vec2(4.0, 0.0)) < uCrosshatchChance) {
        vec2 crossDir = vec2(-dir.y, dir.x); // Perpendicular
        float crossLen = len * (0.3 + hash2D(cellId + vec2(5.0, 0.0)) * 0.4);
        vec2 crossA = lineCenter - crossDir * crossLen * 0.5;
        vec2 crossB = lineCenter + crossDir * crossLen * 0.5;

        float crossDist = sdfLine(uv, crossA, crossB);
        float crossLine = 1.0 - smoothstep(0.0, uLineThickness, crossDist);
        result = max(result, crossLine * 0.7); // Slightly dimmer
      }
    }
  }

  return result;
}
`;

export const minimalLinesFragmentShader = `
${baseUniformDeclarations}
${minimalLinesUniformDeclarations}

varying vec2 vUv;

${noiseForUtilities}
${geometricPrimitives}
${sharedMainUtilities}
${minimalLinesPattern}

void main() {
  vec2 uv = vUv;

  ${animationDirection}

  // Apply global drift to UV
  vec2 driftedUv = uv + timeOffset2D * 0.1;

  // Generate line pattern
  float n = minimalLines(driftedUv);

  // Apply gradient color based on position and pattern
  float colorIndex = uv.x * 0.3 + uv.y * 0.7 + n * 0.2;
  vec3 color = getGradientColor(fract(colorIndex));
  color = applyColorShift(color);

  // Calculate alpha with intensity and edge fade
  float alpha = n * uIntensity;
  alpha *= getEdgeFade(uv);
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
}
`;
