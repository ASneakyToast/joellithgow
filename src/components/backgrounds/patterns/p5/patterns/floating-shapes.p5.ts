/**
 * Floating Shapes p5.js Pattern
 * Scattered triangles, hexagons, and circles drifting slowly
 */

import type p5 from 'p5';
import { P5PatternManager } from '../P5PatternManager';
import type { FloatingShapesConfig, Shape } from '../types';

export class FloatingShapesP5Manager extends P5PatternManager<FloatingShapesConfig> {
  private shapes: Shape[] = [];

  protected parsePatternConfig(container: HTMLElement): Partial<FloatingShapesConfig> {
    return {
      shapeDensity: parseFloat(container.dataset.shapeDensity || '1.5'),
      shapeSize: parseFloat(container.dataset.shapeSize || '0.05'),
      sizeVariation: parseFloat(container.dataset.sizeVariation || '0.5'),
      shapeMix: parseFloat(container.dataset.shapeMix || '0.5'),
      edgeSoftness: parseFloat(container.dataset.edgeSoftness || '0.005'),
      rotationSpeed: parseFloat(container.dataset.rotationSpeed || '0.2')
    };
  }

  protected setup(p: p5): void {
    this.generateShapes(p);
    p.clear();
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  private generateShapes(p: p5): void {
    this.shapes = [];
    const gridSize = Math.floor(this.config.shapeDensity * 6);
    const cellSize = 1 / gridSize;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const seed = y * gridSize + x;
        // Skip ~80% of cells for sparsity
        if (this.seededRandom(seed + 0.5) > 0.2) continue;

        const cellX = (x + this.seededRandom(seed + 1) * 0.8 + 0.1) * cellSize;
        const cellY = (y + this.seededRandom(seed + 2) * 0.8 + 0.1) * cellSize;

        // Determine shape type based on shapeMix
        const shapeRand = this.seededRandom(seed + 3);
        const circleThreshold = (1 - this.config.shapeMix) * 0.5;
        const triangleThreshold = circleThreshold + 0.25 + this.config.shapeMix * 0.25;

        let shapeType: 'circle' | 'triangle' | 'hexagon';
        if (shapeRand < circleThreshold) {
          shapeType = 'circle';
        } else if (shapeRand < triangleThreshold) {
          shapeType = 'triangle';
        } else {
          shapeType = 'hexagon';
        }

        const baseSize = this.config.shapeSize * (1 - this.config.sizeVariation * 0.5 + this.seededRandom(seed + 4) * this.config.sizeVariation);

        this.shapes.push({
          x: cellX,
          y: cellY,
          type: shapeType,
          size: baseSize,
          rotation: this.seededRandom(seed + 5) * Math.PI * 2,
          rotationSpeed: this.config.rotationSpeed * (0.5 + this.seededRandom(seed + 6)),
          driftPhase: this.seededRandom(seed + 7) * Math.PI * 2,
          driftSpeed: 0.08 + this.seededRandom(seed + 8) * 0.04
        });
      }
    }
  }

  protected draw(p: p5): void {
    const time = this.getElapsedTime() * this.config.speed;

    // Clear with transparent background
    p.clear();

    const colors = this.getThemeColors();
    const primary = this.hexToRgb(colors.primary);
    const secondary = this.hexToRgb(colors.secondary);
    const tertiary = this.hexToRgb(colors.tertiary);

    for (const shape of this.shapes) {
      // Drift animation
      const driftX = Math.sin(time * shape.driftSpeed + shape.driftPhase) * 0.015;
      const driftY = Math.cos(time * shape.driftSpeed * 0.8 + shape.driftPhase) * 0.015;

      const x = (shape.x + driftX) * p.width;
      const y = (shape.y + driftY) * p.height;
      const size = shape.size * p.width;
      const rotation = shape.rotation + time * this.config.rotationSpeed * 0.5;

      // Color based on position with gradient across all three colors
      const t = (shape.x + shape.y) / 2;
      let r: number, g: number, b: number;
      if (t < 0.5) {
        const t2 = t * 2;
        r = p.lerp(primary.r, secondary.r, t2);
        g = p.lerp(primary.g, secondary.g, t2);
        b = p.lerp(primary.b, secondary.b, t2);
      } else {
        const t2 = (t - 0.5) * 2;
        r = p.lerp(secondary.r, tertiary.r, t2);
        g = p.lerp(secondary.g, tertiary.g, t2);
        b = p.lerp(secondary.b, tertiary.b, t2);
      }

      // Draw with glow effect (multiple layers with decreasing alpha)
      p.noStroke();
      for (let layer = 2; layer >= 0; layer--) {
        const layerSize = size * (1 + layer * 0.3);
        const layerAlpha = (this.config.intensity * 255) / (layer + 1);
        p.fill(r, g, b, layerAlpha);

        this.drawShape(p, x, y, layerSize, rotation, shape.type);
      }
    }
  }

  private drawShape(p: p5, x: number, y: number, size: number, rotation: number, type: 'circle' | 'triangle' | 'hexagon'): void {
    p.push();
    p.translate(x, y);
    p.rotate(rotation);

    switch (type) {
      case 'circle':
        p.ellipse(0, 0, size, size);
        break;

      case 'triangle':
        p.beginShape();
        for (let i = 0; i < 3; i++) {
          const angle = i * (Math.PI * 2 / 3) - Math.PI / 2;
          p.vertex(Math.cos(angle) * size * 0.5, Math.sin(angle) * size * 0.5);
        }
        p.endShape(p.CLOSE);
        break;

      case 'hexagon':
        p.beginShape();
        for (let i = 0; i < 6; i++) {
          const angle = i * (Math.PI * 2 / 6);
          p.vertex(Math.cos(angle) * size * 0.5, Math.sin(angle) * size * 0.5);
        }
        p.endShape(p.CLOSE);
        break;
    }

    p.pop();
  }

  protected updatePatternConfig(props: Partial<FloatingShapesConfig>): void {
    let regenerateShapes = false;

    if (props.shapeDensity !== undefined && props.shapeDensity !== this.config.shapeDensity) {
      this.config.shapeDensity = props.shapeDensity;
      regenerateShapes = true;
    }
    if (props.shapeSize !== undefined) {
      this.config.shapeSize = props.shapeSize;
    }
    if (props.sizeVariation !== undefined) {
      this.config.sizeVariation = props.sizeVariation;
    }
    if (props.shapeMix !== undefined && props.shapeMix !== this.config.shapeMix) {
      this.config.shapeMix = props.shapeMix;
      regenerateShapes = true;
    }
    if (props.edgeSoftness !== undefined) {
      this.config.edgeSoftness = props.edgeSoftness;
    }
    if (props.rotationSpeed !== undefined) {
      this.config.rotationSpeed = props.rotationSpeed;
    }

    if (regenerateShapes && this.p5Instance) {
      this.generateShapes(this.p5Instance);
    }
  }
}
