/**
 * Blueprint fragment shader
 * Technical drawing elements: dimension lines, corner brackets, markers
 */

import {
  baseUniformDeclarations,
  blueprintUniformDeclarations
} from '../uniforms';
import {
  geometricPrimitives,
  noiseForUtilities,
  sharedMainUtilities,
  animationDirection
} from '../common.glsl';

/** Dimension line with end markers and optional tick marks */
const dimensionLine = `
float dimensionLine(vec2 uv, vec2 center, float angle, float length, float thickness, float markerSize, int ticks) {
  float result = 0.0;

  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 perp = vec2(-dir.y, dir.x);

  vec2 a = center - dir * length * 0.5;
  vec2 b = center + dir * length * 0.5;

  // Main dimension line
  float mainLine = sdfLine(uv, a, b);
  result = max(result, 1.0 - smoothstep(0.0, thickness, mainLine));

  // End markers (perpendicular lines at endpoints)
  vec2 markerA1 = a - perp * markerSize;
  vec2 markerA2 = a + perp * markerSize;
  float marker1 = sdfLine(uv, markerA1, markerA2);
  result = max(result, 1.0 - smoothstep(0.0, thickness, marker1));

  vec2 markerB1 = b - perp * markerSize;
  vec2 markerB2 = b + perp * markerSize;
  float marker2 = sdfLine(uv, markerB1, markerB2);
  result = max(result, 1.0 - smoothstep(0.0, thickness, marker2));

  // Tick marks along the line
  for (int i = 1; i < 6; i++) {
    if (i > ticks) break;
    float t = float(i) / float(ticks + 1);
    vec2 tickPos = mix(a, b, t);
    vec2 tick1 = tickPos - perp * markerSize * 0.4;
    vec2 tick2 = tickPos + perp * markerSize * 0.4;
    float tick = sdfLine(uv, tick1, tick2);
    result = max(result, (1.0 - smoothstep(0.0, thickness, tick)) * 0.6);
  }

  return result;
}
`;

/** Corner bracket (L-shape) */
const cornerBracket = `
float cornerBracket(vec2 uv, vec2 corner, float rotation, float size, float thickness) {
  float result = 0.0;

  // Rotate local space
  vec2 localP = uv - corner;
  localP = rotate2D(rotation) * localP;

  // Horizontal arm of the bracket
  vec2 h1 = vec2(0.0, 0.0);
  vec2 h2 = vec2(size, 0.0);
  float hLine = sdfLine(localP, h1, h2);
  result = max(result, 1.0 - smoothstep(0.0, thickness, hLine));

  // Vertical arm of the bracket
  vec2 v1 = vec2(0.0, 0.0);
  vec2 v2 = vec2(0.0, size);
  float vLine = sdfLine(localP, v1, v2);
  result = max(result, 1.0 - smoothstep(0.0, thickness, vLine));

  return result;
}
`;

/** Blueprint pattern function */
const blueprintPattern = `
float blueprint(vec2 uv) {
  float result = 0.0;

  vec2 gridScale = vec2(uElementDensity);

  // Check surrounding cells
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 cellId = floor(uv * gridScale) + vec2(float(x), float(y));

      // Skip most cells for sparsity (~20%)
      if (hash2D(cellId) > 0.2) continue;

      // Element position with jitter
      vec2 cellCenter = (cellId + hash2DVec(cellId) * 0.6 + 0.2) / gridScale;

      // Very slow drift animation for professional feel
      float driftPhase = hash2D(cellId + vec2(1.0, 0.0)) * 6.28;
      cellCenter += vec2(
        sin(uTime * 0.03 * uSpeed + driftPhase),
        cos(uTime * 0.025 * uSpeed + driftPhase)
      ) * 0.006;

      // Choose element type based on hash and bracketRatio
      float elementType = hash2D(cellId + vec2(2.0, 0.0));

      if (elementType < uBracketRatio) {
        // Corner bracket
        // Choose one of 4 rotations (0, 90, 180, 270 degrees)
        float rotIndex = floor(hash2D(cellId + vec2(3.0, 0.0)) * 4.0);
        float rotation = rotIndex * 1.5708; // PI/2

        result = max(result, cornerBracket(uv, cellCenter, rotation, uBracketSize, uLineThickness));
      } else {
        // Dimension line
        // Horizontal or vertical alignment
        float angle = hash2D(cellId + vec2(4.0, 0.0)) < 0.5 ? 0.0 : 1.5708;

        // Length variation
        float length = uDimensionLength * (0.7 + hash2D(cellId + vec2(5.0, 0.0)) * 0.6);

        result = max(result, dimensionLine(uv, cellCenter, angle, length, uLineThickness, uMarkerSize, uTickDensity));
      }
    }
  }

  return result;
}
`;

export const blueprintFragmentShader = `
${baseUniformDeclarations}
${blueprintUniformDeclarations}

varying vec2 vUv;

${noiseForUtilities}
${geometricPrimitives}
${sharedMainUtilities}
${dimensionLine}
${cornerBracket}
${blueprintPattern}

void main() {
  vec2 uv = vUv;

  ${animationDirection}

  // Apply very subtle global drift
  vec2 driftedUv = uv + timeOffset2D * 0.03;

  // Generate blueprint pattern
  float n = blueprint(driftedUv);

  // Apply gradient color - technical/blueprint feel
  float colorIndex = uv.x * 0.2 + uv.y * 0.2;
  vec3 color = getGradientColor(fract(colorIndex));
  color = applyColorShift(color);

  // Calculate alpha with intensity and edge fade
  float alpha = n * uIntensity;
  alpha *= getEdgeFade(uv);
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
}
`;
