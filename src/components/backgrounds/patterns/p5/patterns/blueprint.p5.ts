/**
 * Blueprint p5.js Pattern
 * Technical drawing style with dimension lines and brackets
 */

import type p5 from 'p5';
import { P5PatternManager } from '../P5PatternManager';
import type { BlueprintConfig, BlueprintElement } from '../types';

export class BlueprintP5Manager extends P5PatternManager<BlueprintConfig> {
  private elements: BlueprintElement[] = [];

  protected parsePatternConfig(container: HTMLElement): Partial<BlueprintConfig> {
    return {
      elementDensity: parseFloat(container.dataset.elementDensity || '1.0'),
      dimensionLength: parseFloat(container.dataset.dimensionLength || '0.12'),
      lineThickness: parseFloat(container.dataset.lineThickness || '0.001'),
      markerSize: parseFloat(container.dataset.markerSize || '0.006'),
      bracketSize: parseFloat(container.dataset.bracketSize || '0.04'),
      bracketRatio: parseFloat(container.dataset.bracketRatio || '0.3'),
      tickDensity: parseInt(container.dataset.tickDensity || '2', 10)
    };
  }

  protected setup(p: p5): void {
    this.generateElements(p);
    p.clear();
  }

  private seededRandom(seed: number): number {
    // Simple seeded random for consistent positioning
    const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  private generateElements(p: p5): void {
    this.elements = [];
    const gridSize = Math.floor(this.config.elementDensity * 8);
    const cellSize = 1 / gridSize;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const seed = y * gridSize + x;
        // Skip ~80% of cells for sparsity
        if (this.seededRandom(seed) > 0.2) continue;

        const cellX = (x + this.seededRandom(seed + 1) * 0.6 + 0.2) * cellSize;
        const cellY = (y + this.seededRandom(seed + 2) * 0.6 + 0.2) * cellSize;

        const elementType = this.seededRandom(seed + 3) < this.config.bracketRatio ? 'bracket' : 'dimension';
        const angle = elementType === 'dimension'
          ? (this.seededRandom(seed + 4) < 0.5 ? 0 : Math.PI / 2)
          : Math.floor(this.seededRandom(seed + 5) * 4) * (Math.PI / 2);
        const length = this.config.dimensionLength * (0.7 + this.seededRandom(seed + 6) * 0.6);

        this.elements.push({
          x: cellX,
          y: cellY,
          type: elementType,
          angle,
          length,
          rotation: angle,
          driftPhase: this.seededRandom(seed + 7) * Math.PI * 2
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

    p.strokeWeight(this.config.lineThickness * p.width);

    for (const element of this.elements) {
      // Very slow drift animation
      const driftX = Math.sin(time * 0.03 + element.driftPhase) * 0.006;
      const driftY = Math.cos(time * 0.025 + element.driftPhase) * 0.006;

      const x = (element.x + driftX) * p.width;
      const y = (element.y + driftY) * p.height;

      // Color based on position
      const t = (element.x + element.y) / 2;
      const r = p.lerp(primary.r, secondary.r, t);
      const g = p.lerp(primary.g, secondary.g, t);
      const b = p.lerp(primary.b, secondary.b, t);
      const alpha = this.config.intensity * 255;

      p.stroke(r, g, b, alpha);

      if (element.type === 'bracket') {
        this.drawBracket(p, x, y, element.rotation);
      } else {
        this.drawDimensionLine(p, x, y, element.angle, element.length);
      }
    }
  }

  private drawBracket(p: p5, x: number, y: number, rotation: number): void {
    const size = this.config.bracketSize * p.width;

    p.push();
    p.translate(x, y);
    p.rotate(rotation);

    // Horizontal arm
    p.line(0, 0, size, 0);
    // Vertical arm
    p.line(0, 0, 0, size);

    p.pop();
  }

  private drawDimensionLine(p: p5, x: number, y: number, angle: number, length: number): void {
    const len = length * p.width;
    const markerSize = this.config.markerSize * p.width;

    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const perpX = -dirY;
    const perpY = dirX;

    // Line endpoints
    const ax = x - dirX * len * 0.5;
    const ay = y - dirY * len * 0.5;
    const bx = x + dirX * len * 0.5;
    const by = y + dirY * len * 0.5;

    // Main dimension line
    p.line(ax, ay, bx, by);

    // End markers (perpendicular lines at endpoints)
    p.line(
      ax - perpX * markerSize,
      ay - perpY * markerSize,
      ax + perpX * markerSize,
      ay + perpY * markerSize
    );
    p.line(
      bx - perpX * markerSize,
      by - perpY * markerSize,
      bx + perpX * markerSize,
      by + perpY * markerSize
    );

    // Tick marks along the line
    const tickMarkerSize = markerSize * 0.4;
    for (let i = 1; i <= this.config.tickDensity; i++) {
      const t = i / (this.config.tickDensity + 1);
      const tx = p.lerp(ax, bx, t);
      const ty = p.lerp(ay, by, t);

      // Slightly dimmer ticks
      const currentAlpha = p.alpha(p.drawingContext.strokeStyle as string) || 255;
      p.stroke(p.red(p.drawingContext.strokeStyle as string) || 255,
               p.green(p.drawingContext.strokeStyle as string) || 255,
               p.blue(p.drawingContext.strokeStyle as string) || 255,
               currentAlpha * 0.6);

      p.line(
        tx - perpX * tickMarkerSize,
        ty - perpY * tickMarkerSize,
        tx + perpX * tickMarkerSize,
        ty + perpY * tickMarkerSize
      );
    }
  }

  protected updatePatternConfig(props: Partial<BlueprintConfig>): void {
    let regenerateElements = false;

    if (props.elementDensity !== undefined && props.elementDensity !== this.config.elementDensity) {
      this.config.elementDensity = props.elementDensity;
      regenerateElements = true;
    }
    if (props.dimensionLength !== undefined) {
      this.config.dimensionLength = props.dimensionLength;
    }
    if (props.lineThickness !== undefined) {
      this.config.lineThickness = props.lineThickness;
    }
    if (props.markerSize !== undefined) {
      this.config.markerSize = props.markerSize;
    }
    if (props.bracketSize !== undefined) {
      this.config.bracketSize = props.bracketSize;
    }
    if (props.bracketRatio !== undefined && props.bracketRatio !== this.config.bracketRatio) {
      this.config.bracketRatio = props.bracketRatio;
      regenerateElements = true;
    }
    if (props.tickDensity !== undefined) {
      this.config.tickDensity = props.tickDensity;
    }

    if (regenerateElements && this.p5Instance) {
      this.generateElements(this.p5Instance);
    }
  }
}
