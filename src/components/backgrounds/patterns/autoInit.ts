/**
 * Auto-initializer for background pattern containers
 * Reads data-effect-type from DOM elements and creates the appropriate manager
 * using the registry's shaderImport/managerImport for lazy loading.
 */

import { getPatternByInternalId, type PatternDefinition } from './registry';
import type { GenericWebGLManager } from './GenericWebGLManager';

/** Initialize a single pattern container element */
export async function initPatternContainer(container: HTMLElement): Promise<void> {
  const effectType = container.dataset.effectType;
  if (!effectType) return;

  const patternDef = getPatternByInternalId(effectType);
  if (!patternDef) {
    console.warn(`Unknown pattern type: ${effectType}`);
    return;
  }

  if (patternDef.rendererEngine === 'webgl' && patternDef.shaderImport) {
    const [{ GenericWebGLManager: Manager }, shader] = await Promise.all([
      import('./GenericWebGLManager'),
      patternDef.shaderImport()
    ]);
    const manager = new Manager(container, patternDef, shader);
    await manager.init();
    (container as any)._webglManager = manager;
  } else if (patternDef.rendererEngine === 'p5js' && patternDef.managerImport) {
    const ManagerClass = await patternDef.managerImport();
    const manager = new ManagerClass(container);
    await manager.init();
    (container as any)._p5Manager = manager;
  }
}

/** Initialize all uninitialized pattern containers on the page */
export function initPatternContainers(): void {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll<HTMLElement>('[data-effect-type]').forEach(container => {
      // Skip if already initialized
      if ((container as any)._webglManager || (container as any)._p5Manager) return;
      initPatternContainer(container);
    });
  });
}
