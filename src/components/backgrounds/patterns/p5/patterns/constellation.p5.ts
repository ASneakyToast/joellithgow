/**
 * Constellation p5.js Pattern
 * Star map with connected nodes - efficient canvas-based implementation
 */

import type p5 from 'p5';
import { P5PatternManager } from '../P5PatternManager';
import type { ConstellationConfig, Star } from '../types';

export class ConstellationP5Manager extends P5PatternManager<ConstellationConfig> {
  private stars: Star[] = [];

  protected parsePatternConfig(container: HTMLElement): Partial<ConstellationConfig> {
    return {
      starCount: parseInt(container.dataset.starCount || '12', 10),
      pointSize: parseFloat(container.dataset.pointSize || '0.006'),
      connectionDistance: parseFloat(container.dataset.connectionDistance || '0.15'),
      lineThickness: parseFloat(container.dataset.lineThickness || '0.001'),
      lineFalloff: parseFloat(container.dataset.lineFalloff || '1.5'),
      twinkleIntensity: parseFloat(container.dataset.twinkleIntensity || '0.3'),
      driftSpeed: parseFloat(container.dataset.driftSpeed || '0.1')
    };
  }

  protected setup(p: p5): void {
    this.generateStars(p);
    p.clear();
  }

  private generateStars(p: p5): void {
    this.stars = [];
    for (let i = 0; i < this.config.starCount; i++) {
      this.stars.push({
        baseX: p.random(0, 1),
        baseY: p.random(0, 1),
        phase: p.random(0, p.TWO_PI),
        orbitSpeed: 0.5 + p.random(0.5)
      });
    }
  }

  protected draw(p: p5): void {
    const time = this.getElapsedTime() * this.config.speed;

    // Clear with transparent background
    p.clear();

    const colors = this.getThemeColors();
    const primary = this.hexToRgb(colors.primary);
    const secondary = this.hexToRgb(colors.secondary);

    // Calculate star positions with drift
    const positions = this.stars.map((star, i) => {
      const driftX = Math.sin(time * this.config.driftSpeed * star.orbitSpeed + star.phase) * 0.04;
      const driftY = Math.cos(time * this.config.driftSpeed * star.orbitSpeed * 0.7 + star.phase) * 0.04;

      // Twinkle effect
      const twinkle = 1 + Math.sin(i * 1.618 + time * 2) * this.config.twinkleIntensity;

      return {
        x: (star.baseX + driftX) * p.width,
        y: (star.baseY + driftY) * p.height,
        twinkle
      };
    });

    // Draw connections between nearby stars
    p.strokeWeight(this.config.lineThickness * p.width);
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = p.dist(positions[i].x, positions[i].y, positions[j].x, positions[j].y);
        const maxDist = this.config.connectionDistance * p.width;

        if (dist < maxDist) {
          const fade = 1 - Math.pow(dist / maxDist, this.config.lineFalloff);
          const alpha = fade * 0.4 * this.config.intensity * 255;

          // Gradient between primary and secondary colors
          const t = i / positions.length;
          const r = p.lerp(primary.r, secondary.r, t);
          const g = p.lerp(primary.g, secondary.g, t);
          const b = p.lerp(primary.b, secondary.b, t);

          p.stroke(r, g, b, alpha);
          p.line(positions[i].x, positions[i].y, positions[j].x, positions[j].y);
        }
      }
    }

    // Draw stars with glow effect
    p.noStroke();
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const size = this.config.pointSize * p.width * pos.twinkle;

      // Gradient color based on position
      const t = (pos.x / p.width + pos.y / p.height) / 2;
      const r = p.lerp(primary.r, secondary.r, t);
      const g = p.lerp(primary.g, secondary.g, t);
      const b = p.lerp(primary.b, secondary.b, t);

      // Glow effect - draw multiple layers with decreasing alpha
      for (let layer = 3; layer >= 0; layer--) {
        const layerSize = size * (1 + layer * 0.8);
        const layerAlpha = (this.config.intensity * 255) / (layer + 1);
        p.fill(r, g, b, layerAlpha);
        p.ellipse(pos.x, pos.y, layerSize, layerSize);
      }
    }
  }

  protected updatePatternConfig(props: Partial<ConstellationConfig>): void {
    let regenerateStars = false;

    if (props.starCount !== undefined && props.starCount !== this.config.starCount) {
      this.config.starCount = props.starCount;
      regenerateStars = true;
    }
    if (props.pointSize !== undefined) {
      this.config.pointSize = props.pointSize;
    }
    if (props.connectionDistance !== undefined) {
      this.config.connectionDistance = props.connectionDistance;
    }
    if (props.lineThickness !== undefined) {
      this.config.lineThickness = props.lineThickness;
    }
    if (props.lineFalloff !== undefined) {
      this.config.lineFalloff = props.lineFalloff;
    }
    if (props.twinkleIntensity !== undefined) {
      this.config.twinkleIntensity = props.twinkleIntensity;
    }
    if (props.driftSpeed !== undefined) {
      this.config.driftSpeed = props.driftSpeed;
    }

    // Regenerate stars if count changed
    if (regenerateStars && this.p5Instance) {
      this.generateStars(this.p5Instance);
    }
  }
}
