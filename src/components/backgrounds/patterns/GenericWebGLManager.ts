/**
 * Generic data-driven WebGL pattern manager
 * Replaces all pattern-specific manager classes by using the registry's
 * uniformFields to handle parsing, creation, and updates of uniforms.
 */

import { PatternBackgroundManager } from './PatternBackgroundManager';
import { createFBMUniforms } from './shaders/uniforms';
import type { PatternDefinition, UniformField } from './registry';
import { uniformNameFromKey } from './registry';

/** FBM keys handled separately via createFBMUniforms */
const FBM_KEYS = new Set(['octaves', 'lacunarity', 'gain']);

function parseFieldValue(field: UniformField, raw: string | undefined, defaultValue: unknown): unknown {
  if (raw === undefined || raw === '') return defaultValue;
  switch (field.type) {
    case 'int': return parseInt(raw, 10);
    case 'float': return parseFloat(raw);
    case 'bool': return raw !== 'false';
  }
}

export class GenericWebGLManager extends PatternBackgroundManager<Record<string, unknown>> {
  private patternDef: PatternDefinition;
  private fragmentShaderSource: string;

  constructor(container: HTMLElement, patternDef: PatternDefinition, fragmentShader: string) {
    // Temporarily store patternDef before super() since parsePatternConfig needs it
    // We use a workaround: set it on the instance before super calls parsePatternConfig
    // Actually, super() calls parsePatternConfig in the constructor, so we need the field set first.
    // TypeScript doesn't allow field access before super(), so we use Object.defineProperty trick.
    const tempContainer = container;
    // @ts-expect-error - We need patternDef set before super() calls parsePatternConfig
    GenericWebGLManager._pendingDef = patternDef;
    super(container);
    this.patternDef = patternDef;
    this.fragmentShaderSource = fragmentShader;
  }

  private static _pendingDef: PatternDefinition;

  private getPatternDef(): PatternDefinition {
    return this.patternDef || GenericWebGLManager._pendingDef;
  }

  protected getFragmentShader(): string {
    return this.fragmentShaderSource;
  }

  protected parsePatternConfig(container: HTMLElement): Record<string, unknown> {
    const def = this.getPatternDef();
    const config: Record<string, unknown> = {};
    for (const field of def.uniformFields) {
      const raw = container.dataset[field.key];
      config[field.key] = parseFieldValue(field, raw, def.defaults[field.key]);
    }
    return config;
  }

  protected createPatternUniforms(): Record<string, { value: unknown }> {
    const def = this.getPatternDef();
    const uniforms: Record<string, { value: unknown }> = {};

    // Add FBM uniforms if pattern supports it
    if (def.supportsFBM) {
      Object.assign(uniforms, createFBMUniforms({
        octaves: (this.config.octaves as number) || 4,
        lacunarity: (this.config.lacunarity as number) || 2.0,
        gain: (this.config.gain as number) || 0.5
      }));
    }

    // Add pattern-specific uniforms (skip FBM ones if already added)
    for (const field of def.uniformFields) {
      if (def.supportsFBM && FBM_KEYS.has(field.key)) continue;
      uniforms[uniformNameFromKey(field.key)] = { value: this.config[field.key] };
    }

    return uniforms;
  }

  protected updatePatternUniforms(props: Record<string, unknown>): void {
    if (!this.material) return;
    const def = this.getPatternDef();

    for (const field of def.uniformFields) {
      if (props[field.key] !== undefined) {
        this.config[field.key] = props[field.key];
        const uName = uniformNameFromKey(field.key);
        if (this.material.uniforms[uName]) {
          this.material.uniforms[uName].value = props[field.key];
        }
      }
    }
  }
}
