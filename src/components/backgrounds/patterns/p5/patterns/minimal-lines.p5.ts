/**
 * Minimal Lines p5.js Pattern
 * Sparse diagonal lines and crosshatch fragments
 */

import type p5 from 'p5';
import { P5PatternManager } from '../P5PatternManager';
import type { MinimalLinesConfig, LineElement } from '../types';

export class MinimalLinesP5Manager extends P5PatternManager<MinimalLinesConfig> {
  private lines: LineElement[] = [];

  protected parsePatternConfig(container: HTMLElement): Partial<MinimalLinesConfig> {
    return {
      lineDensity: parseFloat(container.dataset.lineDensity || '8.0'),
      lineLength: parseFloat(container.dataset.lineLength || '0.15'),
      lengthVariation: parseFloat(container.dataset.lengthVariation || '0.6'),
      lineThickness: parseFloat(container.dataset.lineThickness || '0.003'),
      angleVariation: parseFloat(container.dataset.angleVariation || '45'),
      baseAngle: parseFloat(container.dataset.baseAngle || '45'),
      crosshatchChance: parseFloat(container.dataset.crosshatchChance || '0.2'),
      fillRatio: parseFloat(container.dataset.fillRatio || '0.5')
    };
  }

  protected setup(p: p5): void {
    this.generateLines(p);
    p.clear();
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  private generateLines(p: p5): void {
    this.lines = [];
    const gridSize = Math.floor(this.config.lineDensity);
    const cellSize = 1 / gridSize;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const seed = y * gridSize + x;

        // Skip cells based on fill ratio
        if (this.seededRandom(seed) > this.config.fillRatio) continue;

        // Line position with jitter
        const jitterX = (this.seededRandom(seed + 1) - 0.5) * 0.8 * cellSize;
        const jitterY = (this.seededRandom(seed + 2) - 0.5) * 0.8 * cellSize;
        const lineX = (x + 0.5) * cellSize + jitterX;
        const lineY = (y + 0.5) * cellSize + jitterY;

        // Calculate angle
        const baseAngleRad = this.config.baseAngle * Math.PI / 180;
        const angleVar = (this.seededRandom(seed + 3) - 0.5) * this.config.angleVariation * Math.PI / 180;
        const angle = baseAngleRad + angleVar;

        // Line length with variation
        const len = this.config.lineLength * (1 - this.config.lengthVariation * 0.5 + this.seededRandom(seed + 4) * this.config.lengthVariation);

        // Crosshatch chance
        const hasCrosshatch = this.seededRandom(seed + 5) < this.config.crosshatchChance;
        const crosshatchLength = len * (0.3 + this.seededRandom(seed + 6) * 0.4);

        this.lines.push({
          x: lineX,
          y: lineY,
          angle,
          length: len,
          hasCrosshatch,
          crosshatchLength,
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

    for (const line of this.lines) {
      // Subtle drift animation
      const driftX = Math.sin(time * 0.05 + line.driftPhase) * 0.01;
      const driftY = Math.cos(time * 0.04 + line.driftPhase) * 0.01;

      const x = (line.x + driftX) * p.width;
      const y = (line.y + driftY) * p.height;
      const len = line.length * p.width;

      // Color based on position
      const t = (line.x + line.y) / 2;
      const r = p.lerp(primary.r, secondary.r, t);
      const g = p.lerp(primary.g, secondary.g, t);
      const b = p.lerp(primary.b, secondary.b, t);
      const alpha = this.config.intensity * 255;

      // Direction vector
      const dirX = Math.cos(line.angle);
      const dirY = Math.sin(line.angle);

      // Draw main line
      p.stroke(r, g, b, alpha);
      const ax = x - dirX * len * 0.5;
      const ay = y - dirY * len * 0.5;
      const bx = x + dirX * len * 0.5;
      const by = y + dirY * len * 0.5;
      p.line(ax, ay, bx, by);

      // Draw crosshatch if applicable
      if (line.hasCrosshatch) {
        const crossLen = line.crosshatchLength * p.width;
        const crossDirX = -dirY; // Perpendicular
        const crossDirY = dirX;

        // Slightly dimmer crosshatch
        p.stroke(r, g, b, alpha * 0.7);
        p.line(
          x - crossDirX * crossLen * 0.5,
          y - crossDirY * crossLen * 0.5,
          x + crossDirX * crossLen * 0.5,
          y + crossDirY * crossLen * 0.5
        );
      }
    }
  }

  protected updatePatternConfig(props: Partial<MinimalLinesConfig>): void {
    let regenerateLines = false;

    if (props.lineDensity !== undefined && props.lineDensity !== this.config.lineDensity) {
      this.config.lineDensity = props.lineDensity;
      regenerateLines = true;
    }
    if (props.lineLength !== undefined) {
      this.config.lineLength = props.lineLength;
    }
    if (props.lengthVariation !== undefined) {
      this.config.lengthVariation = props.lengthVariation;
    }
    if (props.lineThickness !== undefined) {
      this.config.lineThickness = props.lineThickness;
    }
    if (props.angleVariation !== undefined) {
      this.config.angleVariation = props.angleVariation;
    }
    if (props.baseAngle !== undefined) {
      this.config.baseAngle = props.baseAngle;
    }
    if (props.crosshatchChance !== undefined && props.crosshatchChance !== this.config.crosshatchChance) {
      this.config.crosshatchChance = props.crosshatchChance;
      regenerateLines = true;
    }
    if (props.fillRatio !== undefined && props.fillRatio !== this.config.fillRatio) {
      this.config.fillRatio = props.fillRatio;
      regenerateLines = true;
    }

    if (regenerateLines && this.p5Instance) {
      this.generateLines(this.p5Instance);
    }
  }
}
