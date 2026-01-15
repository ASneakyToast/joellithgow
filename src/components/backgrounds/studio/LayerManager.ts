/**
 * LayerManager - Central state manager for Background Studio
 * Handles layer CRUD operations, canvas management, and event coordination
 */

import type { NoiseType } from '../types';
import type { LayerConfig, LayerPatternConfig } from './types';
import {
  generateLayerId,
  generateLayerName,
  PATTERN_DEFAULTS,
  PATTERN_NAMES
} from './types';
import {
  createLayerContainer,
  createPatternManager,
  getPatternDefaults,
  type StudioManagerConfig
} from './managerFactory';
import type { NoiseBackgroundManager } from '../noise/NoiseBackgroundManager';

/** Maximum number of layers allowed (performance limit) */
const MAX_LAYERS = 6;

/**
 * LayerManager extends EventTarget for event-driven communication
 * with LayersPanel and PropertiesPanel components
 */
export class LayerManager extends EventTarget {
  private container: HTMLElement;
  private layers: Map<string, LayerConfig> = new Map();
  private managers: Map<string, NoiseBackgroundManager<StudioManagerConfig>> = new Map();
  private selectedLayerId: string | null = null;
  private layerOrder: string[] = []; // Maintains visual stacking order

  constructor(container: HTMLElement) {
    super();
    this.container = container;
  }

  /**
   * Add a new layer with the specified pattern type
   * @param patternType - The noise pattern to use
   * @param initialConfig - Optional initial configuration overrides
   * @returns The ID of the newly created layer, or null if max layers reached
   */
  addLayer(
    patternType: NoiseType,
    initialConfig?: Partial<LayerPatternConfig>
  ): string | null {
    if (this.layers.size >= MAX_LAYERS) {
      console.warn(`Maximum layer limit (${MAX_LAYERS}) reached`);
      this.dispatchEvent(new CustomEvent('max-layers-reached', {
        detail: { maxLayers: MAX_LAYERS }
      }));
      return null;
    }

    const id = generateLayerId();
    const existingNames = Array.from(this.layers.values()).map(l => l.name);
    const name = generateLayerName(patternType, existingNames);
    const zIndex = this.layerOrder.length + 1;

    // Merge defaults with any provided config
    const config: LayerPatternConfig = {
      ...getPatternDefaults(patternType),
      ...initialConfig
    };

    const layer: LayerConfig = {
      id,
      patternType,
      zIndex,
      name,
      config
    };

    // Create DOM elements
    const layerContainer = createLayerContainer(id, patternType, config, zIndex);
    this.container.appendChild(layerContainer);

    // Create and initialize the manager
    const manager = createPatternManager(layerContainer, patternType);
    manager.init();

    // Store references
    this.layers.set(id, layer);
    this.managers.set(id, manager);
    this.layerOrder.push(id);

    // Store manager reference on container for debugging
    (layerContainer as any)._webglManager = manager;
    (layerContainer as any)._layerId = id;

    // Emit event
    this.dispatchEvent(new CustomEvent('layer-added', { detail: layer }));
    this.dispatchEvent(new CustomEvent('layers-changed', {
      detail: this.getAllLayers()
    }));

    // Auto-select the new layer
    this.selectLayer(id);

    return id;
  }

  /**
   * Remove a layer by ID
   */
  removeLayer(id: string): boolean {
    const layer = this.layers.get(id);
    const manager = this.managers.get(id);

    if (!layer || !manager) {
      return false;
    }

    // Destroy the WebGL manager
    manager.destroy();

    // Remove DOM element
    const layerContainer = document.getElementById(`layer-${id}`);
    if (layerContainer) {
      layerContainer.remove();
    }

    // Remove from storage
    this.layers.delete(id);
    this.managers.delete(id);

    // Remove from order and update z-indices
    const orderIndex = this.layerOrder.indexOf(id);
    if (orderIndex > -1) {
      this.layerOrder.splice(orderIndex, 1);
      this.updateZIndices();
    }

    // If this was the selected layer, select another
    if (this.selectedLayerId === id) {
      const remainingLayers = this.layerOrder;
      if (remainingLayers.length > 0) {
        // Select the layer that took its place, or the last one
        const newSelectedIndex = Math.min(orderIndex, remainingLayers.length - 1);
        this.selectLayer(remainingLayers[newSelectedIndex]);
      } else {
        this.selectLayer(null);
      }
    }

    // Emit events
    this.dispatchEvent(new CustomEvent('layer-removed', { detail: id }));
    this.dispatchEvent(new CustomEvent('layers-changed', {
      detail: this.getAllLayers()
    }));

    return true;
  }

  /**
   * Select a layer by ID (or deselect with null)
   */
  selectLayer(id: string | null): void {
    if (id !== null && !this.layers.has(id)) {
      console.warn(`Layer not found: ${id}`);
      return;
    }

    this.selectedLayerId = id;

    // Emit event with the selected layer's full data
    const selectedLayer = id ? this.layers.get(id) : null;
    this.dispatchEvent(new CustomEvent('layer-selected', {
      detail: { id, layer: selectedLayer }
    }));
  }

