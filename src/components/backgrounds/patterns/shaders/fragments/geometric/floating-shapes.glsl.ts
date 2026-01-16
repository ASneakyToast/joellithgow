/**
 * Floating Shapes fragment shader
 * Scattered triangles, hexagons, and circles drifting slowly
 */

import {
  baseUniformDeclarations,
  floatingShapesUniformDeclarations
} from '../../uniforms';
import {
  geometricPrimitives,
  noiseForUtilities,
  sharedMainUtilities,
  animationDirection
} from '../../common.glsl';

/** Floating shapes pattern function */
const floatingShapesPattern = `
float floatingShapes(vec2 uv) {
  float result = 0.0;

  // Grid for potential shape positions
  vec2 gridScale = vec2(uShapeDensity);

  // Check surrounding cells
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 cellId = floor(uv * gridScale) + vec2(float(x), float(y));
      vec2 randomOffset = hash2DVec(cellId);

      // Skip most cells for sparsity (~20% have shapes)
      if (hash2D(cellId + vec2(0.5, 0.5)) > 0.2) continue;

      // Shape position within cell
      vec2 shapePos = (cellId + randomOffset * 0.8 + 0.1) / gridScale;

      // Drift animation - gentle floating motion
      float driftPhase = hash2D(cellId) * 6.28;
      float driftSpeed = 0.08 + hash2D(cellId + vec2(1.0, 0.0)) * 0.04;
      shapePos += vec2(
        sin(uTime * driftSpeed * uSpeed + driftPhase) * 0.015,
        cos(uTime * driftSpeed * 0.8 * uSpeed + driftPhase) * 0.015
      );

      // Local coordinates relative to shape center
      vec2 localP = uv - shapePos;

      // Rotation animation
      float rotAngle = uTime * uRotationSpeed * uSpeed * 0.5 + hash2D(cellId + vec2(2.0, 0.0)) * 6.28;
      localP = rotate2D(rotAngle) * localP;

      // Size with variation
      float baseSize = uShapeSize * (1.0 - uSizeVariation * 0.5 + hash2D(cellId + vec2(3.0, 0.0)) * uSizeVariation);

      // Choose shape type based on hash and shapeMix
      float shapeType = hash2D(cellId + vec2(4.0, 0.0));
      float dist;

      // shapeMix: 0 = all circles, 0.5 = mixed, 1 = all polygons
      float circleThreshold = (1.0 - uShapeMix) * 0.5;
      float triangleThreshold = circleThreshold + 0.25 + uShapeMix * 0.25;

      if (shapeType < circleThreshold) {
        // Circle
        dist = sdfCircle(localP, baseSize);
      } else if (shapeType < triangleThreshold) {
        // Triangle
        dist = sdfTriangle(localP, baseSize);
      } else {
        // Hexagon
        dist = sdfHexagon(localP, baseSize);
      }

      // Soft edge rendering
      float shape = 1.0 - smoothstep(-uEdgeSoftness, uEdgeSoftness, dist);

      // Subtle glow around shapes
      float glow = exp(-abs(dist) * 30.0) * 0.2;
      shape += glow;

      result = max(result, shape);
    }
  }

  return clamp(result, 0.0, 1.0);
}
`;

export const floatingShapesFragmentShader = `
${baseUniformDeclarations}
${floatingShapesUniformDeclarations}

varying vec2 vUv;

${noiseForUtilities}
${geometricPrimitives}
${sharedMainUtilities}
${floatingShapesPattern}

void main() {
  vec2 uv = vUv;

  ${animationDirection}

  // Apply global drift to UV
  vec2 driftedUv = uv + timeOffset2D * 0.08;

  // Generate floating shapes pattern
  float n = floatingShapes(driftedUv);

  // Apply gradient color based on UV position
  float colorIndex = uv.x * 0.5 + uv.y * 0.5;
  vec3 color = getGradientColor(fract(colorIndex + uTime * 0.02 * uSpeed));
  color = applyColorShift(color);

  // Calculate alpha with intensity and edge fade
  float alpha = n * uIntensity;
  alpha *= getEdgeFade(uv);
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
}
`;