  /**
   * Get the currently selected layer
   */
  getSelectedLayer(): LayerConfig | null {
    if (!this.selectedLayerId) return null;
    return this.layers.get(this.selectedLayerId) || null;
  }

  /**
   * Get the manager for the selected layer
   */
  getSelectedLayerManager(): NoiseBackgroundManager<StudioManagerConfig> | null {
    if (!this.selectedLayerId) return null;
    return this.managers.get(this.selectedLayerId) || null;
  }

  /**
   * Get a layer by ID
   */
  getLayer(id: string): LayerConfig | null {
    return this.layers.get(id) || null;
  }

  /**
   * Get the manager for a specific layer
   */
  getLayerManager(id: string): NoiseBackgroundManager<StudioManagerConfig> | null {
    return this.managers.get(id) || null;
  }

  /**
   * Get all layers in visual stacking order (bottom to top)
   */
  getAllLayers(): LayerConfig[] {
    return this.layerOrder.map(id => this.layers.get(id)!).filter(Boolean);
  }

  /**
   * Get layer count
   */
  getLayerCount(): number {
    return this.layers.size;
  }

  /**
   * Check if at max layers
   */
  isAtMaxLayers(): boolean {
    return this.layers.size >= MAX_LAYERS;
  }

  /**
   * Update a layer's pattern configuration
   */
  updateLayerConfig(id: string, config: Partial<LayerPatternConfig>): void {
    const layer = this.layers.get(id);
    const manager = this.managers.get(id);

    if (!layer || !manager) {
      console.warn(`Layer not found: ${id}`);
      return;
    }

    // Update stored config
    Object.assign(layer.config, config);

    // Update the WebGL uniforms
    manager.updateUniforms(config as any);

    // Emit event
    this.dispatchEvent(new CustomEvent('layer-updated', {
      detail: { id, config }
    }));
  }

  /**
   * Rename a layer
   */
  renameLayer(id: string, name: string): void {
    const layer = this.layers.get(id);
    if (!layer) return;

    layer.name = name;

    this.dispatchEvent(new CustomEvent('layer-renamed', {
      detail: { id, name }
    }));
    this.dispatchEvent(new CustomEvent('layers-changed', {
      detail: this.getAllLayers()
    }));
  }

  /**
   * Reorder a layer to a new position
   * @param id - Layer ID to move
   * @param newIndex - New position in the stack (0 = bottom)
   */
  reorderLayer(id: string, newIndex: number): void {
    const currentIndex = this.layerOrder.indexOf(id);
    if (currentIndex === -1) return;

    // Clamp new index
    newIndex = Math.max(0, Math.min(newIndex, this.layerOrder.length - 1));

    if (currentIndex === newIndex) return;

    // Remove from current position
    this.layerOrder.splice(currentIndex, 1);
    // Insert at new position
    this.layerOrder.splice(newIndex, 0, id);

    // Update z-indices
    this.updateZIndices();

    // Emit event
    this.dispatchEvent(new CustomEvent('layer-reordered', {
      detail: { id, newIndex }
    }));
    this.dispatchEvent(new CustomEvent('layers-changed', {
      detail: this.getAllLayers()
    }));
  }

  /**
   * Move a layer up in the stack (towards the viewer)
   */
  moveLayerUp(id: string): void {
    const currentIndex = this.layerOrder.indexOf(id);
    if (currentIndex < this.layerOrder.length - 1) {
      this.reorderLayer(id, currentIndex + 1);
    }
  }

  /**
   * Move a layer down in the stack (away from viewer)
   */
  moveLayerDown(id: string): void {
    const currentIndex = this.layerOrder.indexOf(id);
    if (currentIndex > 0) {
      this.reorderLayer(id, currentIndex - 1);
    }
  }

  /**
   * Update z-indices after reordering
   */
  private updateZIndices(): void {
    this.layerOrder.forEach((id, index) => {
      const layer = this.layers.get(id);
      if (layer) {
        layer.zIndex = index + 1;
      }

      const container = document.getElementById(`layer-${id}`);
      if (container) {
        container.style.zIndex = String(index + 1);
      }
    });
  }

  /**
   * Duplicate an existing layer
   */
  duplicateLayer(id: string): string | null {
    const layer = this.layers.get(id);
    if (!layer) return null;

    return this.addLayer(layer.patternType, { ...layer.config });
  }

  /**
   * Export all layers as serializable data
   */
  exportLayers(): LayerConfig[] {
    return this.getAllLayers().map(layer => ({
      ...layer,
      config: { ...layer.config }
    }));
  }

  /**
   * Import layers from exported data
   */
  importLayers(layers: LayerConfig[]): void {
    // Clear existing layers
    this.clearAllLayers();

    // Add each layer
    for (const layer of layers) {
      this.addLayer(layer.patternType, layer.config);
    }
  }

  /**
   * Clear all layers
   */
  clearAllLayers(): void {
    const ids = [...this.layerOrder];
    for (const id of ids) {
      this.removeLayer(id);
    }
  }

  /**
   * Destroy the layer manager and clean up all resources
   */
  destroy(): void {
    this.clearAllLayers();
  }
}

// Export for global access pattern
declare global {
  interface Window {
    __studioLayerManager?: LayerManager;
  }
}

export { MAX_LAYERS };
